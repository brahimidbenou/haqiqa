package com.haqiqa.haqiqa.exceptions.handlers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.haqiqa.haqiqa.exceptions.users.InvalidParamsException;
import com.haqiqa.haqiqa.exceptions.users.UsedEmailException;
import com.haqiqa.haqiqa.exceptions.users.UserNotFoundException;

@ControllerAdvice
public class UserExceptionHandler {

    @ExceptionHandler(UsedEmailException.class)
    public ResponseEntity<String> handleUsedEmailException(UsedEmailException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidParamsException.class)
    public ResponseEntity<String> handleInvalidParamsException(InvalidParamsException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<String> handleUserNotFoundException(UserNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}