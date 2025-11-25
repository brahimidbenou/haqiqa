package com.haqiqa.haqiqa.exceptions.users;

public class UsedEmailException extends Exception {
    public UsedEmailException() {
        super("This email is already in use");
    }

    public UsedEmailException(String message) {
        super(message);
    }
}
