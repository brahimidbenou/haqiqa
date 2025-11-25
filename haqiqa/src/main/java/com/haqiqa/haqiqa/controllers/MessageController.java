package com.haqiqa.haqiqa.controllers;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.haqiqa.haqiqa.dtos.messages.MessageDto;
import com.haqiqa.haqiqa.dtos.webClients.AskResponse;
import com.haqiqa.haqiqa.exceptions.messages.MessageNotFoundException;
import com.haqiqa.haqiqa.exceptions.messages.NoMessageFoundException;
import com.haqiqa.haqiqa.exceptions.videos.VideoNotFoundException;
import com.haqiqa.haqiqa.services.AiService;
import com.haqiqa.haqiqa.services.MessageService;

import jakarta.validation.Valid;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/messages")
public class MessageController {
    @Autowired
    private MessageService messageService;

    @Autowired
    private AiService aiService;

    @PostMapping("")
    public ResponseEntity<MessageDto> createMessage(@Valid @RequestBody MessageDto messageDto)
            throws VideoNotFoundException {
        MessageDto createdMessage = messageService.createMessage(messageDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdMessage);
    }

    @GetMapping(path = "/chat/{videoId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamBotResponse(@PathVariable UUID videoId, @RequestParam String query)
            throws VideoNotFoundException {
        return aiService.streamChat(videoId, query)
                .map(chunk -> ServerSentEvent.builder(chunk).build());
    }
    
    @PostMapping("/chat/{videoId}")
    public ResponseEntity<?> chatResponse(@PathVariable String videoId, @RequestParam String query) throws VideoNotFoundException {
        AskResponse response = aiService.askAboutVideo(videoId, query);
        return ResponseEntity.accepted().body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MessageDto> getMessage(@PathVariable UUID id) throws MessageNotFoundException {
        MessageDto message = messageService.getMessageById(id);
        return ResponseEntity.ok(message);
    }

    @GetMapping("/page/{videoId}")
    public ResponseEntity<Page<MessageDto>> getMessagePage(
            @PathVariable UUID videoId,
            @PageableDefault(size = 25, sort = "sentAt", direction = Sort.Direction.DESC) Pageable pageable
        ) throws NoMessageFoundException {
        Page<MessageDto> page = messageService.getMessagePage(videoId, pageable);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<MessageDto> updateMessage(@PathVariable UUID id, @Valid @RequestBody MessageDto messageDto) 
            throws MessageNotFoundException, VideoNotFoundException {
        MessageDto updatedMessage = messageService.updateMessage(id, messageDto);
        return ResponseEntity.ok(updatedMessage);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) throws MessageNotFoundException{
        messageService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
