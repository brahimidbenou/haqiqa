package com.haqiqa.haqiqa.services;

import java.io.InputStream;
import java.time.Duration;

public interface StorageService {
    String upload(String key, InputStream data, String contentType, long size) throws Exception;
    String presignGetUrl(String key, Duration ttl) throws Exception;
    void delete(String key) throws Exception;
}
