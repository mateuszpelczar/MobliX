package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    private final AdminService adminService;

    public AdminController(AdminService adminService){
        this.adminService = adminService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        logger.info("Pobieranie listy wszystkich użytkowników");
        List<UserDto> users = adminService.getAllUsers();
        logger.info("Pobrano {} użytkowników", users.size());
        return ResponseEntity.ok(users);
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Void> changeUserRole(@PathVariable Long userId, @RequestBody UserRoleChangeRequest request) {
        logger.info("Zmiana roli dla użytkownika o ID: {} na rolę: {}", userId, request.getRole());
        adminService.changeUserRole(userId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        logger.info("Usuwanie użytkownika o ID: {}", userId);
        adminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }
}
