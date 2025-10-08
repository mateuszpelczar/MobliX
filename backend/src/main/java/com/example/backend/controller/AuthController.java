package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UpdateUserRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.model.User;
import com.example.backend.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        String token = userService.register(request);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request) {
        String token = userService.login(request);
        return ResponseEntity.ok(token);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        
        // Konwersja User na UserDto
        UserDto userDto = new UserDto(
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
            user.getWebsite()
        );
        
        return ResponseEntity.ok(userDto);
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateCurrentUser(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody UpdateUserRequest request) {
        User user = userService.updateUser(userDetails.getUsername(), request);
        
        // Konwersja User na UserDto
        UserDto userDto = new UserDto(
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
            user.getWebsite()
        );
        
        return ResponseEntity.ok(userDto);
    }
}
