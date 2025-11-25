package com.haqiqa.haqiqa.exceptions.handlers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.haqiqa.haqiqa.exceptions.messages.MessageNotFoundException;
import com.haqiqa.haqiqa.exceptions.messages.NoMessageFoundException;

@ControllerAdvice
public class MessageExceptionHandler {
    @ExceptionHandler(MessageNotFoundException.class)
    public ResponseEntity<String> handleMessageNotFound(MessageNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
    
    @ExceptionHandler(NoMessageFoundException.class)
    public ResponseEntity<String> handleNoMessageFound(NoMessageFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}
