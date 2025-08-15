package com.example.backend.controller;

import com.example.backend.dto.UserProfileDto;
import com.example.backend.dto.UserProfileRequest;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('STAFF')")
public class UserController {

    private final UserService userService;
    
    public UserController(AdvertisementRepository advertisementRepository,
                          UserRepository userRepository,
                          UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDto> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileDto profile = userService.getUserProfile(username);
        return ResponseEntity.ok(profile);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<UserProfileDto> updateUserProfile(
            Authentication authentication,
            @RequestBody UserProfileRequest request) {
        String username = authentication.getName();
        UserProfileDto updatedProfile = userService.updateUserProfile(username, request);
        return ResponseEntity.ok(updatedProfile);
    }

    //ogloszenia
    
}

