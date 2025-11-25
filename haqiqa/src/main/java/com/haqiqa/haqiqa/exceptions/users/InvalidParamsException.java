package com.haqiqa.haqiqa.exceptions.users;

public class InvalidParamsException extends Exception {
    public InvalidParamsException() {
        super("Invalid parameters provided");
    }

    public InvalidParamsException(String message) {
        super(message);
    }
}
