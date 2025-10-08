package com.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.SellerInfoDTO;
import com.example.backend.model.Advertisement;
import com.example.backend.model.AdvertisementStatus;
import com.example.backend.service.AdvertisementService;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advertisements")
@CrossOrigin(origins = "http://localhost:5173")
public class AdvertisementController {

    private final AdvertisementService advertisementService;

    public AdvertisementController(AdvertisementService advertisementService) {
        this.advertisementService = advertisementService;
    }

    @GetMapping("/{id}/seller")
    public ResponseEntity<SellerInfoDTO> getSellerInfo(@PathVariable Long id, Authentication authentication) {
        boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
        SellerInfoDTO sellerInfo = advertisementService.getSellerInfo(id, isAuthenticated);
        return ResponseEntity.ok(sellerInfo);
    }

    @PostMapping
    public ResponseEntity<AdvertisementResponseDTO> createAdvertisement(
            @Valid @RequestBody CreateAdvertisementDTO createDto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        AdvertisementResponseDTO createdAd = advertisementService.createAdvertisement(createDto, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAd);
    }

    @GetMapping
    public ResponseEntity<List<AdvertisementResponseDTO>> getAllActiveAdvertisements() {
        List<AdvertisementResponseDTO> advertisements = advertisementService.getAllActiveAdvertisements();
        return ResponseEntity.ok(advertisements);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<AdvertisementResponseDTO>> getLatestAdvertisements() {
        List<AdvertisementResponseDTO> latest = advertisementService.getLatestAdvertisements(4);
        return ResponseEntity.ok(latest);
    }

    @GetMapping("/user")
    public ResponseEntity<List<AdvertisementResponseDTO>> getUserAdvertisements(Authentication authentication) {
        String userEmail = authentication.getName();
        List<AdvertisementResponseDTO> userAds = advertisementService.getAdvertisementsByUser(userEmail);
        return ResponseEntity.ok(userAds);
    }

    @GetMapping("/all")
    public ResponseEntity<List<AdvertisementResponseDTO>> getAllAdvertisements(Authentication authentication) {
        List<AdvertisementResponseDTO> allAds = advertisementService.getAllAdvertisements();
        return ResponseEntity.ok(allAds);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<Advertisement>> getPendingAdvertisements(Authentication authentication) {
        try {
            String role = authentication.getAuthorities().iterator().next().getAuthority();
            if (!role.equals("ROLE_STAFF") && !role.equals("ROLE_ADMIN")) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
            List<Advertisement> pendingAds = advertisementService.findByStatus(AdvertisementStatus.PENDING);
            return ResponseEntity.ok(pendingAds);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdvertisementResponseDTO> getAdvertisementById(@PathVariable Long id) {
        AdvertisementResponseDTO advertisement = advertisementService.getAdvertisementById(id);
        return ResponseEntity.ok(advertisement);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdvertisementResponseDTO> updateAdvertisementStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        String status = request.get("status");
        String userEmail = authentication.getName();
        AdvertisementResponseDTO updated = advertisementService.updateAdvertisementStatus(id, status, userEmail);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = advertisementService.saveImage(file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Blad podczas zapisywania zdjecia: " + e.getMessage()));
        }
    }

    @PostMapping(value = "/upload-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> uploadImages(@RequestParam("files") MultipartFile[] files) {
        try {
            List<String> imageUrls = advertisementService.saveImages(files);
            return ResponseEntity.ok(Map.of("imageUrls", imageUrls));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Blad podczas zapisywania zdjec: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdvertisement(@PathVariable Long id, Authentication authentication) {
        String userEmail = authentication.getName();
        advertisementService.deleteAdvertisement(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}
