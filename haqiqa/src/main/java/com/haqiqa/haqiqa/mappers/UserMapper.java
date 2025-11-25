package com.haqiqa.haqiqa.mappers;

import org.springframework.stereotype.Component;

import com.haqiqa.haqiqa.dtos.users.UpdateUserDto;
import com.haqiqa.haqiqa.dtos.users.UserDto;
import com.haqiqa.haqiqa.models.User;

@Component
public class UserMapper {
    static public User toEntity(UserDto dto) {
        if (dto == null)
            return null;
        User user = new User();
        user.setAvatar(dto.getAvatar());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        return user;
    }

    static public UserDto toDto(User user) {
        if (user == null)
            return null;
        return new UserDto(user);
    }

    static public User toEntity(UpdateUserDto dto) {
        if (dto == null)
            return null;
        User user = new User();
        user.setAvatar(dto.getAvatar());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        return user;
    }

    static public UpdateUserDto toUpdateDto(User user) {
        if (user == null)
            return null;
        return new UpdateUserDto(user.getAvatar() ,user.getFirstName(), user.getLastName(), user.getEmail(), user.getPassword());
    }
}
