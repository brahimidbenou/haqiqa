package com.haqiqa.haqiqa.exceptions.handlers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.haqiqa.haqiqa.exceptions.videos.NoVideoFoundException;
import com.haqiqa.haqiqa.exceptions.videos.VideoNotFoundException;

@ControllerAdvice
public class VideoExceptionHandler {
    @ExceptionHandler(VideoNotFoundException.class)
    public ResponseEntity<String> handleVideoNotFound(VideoNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(NoVideoFoundException.class)
    public ResponseEntity<String> handleNoVideoFound(NoVideoFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
