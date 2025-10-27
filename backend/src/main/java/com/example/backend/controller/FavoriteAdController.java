package com.example.backend.controller;

import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.service.FavoriteAdService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "http://localhost:5173")
public class FavoriteAdController {

    @Autowired
    private FavoriteAdService favoriteAdService;

    /**
     * Dodaj ogłoszenie do ulubionych
     */
    @PostMapping("/{advertisementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> addToFavorites(
            @PathVariable Long advertisementId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            favoriteAdService.addToFavorites(userEmail, advertisementId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Dodano do ulubionych");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Usuń ogłoszenie z ulubionych
     */
    @DeleteMapping("/{advertisementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> removeFromFavorites(
            @PathVariable Long advertisementId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            favoriteAdService.removeFromFavorites(userEmail, advertisementId);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Usunięto z ulubionych");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Sprawdź czy ogłoszenie jest w ulubionych
     */
    @GetMapping("/{advertisementId}/check")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @PathVariable Long advertisementId,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            boolean isFavorite = favoriteAdService.isFavorite(userEmail, advertisementId);
            
            Map<String, Boolean> response = new HashMap<>();
            response.put("isFavorite", isFavorite);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Pobierz wszystkie ulubione ogłoszenia użytkownika
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AdvertisementResponseDTO>> getUserFavorites(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            List<AdvertisementResponseDTO> favorites = favoriteAdService.getUserFavorites(userEmail);
            return ResponseEntity.ok(favorites);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Policz ulubione ogłoszenia użytkownika
     */
    @GetMapping("/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> countFavorites(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            long count = favoriteAdService.countUserFavorites(userEmail);
            
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
