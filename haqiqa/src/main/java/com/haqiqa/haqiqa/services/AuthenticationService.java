package com.haqiqa.haqiqa.services;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.haqiqa.haqiqa.dtos.users.LoginUserDto;
import com.haqiqa.haqiqa.dtos.users.RegisterUserDto;
import com.haqiqa.haqiqa.exceptions.users.InvalidParamsException;
import com.haqiqa.haqiqa.exceptions.users.UsedEmailException;
import com.haqiqa.haqiqa.models.User;
import com.haqiqa.haqiqa.repositories.UserRepository;

@Service
public class AuthenticationService {
    private final UserRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            UserRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User signup(RegisterUserDto input) throws UsedEmailException {
        if (userRepository.existsByEmail(input.getEmail())) {
            throw new UsedEmailException();
        }

        User user = new User();
        user.setFirstName(input.getFirstName());
        user.setLastName(input.getLastName());
        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));

        return userRepository.save(user);
    }

    public User authenticate(LoginUserDto input) throws InvalidParamsException {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()));

        User user = userRepository.findByEmail(input.getEmail()).orElse(null);
        if (user != null && checkPassword(input.getPassword(), user.getPassword())) {
            return user;
        } else {
            throw new InvalidParamsException();
        }
    }

    public boolean checkPassword(String rawPassword, String hashedPasswordFromDatabase) {
        return passwordEncoder.matches(rawPassword, hashedPasswordFromDatabase);
    }
}
