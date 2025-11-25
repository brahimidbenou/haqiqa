package com.haqiqa.haqiqa.dtos.videos;

import java.util.UUID;
import java.time.LocalDateTime;
import java.time.Duration;

public class VideoUrlDto {
    private UUID id;
    private String title;
    private String summary;
    private UUID userId;
    private LocalDateTime uploadedAt;
    private String url;
    private String key;
    private String thumbnail;
    private Duration duration;

    public VideoUrlDto() {
    }

    public VideoUrlDto(UUID id, String title, String summary, UUID userId, LocalDateTime uploadedAt, String url, String key, String thumbnail, Duration duration) {
        this.id = id;
        this.title = title;
        this.summary = summary;
        this.userId = userId;
        this.uploadedAt = uploadedAt;
        this.url = url;
        this.key = key;
        this.thumbnail = thumbnail;
        this.duration = duration;
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

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
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

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }
}
