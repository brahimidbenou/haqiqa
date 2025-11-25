package com.haqiqa.haqiqa.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import com.haqiqa.haqiqa.models.VideoStatus;

@Service
public class WebsocketNotifier {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void sendStatusUpdate(String videoId, VideoStatus status) {
        messagingTemplate.convertAndSend("/topic/videos/" + videoId, status.name());
    }
}
