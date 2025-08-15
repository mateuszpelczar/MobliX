package com.example.backend.service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.UserProfileDto;
import com.example.backend.dto.UserProfileRequest;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public String register(RegisterRequest request) {
    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    user.setCreatedAt(LocalDateTime.now());
    user.setUpdatedAt(LocalDateTime.now());

  
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
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public UserProfileDto getUserProfile(String username) {
        User user = getCurrentUser(username);
        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .dateOfBirth(user.getDateOfBirth())
                .street(user.getStreet())
                .city(user.getCity())
                .postalCode(user.getPostalCode())
                .country(user.getCountry())
                .companyName(user.getCompanyName())
                .taxId(user.getTaxId())
                .profilePublic(user.getProfilePublic())
                .showContactInAds(user.getShowContactInAds())
                .preferredContactMethod(user.getPreferredContactMethod())
                .newsletterSubscription(user.getNewsletterSubscription())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    
    public UserProfileDto updateUserProfile(String username, UserProfileRequest request) {
        User user = getCurrentUser(username);
        
        // Update personal data
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDateOfBirth(request.getDateOfBirth());
        
        // Update address data
        user.setStreet(request.getStreet());
        user.setCity(request.getCity());
        user.setPostalCode(request.getPostalCode());
        user.setCountry(request.getCountry());
        
        // Update company data
        user.setCompanyName(request.getCompanyName());
        user.setTaxId(request.getTaxId());
        
        // Update preferences
        user.setProfilePublic(request.getProfilePublic());
        user.setShowContactInAds(request.getShowContactInAds());
        user.setPreferredContactMethod(request.getPreferredContactMethod());
        user.setNewsletterSubscription(request.getNewsletterSubscription());
        
        // Update timestamp
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        return getUserProfile(savedUser.getUsername());
    }
}
