package com.example.backend.service;

import com.example.backend.dto.UserDto;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.others.UserRoleChangeRequest;
import com.example.backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {
    @Autowired
    private final UserRepository userRepository;
    public AdminService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserDto(
                        user.getId(),
                        user.getEmail(),
                        user.getUsername(),
                        user.getRole().toString(),
                        user.getAccountType(),
                        user.getFirstName(),
                        user.getLastName(),
                        user.getPhone(),
                        user.getCompanyName(),
                        user.getNip(),
                        user.getRegon(),
                        user.getAddress(),
                        user.getWebsite()))
                .collect(Collectors.toList());
    }

    public void changeUserRole(Long userId, UserRoleChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Użytkownik nie istnieje"));

        try {
            Role newRole = Role.valueOf(request.getRole().toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nieprawidłowa rola: " + request.getRole());
        }
    }

    public void deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Użytkownik nie istnieje");
        }
        userRepository.deleteById(userId);
    }
}
