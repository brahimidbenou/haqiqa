package com.haqiqa.haqiqa.services;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.haqiqa.haqiqa.dtos.users.UpdateUserDto;
import com.haqiqa.haqiqa.dtos.users.UserDto;
import com.haqiqa.haqiqa.exceptions.users.UsedEmailException;
import com.haqiqa.haqiqa.exceptions.users.UserNotFoundException;
import com.haqiqa.haqiqa.mappers.UserMapper;
import com.haqiqa.haqiqa.models.User;
import com.haqiqa.haqiqa.repositories.UserRepository;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto createUser(UserDto dto) throws UsedEmailException {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new UsedEmailException();
        }

        User user = UserMapper.toEntity(dto);
        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        User saved = userRepository.save(user);
        return UserMapper.toDto(saved);
    }

    public UserDto getUser(UUID id) throws UserNotFoundException {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            throw new UserNotFoundException();
        }
        return UserMapper.toDto(user);
    }

    public UserDto updateUser(UUID id, UpdateUserDto userDto) throws UserNotFoundException, UsedEmailException {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            throw new UserNotFoundException();
        }
        User user = optionalUser.get();
        String newPassword = userDto.getPassword();

        String hashedPassword = passwordEncoder.encode(newPassword);
        User newUser = UserMapper.toEntity(userDto);
        if (!user.getEmail().equals(newUser.getEmail()) && userRepository.existsByEmail(newUser.getEmail())) {
            throw new UsedEmailException();
        }
        if (newPassword == null || newPassword.isEmpty()) {
            hashedPassword = user.getPassword();
        }
        user.setAvatar(newUser.getAvatar());
        user.setFirstName(newUser.getFirstName());
        user.setLastName(newUser.getLastName());
        user.setEmail(newUser.getEmail());
        user.setPassword(hashedPassword);
        userRepository.save(user);
        return UserMapper.toDto(user);
    }

    public void deleteUser(UUID id) throws UserNotFoundException {
        if (!userRepository.existsById(id)) {
            throw new UserNotFoundException();
        }
        userRepository.deleteById(id);
    }
}
