package com.example.backend.controller;

import com.example.backend.dto.UserDto;
import com.example.backend.dto.UserRoleChangeRequest;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.service.LogService;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {
    
    private final UserService userService;
    private final LogService logService;

    public AdminController(UserService userService, LogService logService) {
        this.userService = userService;
        this.logService = logService;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream()
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
                        user.getWebsite()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> changeUserRole(
            @PathVariable Long userId,
            @RequestBody UserRoleChangeRequest request,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Pobierz dane użytkownika przed zmianą roli
            User targetUser = userService.getUserById(userId);
            Role oldRole = targetUser.getRole();
            
            User updatedUser = userService.changeUserRole(userId, request.getRole());
            
            // Log INFO - zmiana roli użytkownika
            logService.saveLog(
                "INFO",
                "admin",
                "Rola użytkownika zmieniona przez admina",
                "Użytkownik: " + targetUser.getEmail() + ", Stara rola: " + oldRole + ", Nowa rola: " + request.getRole() + ", Admin: " + adminEmail,
                "AdminController.changeUserRole",
                admin,
                ipAddress
            );
            
            UserDto userDto = new UserDto(
                    updatedUser.getId(),
                    updatedUser.getEmail(),
                    updatedUser.getUsername(),
                    updatedUser.getRole().toString(),
                    updatedUser.getAccountType(),
                    updatedUser.getFirstName(),
                    updatedUser.getLastName(),
                    updatedUser.getPhone(),
                    updatedUser.getCompanyName(),
                    updatedUser.getNip(),
                    updatedUser.getRegon(),
                    updatedUser.getAddress(),
                    updatedUser.getWebsite()
            );
            
            return ResponseEntity.ok(userDto);
            
        } catch (Exception e) {
            // Log ERROR - błąd zmiany roli
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "admin",
                "Błąd zmiany roli użytkownika",
                "ID użytkownika: " + userId + ", Błąd: " + e.getMessage() + ", Admin: " + adminEmail,
                "AdminController.changeUserRole",
                admin,
                ipAddress
            );
            
            throw e;
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Pobierz dane użytkownika przed usunięciem
            User targetUser = userService.getUserById(userId);
            String targetUserEmail = targetUser.getEmail();
            String targetUserRole = targetUser.getRole().toString();
            
            userService.deleteUser(userId);
            
            // Log WARN - usunięcie użytkownika (poważna akcja!)
            logService.saveLog(
                "WARN",
                "admin",
                "Użytkownik usunięty przez admina",
                "Usunięty użytkownik: " + targetUserEmail + ", Rola: " + targetUserRole + ", Admin: " + adminEmail,
                "AdminController.deleteUser",
                admin,
                ipAddress
            );
            
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            // Log ERROR - błąd usuwania użytkownika
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "admin",
                "Błąd usuwania użytkownika",
                "ID użytkownika: " + userId + ", Błąd: " + e.getMessage() + ", Admin: " + adminEmail,
                "AdminController.deleteUser",
                admin,
                ipAddress
            );
            
            throw e;
        }
    }
}