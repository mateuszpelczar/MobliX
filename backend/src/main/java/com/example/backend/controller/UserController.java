package com.example.backend.controller;

import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('STAFF')")
public class UserController {

    @Autowired
    private UserService userService;

    // === ENDPOINTS OGŁOSZEŃ ===
    
    // @PostMapping("/advertisements")
    // public ResponseEntity<AdvertisementResponseDTO> createAdvertisement(
    //         @Valid @RequestBody CreateAdvertisementDTO createAdvertisementDTO) {
        
    //     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    //     String userEmail = authentication.getName();
        
    //     AdvertisementResponseDTO createdAdvertisement = 
    //         userService.createUserAdvertisement(createAdvertisementDTO, userEmail);
        
    //     return ResponseEntity.ok(createdAdvertisement);
    // }

    // @GetMapping("/advertisements")
    // public ResponseEntity<List<AdvertisementResponseDTO>> getCurrentUserAdvertisements() {
    //     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    //     String userEmail = authentication.getName();
        
    //     List<AdvertisementResponseDTO> advertisements = 
    //         userService.getCurrentUserAdvertisements(userEmail);
        
    //     return ResponseEntity.ok(advertisements);
    // }

    // @GetMapping("/advertisements/all")
    // public ResponseEntity<List<AdvertisementResponseDTO>> getAllAdvertisements() {
    //     List<AdvertisementResponseDTO> advertisements = userService.getAllUserAdvertisements();
    //     return ResponseEntity.ok(advertisements);
    // }

    // @GetMapping("/advertisements/{id}")
    // public ResponseEntity<AdvertisementResponseDTO> getAdvertisementById(@PathVariable Long id) {
    //     AdvertisementResponseDTO advertisement = userService.getUserAdvertisementById(id);
    //     return ResponseEntity.ok(advertisement);
    // }

    // @DeleteMapping("/advertisements/{id}")
    // public ResponseEntity<Void> deleteAdvertisement(@PathVariable Long id) {
    //     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    //     String userEmail = authentication.getName();
        
    //     userService.deleteUserAdvertisement(id, userEmail);
    //     return ResponseEntity.noContent().build();
   // }
}

