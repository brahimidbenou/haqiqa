package com.haqiqa.haqiqa.controllers;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.haqiqa.haqiqa.dtos.videos.VideoDto;
import com.haqiqa.haqiqa.dtos.videos.VideoUrlDto;
import com.haqiqa.haqiqa.dtos.webClients.AnalyzeResponse;
import com.haqiqa.haqiqa.dtos.webClients.TranscribeResponse;
import com.haqiqa.haqiqa.exceptions.users.UserNotFoundException;
import com.haqiqa.haqiqa.exceptions.videos.NoVideoFoundException;
import com.haqiqa.haqiqa.exceptions.videos.VideoNotFoundException;
import com.haqiqa.haqiqa.models.VideoStatus;
import com.haqiqa.haqiqa.services.AiService;
import com.haqiqa.haqiqa.services.StorageService;
import com.haqiqa.haqiqa.services.VideoService;
import com.haqiqa.haqiqa.services.WebsocketNotifier;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/videos")
public class VideoController {
    private final VideoService videoService;
    private final StorageService storageService;
    private final AiService aiService;

    @Autowired
    private WebsocketNotifier websocketNotifier;

    public VideoController(VideoService videoService, StorageService storageService, AiService aiService) {
        this.videoService = videoService;
        this.storageService = storageService;
        this.aiService = aiService;
    }

    @PostMapping("")
    public ResponseEntity<VideoDto> createVideo(@Valid @RequestBody VideoDto videoDto) throws UserNotFoundException {
        VideoDto createdVideo = videoService.createVideo(videoDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVideo);
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VideoDto> createVideoMultipart(
            @RequestParam("video") MultipartFile video,
            @RequestParam("thumbnail") MultipartFile thumbnail,
            @RequestParam("title") String title,
            @RequestParam("summary") String summary,
            @RequestParam("userId") UUID userId) throws UserNotFoundException, Exception {
        
        
        String original = video.getOriginalFilename() == null ? "video" : video.getOriginalFilename();
        String thumbnailOrigin = thumbnail.getOriginalFilename() == null ? "thumbnail" : thumbnail.getOriginalFilename();
        String videoKey = "videos/" + UUID.randomUUID().toString() + "-" + original.replaceAll("[^a-zA-Z0-9._-]", "_");
        String thumbnailKey = "thumbnails/" + UUID.randomUUID().toString() + "-"
                + thumbnailOrigin.replaceAll("[^a-zA-Z0-9._-]", "_");

        storageService.upload(videoKey, video.getInputStream(), video.getContentType(), video.getSize());
        storageService.upload(thumbnailKey, thumbnail.getInputStream(), thumbnail.getContentType(),
                thumbnail.getSize());

        Duration duration;

        try (FFmpegFrameGrabber grabber = new FFmpegFrameGrabber(video.getInputStream())) {
            grabber.start();
            double durationSeconds = grabber.getLengthInTime() / 1_000_000.0;
            long secondsPart = (long) durationSeconds;
            long nanosPart = (long) ((durationSeconds - secondsPart) * 1_000_000_000);

            duration = Duration.ofSeconds(secondsPart, nanosPart);

            grabber.stop();
        }
        VideoDto createdVideo = videoService.createVideoWithUpload(videoKey, thumbnailKey, title, summary, userId, duration);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdVideo);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VideoUrlDto> getVideoById(@PathVariable UUID id) throws VideoNotFoundException, Exception {
        VideoDto video = videoService.getVideoById(id);
        Duration ttl = Duration.ofHours(1);
        String url = storageService.presignGetUrl(video.getObjectKey(), ttl);
        VideoUrlDto resp = new VideoUrlDto(video.getId(), video.getTitle(), video.getSummary(), video.getUserId(),
                video.getUploadedAt(), url, video.getObjectKey(), video.getThumbnail(),video.getDuration());
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/page/{userId}")
    public ResponseEntity<Page<VideoUrlDto>> getVideosPage(@PathVariable UUID userId, @PageableDefault(size=10) Pageable pageable) throws NoVideoFoundException, Exception {
        Page<VideoDto> videosPage = videoService.getVideosPage(userId, pageable);
        Duration ttl = Duration.ofHours(1);

        @SuppressWarnings("CallToPrintStackTrace")
        Page<VideoUrlDto> urlPage = videosPage.map(video -> {
            VideoUrlDto dto = new VideoUrlDto();
            dto.setId(video.getId());
            dto.setTitle(video.getTitle());
            dto.setSummary(video.getSummary());
            dto.setUploadedAt(video.getUploadedAt());
            dto.setDuration(video.getDuration());
            dto.setUserId(video.getUserId());
            dto.setKey(video.getObjectKey());
            dto.setThumbnail(video.getThumbnail());
            
            try {
                String url = storageService.presignGetUrl(video.getThumbnail(), ttl);
                dto.setUrl(url);
            } catch (Exception e) {
                dto.setUrl("");
                e.printStackTrace();
            }
            return dto;
        });
        return ResponseEntity.ok(urlPage);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<VideoDto> updateVideo(@PathVariable UUID id,
            @Valid @RequestBody VideoDto videoDto) throws VideoNotFoundException {
        VideoDto updatedVideo = videoService.updateVideo(id, videoDto);
        return ResponseEntity.ok(updatedVideo);
    }

    @PostMapping("/{id}/status")    
    @SuppressWarnings("UseSpecificCatch")
    public ResponseEntity<?> updateStatus(@PathVariable String id, @RequestBody Map<String, String> payload) 
            throws VideoNotFoundException, Exception {
        try {
            String statusStr = payload.get("status");
            VideoStatus status = VideoStatus.valueOf(statusStr);

            videoService.updateStatus(id, status);
            websocketNotifier.sendStatusUpdate(id, status);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid status or ID");
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteVideo(@PathVariable UUID id) throws VideoNotFoundException {
        videoService.deleteVideo(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/delete-file")
    public ResponseEntity<?> deleteVideoFile(@RequestParam String key) throws Exception {
        try {
            storageService.delete(key);
        } catch (Exception e){
            return ResponseEntity.internalServerError().body("invalid key");
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/start-transcription/{id}")
    @SuppressWarnings("UseSpecificCatch")
    public ResponseEntity<?> triggerTranscription(@PathVariable String id, @RequestParam String objectKey) 
            throws VideoNotFoundException, Exception {
        try {
            videoService.updateStatus(id,VideoStatus.PENDING);
            websocketNotifier.sendStatusUpdate(id, VideoStatus.PENDING);
            TranscribeResponse response = aiService.startTranscription(id, objectKey);
            return ResponseEntity.accepted().body(response);
        } catch (Exception e) {
            videoService.updateStatus(id, VideoStatus.FAILED);
            websocketNotifier.sendStatusUpdate(id, VideoStatus.FAILED);
            return ResponseEntity.status(502).body("Error communicating with AI service: " + e.getMessage());
        }
    }
    
    @PostMapping("analyze/{id}")
    public ResponseEntity<?> getVideoAnalysis(@PathVariable String id) {
        try {
            AnalyzeResponse response = aiService.analyzeVideo(id);
            if (response.error() != null) {
                return ResponseEntity.status(500).body(response.error());
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(504).body("AI service timeout or error: " + e.getMessage());
        }
    }
}