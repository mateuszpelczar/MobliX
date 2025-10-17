package com.example.backend.controller;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UpdateUserRequest;
import com.example.backend.dto.UserDto;
import com.example.backend.model.User;
import com.example.backend.service.LogService;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final LogService logService;

    public AuthController(UserService userService, LogService logService) {
        this.userService = userService;
        this.logService = logService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        try {
            // Rejestracja użytkownika
            String token = userService.register(request);
            
            // Pobierz utworzonego użytkownika do logowania
            User user = userService.getCurrentUser(request.getEmail());
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Log SUCCESS - pomyślna rejestracja
            logService.saveLog(
                "INFO",
                "authentication",
                "Użytkownik zarejestrowany pomyślnie",
                "Email: " + request.getEmail() + ", Typ konta: " + request.getAccountType(),
                "AuthController.register",
                user,
                ipAddress
            );
            
            return ResponseEntity.ok(token);
            
        } catch (Exception e) {
            // Log ERROR - błąd rejestracji
            String ipAddress = logService.getClientIP(httpRequest);
            logService.saveLog(
                "ERROR",
                "authentication",
                "Błąd rejestracji użytkownika",
                "Email: " + request.getEmail() + ", Błąd: " + e.getMessage(),
                "AuthController.register",
                null,
                ipAddress
            );
            
            throw e;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            // Logowanie użytkownika
            String token = userService.login(request);
            
            // Pobierz użytkownika do logowania
            User user = userService.getCurrentUser(request.getEmail());
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Log SUCCESS - pomyślne logowanie
            logService.saveLog(
                "INFO",
                "authentication",
                "Użytkownik zalogowany pomyślnie",
                "Email: " + request.getEmail(),
                "AuthController.login",
                user,
                ipAddress
            );
            
            return ResponseEntity.ok(token);
            
        } catch (Exception e) {
            // Log ERROR - błędne dane logowania
            String ipAddress = logService.getClientIP(httpRequest);
            logService.saveLog(
                "ERROR",
                "authentication",
                "Nieudana próba logowania",
                "Email: " + request.getEmail() + ", Błąd: " + e.getMessage(),
                "AuthController.login",
                null,
                ipAddress
            );
            
            throw e;
        }
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getCurrentUser(userDetails.getUsername());
        
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
            @RequestBody UpdateUserRequest request,
            HttpServletRequest httpRequest) {
        try {
            // Aktualizacja danych użytkownika
            User user = userService.updateUser(userDetails.getUsername(), request);
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Zbierz informacje o zmienionych polach
            StringBuilder changedFields = new StringBuilder();
            if (request.getFirstName() != null) changedFields.append("Imię, ");
            if (request.getLastName() != null) changedFields.append("Nazwisko, ");
            if (request.getPhone() != null) changedFields.append("Telefon, ");
            if (request.getCompanyName() != null) changedFields.append("Nazwa firmy, ");
            if (request.getNip() != null) changedFields.append("NIP, ");
            if (request.getRegon() != null) changedFields.append("REGON, ");
            if (request.getAddress() != null) changedFields.append("Adres, ");
            if (request.getWebsite() != null) changedFields.append("Strona www, ");
            
            String fields = changedFields.length() > 0 
                ? changedFields.substring(0, changedFields.length() - 2) 
                : "Brak zmian";
            
            // Log INFO - pomyślna aktualizacja profilu
            logService.saveLog(
                "INFO",
                "profile",
                "Dane użytkownika zaktualizowane",
                "Zmienione pola: " + fields,
                "AuthController.updateCurrentUser",
                user,
                ipAddress
            );
            
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
            
        } catch (Exception e) {
            // Log ERROR - błąd aktualizacji
            String ipAddress = logService.getClientIP(httpRequest);
            User user = userService.getCurrentUser(userDetails.getUsername());
            
            logService.saveLog(
                "ERROR",
                "profile",
                "Błąd aktualizacji danych użytkownika",
                "Błąd: " + e.getMessage(),
                "AuthController.updateCurrentUser",
                user,
                ipAddress
            );
            
            throw e;
        }
    }
}