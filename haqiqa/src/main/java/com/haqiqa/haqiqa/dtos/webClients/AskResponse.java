package com.haqiqa.haqiqa.dtos.webClients;

import java.util.List;


public record AskResponse(String answer, List<ReferenceDto> references, String error) {
    public record ReferenceDto(String text_chunk, Double start_time, Double end_time) {
    }
}
