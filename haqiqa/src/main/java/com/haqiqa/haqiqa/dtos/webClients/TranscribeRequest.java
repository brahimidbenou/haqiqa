package com.haqiqa.haqiqa.dtos.webClients;

public record TranscribeRequest(
        String video_id,
        String user_id,
        String object_key) {
}

