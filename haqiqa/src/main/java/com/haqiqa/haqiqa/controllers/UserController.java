package com.haqiqa.haqiqa.controllers;

import java.util.HashMap;
import java.util.UUID;
import java.time.Duration;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.haqiqa.haqiqa.dtos.users.UpdateUserDto;
import com.haqiqa.haqiqa.dtos.users.UserDto;
import com.haqiqa.haqiqa.exceptions.users.UsedEmailException;
import com.haqiqa.haqiqa.exceptions.users.UserNotFoundException;
import com.haqiqa.haqiqa.services.StorageService;
import com.haqiqa.haqiqa.services.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;
    private final StorageService storageService;

    public UserController(UserService userService, StorageService storageService) {
        this.userService = userService;
        this.storageService = storageService;
    }

    @PostMapping("")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) throws UsedEmailException {
        UserDto createdUser = userService.createUser(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) throws UserNotFoundException {
        return ResponseEntity.ok(userService.getUser(id));
    }
    
    @GetMapping("/avatar")
    public ResponseEntity<Map<String, String>> getUserAvatar(@RequestParam("key") String key) throws Exception {
        Duration ttl = Duration.ofHours(1);
        String url = storageService.presignGetUrl(key, ttl);

        Map<String, String> response = new HashMap<>();
        response.put("url", url);

        return ResponseEntity.ok(response);
    }



    @PutMapping(value = "/update/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserDto> updateUser(
            @PathVariable UUID id,
            @RequestPart(value = "avatar", required = false) MultipartFile avatar,
            @Valid @RequestPart("user") UpdateUserDto updateUserDto)
            throws UserNotFoundException, UsedEmailException, Exception {

        String avatarKey = updateUserDto.getAvatar();
        System.out.println("Incoming avatar key: " + avatarKey);

        if (avatar != null && !avatar.isEmpty()) {
            String name = (avatar.getOriginalFilename() == null)
                    ? "avatar"
                    : avatar.getOriginalFilename().replaceAll("[^a-zA-Z0-9._-]", "_");

            if (avatarKey == null || avatarKey.isBlank()) {
                avatarKey = "avatars/" + UUID.randomUUID() + "-" + name;
                updateUserDto.setAvatar(avatarKey);
            }

            storageService.upload(
                    avatarKey,
                    avatar.getInputStream(),
                    avatar.getContentType(),
                    avatar.getSize());

            System.out.println("Uploaded avatar: " + avatarKey);
        }

        UserDto updatedUser = userService.updateUser(id, updateUserDto);
        return ResponseEntity.ok(updatedUser);
    }    

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id) throws UserNotFoundException {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
