package com.haqiqa.haqiqa.services;

import java.io.InputStream;
import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.Result;
import io.minio.messages.Item;
import io.minio.http.Method;

@Service
public class MinioStorageService implements StorageService {
    private final MinioClient minio;
    private final String bucket;

    public MinioStorageService(
            @Value("${minio.url}") String url,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket}") String bucket) {
        this.minio = MinioClient.builder()
                .endpoint(url)
                .credentials(accessKey, secretKey)
                .build();
        this.bucket = bucket;
    }

    @Override
    public String upload(String key, InputStream data, String contentType, long size) throws Exception {
        PutObjectArgs args = PutObjectArgs.builder()
                .bucket(bucket)
                .object(key)
                .stream(data, size, -1)
                .contentType(contentType)
                .build();
        minio.putObject(args);
        return key;
    }

    @Override
    public String presignGetUrl(String key, Duration ttl) throws Exception {
        GetPresignedObjectUrlArgs args = GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(bucket)
                .object(key)
                .expiry((int) ttl.getSeconds())
                .build();
        return minio.getPresignedObjectUrl(args);
    }

    @Override
    public void delete(String key) throws Exception {
        RemoveObjectArgs args = RemoveObjectArgs.builder()
                .bucket(bucket)
                .object(key)
                .build();
        minio.removeObject(args);
    }

    @Override
    public void deleteAllFiles(String userId) throws Exception {
        ListObjectsArgs args = ListObjectsArgs.builder()
                .bucket(bucket)
                .prefix(userId)
                .recursive(true)
                .build();

        Iterable<Result<Item>> results = minio.listObjects(args);

        for (Result<Item> result : results) {
            Item item = result.get();
            System.out.println("Deleting " + item.objectName());
            minio.removeObject(RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(item.objectName())
                    .build());
        }
    }
}
