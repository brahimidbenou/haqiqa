package com.haqiqa.haqiqa.exceptions.users;

public class UserNotFoundException extends Exception {
    public UserNotFoundException() {
        super("User not found");
    }
    
}
