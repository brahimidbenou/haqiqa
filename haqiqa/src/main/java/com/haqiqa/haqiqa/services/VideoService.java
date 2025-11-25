package com.haqiqa.haqiqa.services;

import java.util.UUID;
import java.time.Duration;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.haqiqa.haqiqa.dtos.videos.VideoDto;
import com.haqiqa.haqiqa.exceptions.users.UserNotFoundException;
import com.haqiqa.haqiqa.exceptions.videos.NoVideoFoundException;
import com.haqiqa.haqiqa.exceptions.videos.VideoNotFoundException;
import com.haqiqa.haqiqa.mappers.VideoMapper;
import com.haqiqa.haqiqa.models.User;
import com.haqiqa.haqiqa.models.Video;
import com.haqiqa.haqiqa.models.VideoStatus;
import com.haqiqa.haqiqa.repositories.UserRepository;
import com.haqiqa.haqiqa.repositories.VideoRepository;

import jakarta.transaction.Transactional;

@Service
public class VideoService {
    private final VideoRepository videoRepository;
    private final UserRepository userRepository;

    public VideoService(VideoRepository videoRepository, UserRepository userRepository) {
        this.videoRepository = videoRepository;
        this.userRepository = userRepository;
    }

    public VideoDto createVideo(VideoDto dto) throws UserNotFoundException {
        if (dto == null)
            return null;
        if (dto.getUserId() == null) {
            throw new IllegalArgumentException("userId is required to create a video");
        }
        if (!userRepository.existsById(dto.getUserId())) {
            throw new UserNotFoundException();
        }

        User user = userRepository.findById(dto.getUserId()).orElse(null);

        Video video = VideoMapper.toEntity(dto);
        video.setUser(user);
        Video savedVideo = videoRepository.save(video);
        return VideoMapper.toDto(savedVideo);
    }

    @Transactional
    public VideoDto createVideoWithUpload(String key, String thumbnail, String title, String summary, UUID userId, Duration duration) throws UserNotFoundException {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            throw new UserNotFoundException();
        }
        Video video = new Video();
        video.setTitle(title);
        video.setSummary(summary);
        video.setObjectKey(key);
        video.setThumbnail(thumbnail);
        video.setUser(user);
        video.setDuration(duration);
        Video savedVideo = videoRepository.save(video);
        return VideoMapper.toDto(savedVideo);
    }

    public VideoDto getVideoById(UUID id) throws VideoNotFoundException {
        Video video = videoRepository.findById(id).orElse(null);
        if (video == null) {
            throw new VideoNotFoundException();
        }
        return VideoMapper.toDto(video);
    }

    public Page<VideoDto> getVideosPage(UUID userId, Pageable pageable) throws NoVideoFoundException {
        Page<Video> videosPage = videoRepository.findAllByUserId(userId, pageable);
        if (videosPage.isEmpty()) {
            throw new NoVideoFoundException();
        }
        return videosPage.map(VideoMapper::toDto);
    }

    public VideoDto updateVideo(UUID id, VideoDto dto) throws VideoNotFoundException {
        Video video = videoRepository.findById(id).orElse(null);
        if (video == null) {
            throw new VideoNotFoundException();
        }
        if (dto.getTitle() != null)
            video.setTitle(dto.getTitle());
        if (dto.getSummary() != null)
            video.setSummary(dto.getSummary());
        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            video.setUser(user);
        }
        videoRepository.save(video);
        return VideoMapper.toDto(video);
    }

    public void updateStatus(String id, VideoStatus videoStatus) throws VideoNotFoundException {
        UUID videoId = UUID.fromString(id);
        Video video = videoRepository.findById(videoId).orElse(null);
        if (video == null) {
            throw new VideoNotFoundException();
        }
        video.setStatus(videoStatus);
        videoRepository.save(video);
    }

    public void deleteVideo(UUID id) throws VideoNotFoundException {
        if (!videoRepository.existsById(id)) {
            throw new VideoNotFoundException();
        }
        videoRepository.deleteById(id);
    }
}
