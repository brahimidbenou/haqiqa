package com.haqiqa.haqiqa.mappers;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.haqiqa.haqiqa.dtos.videos.VideoDto;
import com.haqiqa.haqiqa.models.Video;

@Component
public class VideoMapper {
    public static VideoDto toDto(Video video) {
        UUID userId = null;
        if (video.getUser() != null)
            userId = video.getUser().getId();
        return new VideoDto(
                        video.getId(),
                        video.getTitle(),
                        video.getSummary(),
                        userId,
                        video.getObjectKey(),
                        video.getThumbnail(),
                        video.getUploadedAt(),
                        video.getDuration(),
                        video.getStatus()             
                    );

    }

    public static Video toEntity(VideoDto videoDto) {
        Video video = new Video();
        video.setId(videoDto.getId());
        video.setTitle(videoDto.getTitle());
        video.setSummary(videoDto.getSummary());
        video.setObjectKey(videoDto.getObjectKey());
        video.setThumbnail(videoDto.getThumbnail());
        video.setUploadedAt(videoDto.getUploadedAt());
        video.setDuration(videoDto.getDuration());
        video.setStatus(videoDto.getStatus());
        return video;
    }
}
