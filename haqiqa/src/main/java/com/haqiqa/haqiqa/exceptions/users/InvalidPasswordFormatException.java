package com.haqiqa.haqiqa.exceptions.users;

public class InvalidPasswordFormatException extends Exception {
    public InvalidPasswordFormatException() {
        super("Password must be at least 6 characters long");
    }
}
