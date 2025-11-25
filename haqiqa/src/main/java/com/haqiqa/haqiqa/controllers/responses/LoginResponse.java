package com.haqiqa.haqiqa.controllers.responses;

import com.haqiqa.haqiqa.dtos.users.UserInfo;

public class LoginResponse {
    private String token;
    private long expiresIn;
    private UserInfo userInfo;

    public LoginResponse() {
    }

    public String getToken() {
        return this.token;
    }

    public long getExpiresIn() {
        return this.expiresIn;
    }

    public UserInfo getUserInfo() {
        return this.userInfo;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public void setUserInfo(UserInfo userInfo) {
        this.userInfo = userInfo;
    }
}
