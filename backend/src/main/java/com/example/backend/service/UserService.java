package com.example.backend.service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UpdateUserRequest;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }
 

    // === METODY AUTORYZACJI ===
    
    public String register(RegisterRequest request) {
    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    // Ustawienie nowych pól
    user.setAccountType(request.getAccountType());
    user.setFirstName(request.getFirstName());
    user.setLastName(request.getLastName());
    user.setPhone(request.getPhone());
    
    // Pola firmowe (tylko dla kont business)
    if ("business".equals(request.getAccountType())) {
        user.setCompanyName(request.getCompanyName());
        user.setNip(request.getNip());
        user.setRegon(request.getRegon());
        user.setAddress(request.getAddress());
        user.setWebsite(request.getWebsite());
    }

  
    long userCount = userRepository.count();

    if (userCount == 0) {
        user.setRole(Role.ADMIN);  
    } else {
        user.setRole(Role.USER);  
    }

    userRepository.save(user);
    return jwtService.generateToken(user);
}

    public String login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isPresent() && passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            return jwtService.generateToken(userOpt.get());
        }
        throw new RuntimeException("Invalid credentials");
    }

    public User getCurrentUser(String username) {
        return userRepository.findByEmail(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User updateUser(String email, UpdateUserRequest request) {
        User user = findByEmail(email);
        
        // Aktualizacja podstawowych danych
        if (request.getAccountType() != null) {
            user.setAccountType(request.getAccountType());
        }
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        
        // Aktualizacja hasła (jeśli podane)
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        
        // Aktualizacja danych firmowych
        if ("business".equals(request.getAccountType())) {
            if (request.getCompanyName() != null) {
                user.setCompanyName(request.getCompanyName());
            }
            if (request.getNip() != null) {
                user.setNip(request.getNip());
            }
            if (request.getRegon() != null) {
                user.setRegon(request.getRegon());
            }
            if (request.getAddress() != null) {
                user.setAddress(request.getAddress());
            }
            if (request.getWebsite() != null) {
                user.setWebsite(request.getWebsite());
            }
        } else {
            // Jeśli zmiana na konto osobiste, wyczyść dane firmowe
            user.setCompanyName(null);
            user.setNip(null);
            user.setRegon(null);
            user.setAddress(null);
            user.setWebsite(null);
        }
        
        return userRepository.save(user);
    }
}

    
