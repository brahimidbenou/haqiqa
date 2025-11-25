package com.haqiqa.haqiqa.services;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.haqiqa.haqiqa.dtos.messages.MessageDto;
import com.haqiqa.haqiqa.exceptions.messages.MessageNotFoundException;
import com.haqiqa.haqiqa.exceptions.messages.NoMessageFoundException;
import com.haqiqa.haqiqa.exceptions.videos.VideoNotFoundException;
import com.haqiqa.haqiqa.mappers.MessageMapper;
import com.haqiqa.haqiqa.models.Message;
import com.haqiqa.haqiqa.models.Video;
import com.haqiqa.haqiqa.repositories.VideoRepository;
import com.haqiqa.haqiqa.repositories.MessageRepository;

@Service
public class MessageService {
    @Autowired
    private VideoRepository videoRepository;

    @Autowired
    private MessageRepository messageRepository;

    public MessageDto createMessage(MessageDto dto) throws VideoNotFoundException {
        if (dto == null) {
            return null;
        }
        if (!videoRepository.existsById(dto.getVideoId())) {
            throw new VideoNotFoundException();
        }

        Video video = videoRepository.findById(dto.getVideoId()).orElse(null);

        Message message = MessageMapper.toEntity(dto);
        message.setVideo(video);
        Message savedMessage = messageRepository.save(message);
        return MessageMapper.toDto(savedMessage);
    }

    public MessageDto getMessageById(UUID id) throws MessageNotFoundException {
        Message message = messageRepository.findById(id).orElse(null);
        if (message == null) {
            throw new MessageNotFoundException();
        }
        return MessageMapper.toDto(message);
    }

    public Page<MessageDto> getMessagePage(UUID videoId, Pageable pageable) throws NoMessageFoundException {
        Page<Message> messagePage = messageRepository.findAllByVideoId(videoId, pageable);
        if (messagePage.isEmpty()) {
            throw new NoMessageFoundException();
        }
        return messagePage.map(MessageMapper::toDto);
    }

    public MessageDto updateMessage(UUID id, MessageDto dto) throws MessageNotFoundException, VideoNotFoundException {
        Message message = messageRepository.findById(id).orElse(null);
        if (message == null) {
            throw new MessageNotFoundException();
        }
        if (dto.getText() != null)
            message.setText(dto.getText());
        if (dto.getVideoId() != null) {
            Video video = videoRepository.findById(dto.getVideoId()).orElseThrow(() -> new VideoNotFoundException());
            message.setVideo(video);
        }
        messageRepository.save(message);
        return MessageMapper.toDto(message);
    }

    public void deleteMessage(UUID id) throws MessageNotFoundException {
        if (!messageRepository.existsById(id)) {
            throw new MessageNotFoundException();
        }
        messageRepository.deleteById(id);
    } 
}
