package com.haqiqa.haqiqa.mappers;

import java.util.UUID;

import org.springframework.stereotype.Component;

import com.haqiqa.haqiqa.dtos.messages.MessageDto;
import com.haqiqa.haqiqa.models.Message;

@Component
public class MessageMapper {
    public static MessageDto toDto(Message message) {
        UUID videoId = null;
        if (message.getVideo() != null)
            videoId = message.getVideo().getId();
        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setText(message.getText());
        dto.setSender(message.getSender());
        dto.setSentAt(message.getSentAt());
        dto.setVideoId(videoId);
        return dto;
    }

    public static Message toEntity(MessageDto dto) {
        Message message = new Message();
        message.setId(dto.getId());
        message.setText(dto.getText());
        message.setSender(dto.getSender());
        message.setSentAt(dto.getSentAt());
        return message;
    }
}
