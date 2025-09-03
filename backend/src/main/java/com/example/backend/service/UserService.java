package com.example.backend.service;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AdvertisementService advertisementService;

    // === METODY AUTORYZACJI ===
    
    public String register(RegisterRequest request) {
    User user = new User();
    user.setUsername(request.getUsername());
    user.setEmail(request.getEmail());
    user.setPassword(passwordEncoder.encode(request.getPassword()));

  
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

    // === METODY OGŁOSZEŃ (delegacja do AdvertisementService) ===
    
    public AdvertisementResponseDTO createUserAdvertisement(CreateAdvertisementDTO dto, String userEmail) {
        return advertisementService.createAdvertisement(dto, userEmail);
    }

    public List<AdvertisementResponseDTO> getAllUserAdvertisements() {
        return advertisementService.getAllAdvertisements();
    }

    public AdvertisementResponseDTO getUserAdvertisementById(Long id) {
        return advertisementService.getAdvertisementById(id);
    }

    public List<AdvertisementResponseDTO> getCurrentUserAdvertisements(String userEmail) {
        return advertisementService.getUserAdvertisements(userEmail);
    }

    public void deleteUserAdvertisement(Long id, String userEmail) {
        advertisementService.deleteAdvertisement(id, userEmail);
    }
}
