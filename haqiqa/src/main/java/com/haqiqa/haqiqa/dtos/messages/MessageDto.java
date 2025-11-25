package com.haqiqa.haqiqa.dtos.messages;

import java.time.LocalDateTime;
import java.util.UUID;

import com.haqiqa.haqiqa.models.Sender;

public class MessageDto {
    private UUID id;
    private String text;
    private Sender sender;
    private LocalDateTime sentAt;
    private UUID videoId;

    public MessageDto() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Sender getSender() {
        return sender;
    }

    public void setSender(Sender sender) {
        this.sender = sender;
    }

    public UUID getVideoId() {
        return videoId;
    }

    public void setVideoId(UUID videoId) {
        this.videoId = videoId;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }


}
