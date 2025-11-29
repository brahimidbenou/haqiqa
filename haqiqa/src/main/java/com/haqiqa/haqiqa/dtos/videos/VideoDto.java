package com.haqiqa.haqiqa.dtos.videos;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

import com.haqiqa.haqiqa.models.VideoStatus;

public class VideoDto {
    private UUID id;
    private String title;
    private String summary;
    private UUID userId;
    private String objectKey;
    private String thumbnail;
    private LocalDateTime uploadedAt;
    private Duration duration;
    private VideoStatus status;

    public VideoDto() {
    }

    public VideoDto(UUID id, String title, String summary, UUID userId, String objectKey, String thumbnail, 
            LocalDateTime uploadedAt, Duration duration, VideoStatus status) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.userId = userId;
        this.objectKey = objectKey;
        this.thumbnail = thumbnail;
        this.uploadedAt = uploadedAt;
        this.duration = duration;
        this.status = status;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    public Duration getDuration() {
        return duration;
    }

    public void setDuration(Duration duration) {
        this.duration = duration;
    }

    public VideoStatus getStatus() {
        return status;
    }

    public void setStatus(VideoStatus status) {
        this.status = status;
    }
}
