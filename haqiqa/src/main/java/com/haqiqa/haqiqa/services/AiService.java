package com.haqiqa.haqiqa.services;

import java.time.Duration;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.haqiqa.haqiqa.dtos.webClients.AnalyzeRequest;
import com.haqiqa.haqiqa.dtos.webClients.AnalyzeResponse;
import com.haqiqa.haqiqa.dtos.webClients.AskResponse;
import com.haqiqa.haqiqa.dtos.webClients.AskRequest;
import com.haqiqa.haqiqa.dtos.webClients.TranscribeRequest;
import com.haqiqa.haqiqa.dtos.webClients.TranscribeResponse;
import com.haqiqa.haqiqa.exceptions.videos.VideoNotFoundException;
import com.haqiqa.haqiqa.models.Message;
import com.haqiqa.haqiqa.models.Sender;
import com.haqiqa.haqiqa.models.Video;
import com.haqiqa.haqiqa.repositories.MessageRepository;
import com.haqiqa.haqiqa.repositories.VideoRepository;

import reactor.core.publisher.Flux;

@Service
public class AiService {
    private final WebClient aiServiceWebClient;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private VideoRepository videoRepository;

    private static final Duration ASYNC_TIMEOUT = Duration.ofSeconds(60);
    private static final Duration LLM_TIMEOUT = Duration.ofSeconds(120);

    public AiService(WebClient aiServiceWebClient) {
        this.aiServiceWebClient = aiServiceWebClient;
    }

    public TranscribeResponse startTranscription(String videoId, String userId, String objectKey) {
        TranscribeRequest requestPayload = new TranscribeRequest(videoId, userId, objectKey);

        return aiServiceWebClient
                .post()
                .uri("/transcribe")
                .bodyValue(requestPayload)
                .retrieve()
                .bodyToMono(TranscribeResponse.class)
                .timeout(ASYNC_TIMEOUT)
                .block();
    }

    public AnalyzeResponse analyzeVideo(String videoId) {
        AnalyzeRequest requestPayload = new AnalyzeRequest(videoId);

        return aiServiceWebClient
                .post()
                .uri("/analyze")
                .bodyValue(requestPayload)
                .retrieve()
                .bodyToMono(AnalyzeResponse.class)
                .timeout(LLM_TIMEOUT)
                .block();
    }

    public AskResponse askAboutVideo(String videoId, String query) throws VideoNotFoundException {
        UUID id = UUID.fromString(videoId);

        Video video = videoRepository.findById(id)
                .orElseThrow(VideoNotFoundException::new);

        AskRequest request = new AskRequest(videoId, query);

        AskResponse response = aiServiceWebClient
                .post()
                .uri("/ask")
                .bodyValue(request)
                .retrieve()
                .bodyToMono(AskResponse.class)
                .block();

        if (response != null) {
            Message message = new Message();
            message.setSender(Sender.BOT);
            message.setVideo(video);
            message.setText(response.answer());
            messageRepository.save(message);
        }

        return response;
    }

    public Flux<String> streamChat(UUID videoId, String text) throws VideoNotFoundException {
        Message message = new Message();
        message.setSender(Sender.BOT);
        Video video = videoRepository.findById(videoId).orElseThrow(
                () -> new VideoNotFoundException());
        message.setVideo(video);
        StringBuilder botResponseBuffer = new StringBuilder();

        return aiServiceWebClient
                .post()
                .uri("/ask/stream")
                .bodyValue(Map.of("query", text, "video_id", videoId.toString()))
                .accept(MediaType.TEXT_EVENT_STREAM)
                .retrieve()
                .bodyToFlux(String.class)
                .map(data -> {
                    if (data == null || "[DONE]".equals(data)) {
                        return "";
                    }

                    botResponseBuffer.append(data);
                    return data;
                })
                .filter(chunk -> !chunk.isEmpty())
                .doOnComplete(() -> {
                    message.setText(botResponseBuffer.toString());
                    messageRepository.save(message);
                });
    }

    public void deleteVideoCollection(String videoId) {
        aiServiceWebClient
            .method(HttpMethod.DELETE)
            .uri("/delete")
            .bodyValue(Map.of("video_id", videoId))
            .retrieve()
            .bodyToMono(Void.class)
            .block();
    }

    public void deleteCollections(String userId) {
        aiServiceWebClient
            .method(HttpMethod.DELETE)
            .uri("/delete-collections")
            .bodyValue(Map.of("user_id", userId))
            .retrieve()
            .bodyToMono(Void.class)
            .block();
    }
}
