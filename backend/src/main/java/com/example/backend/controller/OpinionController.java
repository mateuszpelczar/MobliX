package com.example.backend.controller;

import com.example.backend.dto.CreateOpinionDTO;
import com.example.backend.dto.OpinionResponseDTO;
import com.example.backend.dto.RejectOpinionDTO;
import com.example.backend.model.OpinionStatus;
import com.example.backend.service.OpinionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/opinions")
@CrossOrigin(origins = "http://localhost:5173")
public class OpinionController {

    private final OpinionService opinionService;

    // Constructor
    public OpinionController(OpinionService opinionService) {
        this.opinionService = opinionService;
    }

    /**
     * Dodaj nową opinię (tylko zalogowani użytkownicy)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<?> createOpinion(
            @Valid @RequestBody CreateOpinionDTO dto,
            Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            OpinionResponseDTO opinion = opinionService.createOpinion(dto, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(opinion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Pobierz zatwierdzone opinie dla danego ogłoszenia (publiczne)
     */
    @GetMapping("/advertisement/{advertisementId}")
    public ResponseEntity<List<OpinionResponseDTO>> getApprovedOpinionsByAdvertisement(
            @PathVariable Long advertisementId) {
        List<OpinionResponseDTO> opinions = opinionService.getApprovedOpinionsByAdvertisement(advertisementId);
        return ResponseEntity.ok(opinions);
    }

    /**
     * Pobierz wszystkie opinie zalogowanego użytkownika
     */
    @GetMapping("/user")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<OpinionResponseDTO>> getUserOpinions(Authentication authentication) {
        String userEmail = authentication.getName();
        List<OpinionResponseDTO> opinions = opinionService.getUserOpinions(userEmail);
        return ResponseEntity.ok(opinions);
    }

    /**
     * Pobierz opinie użytkownika według statusu
     */
    @GetMapping("/user/status/{status}")
    @PreAuthorize("hasAnyRole('USER', 'STAFF', 'ADMIN')")
    public ResponseEntity<List<OpinionResponseDTO>> getUserOpinionsByStatus(
            @PathVariable OpinionStatus status,
            Authentication authentication) {
        String userEmail = authentication.getName();
        List<OpinionResponseDTO> opinions = opinionService.getUserOpinionsByStatus(userEmail, status);
        return ResponseEntity.ok(opinions);
    }

    /**
     * Pobierz wszystkie oczekujące opinie (tylko STAFF i ADMIN)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<OpinionResponseDTO>> getPendingOpinions() {
        List<OpinionResponseDTO> opinions = opinionService.getPendingOpinions();
        return ResponseEntity.ok(opinions);
    }

    /**
     * Pobierz opinie według statusu (tylko STAFF i ADMIN)
     */
    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<OpinionResponseDTO>> getOpinionsByStatus(@PathVariable OpinionStatus status) {
        List<OpinionResponseDTO> opinions = opinionService.getOpinionsByStatus(status);
        return ResponseEntity.ok(opinions);
    }

    /**
     * Zatwierdź opinię (tylko STAFF i ADMIN)
     */
    @PutMapping("/{opinionId}/approve")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> approveOpinion(@PathVariable Long opinionId) {
        try {
            OpinionResponseDTO opinion = opinionService.approveOpinion(opinionId);
            return ResponseEntity.ok(opinion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Odrzuć opinię (tylko STAFF i ADMIN)
     */
    @PutMapping("/{opinionId}/reject")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> rejectOpinion(
            @PathVariable Long opinionId,
            @Valid @RequestBody RejectOpinionDTO dto) {
        try {
            OpinionResponseDTO opinion = opinionService.rejectOpinion(opinionId, dto);
            return ResponseEntity.ok(opinion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Edytuj własną opinię (wymaga uwierzytelnienia)
     */
    @PutMapping("/{opinionId}")
    public ResponseEntity<?> updateOpinion(
            @PathVariable Long opinionId,
            @Valid @RequestBody CreateOpinionDTO dto,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
            }
            
            String userEmail = principal.getName();
            OpinionResponseDTO opinion = opinionService.updateOpinion(opinionId, dto, userEmail);
            return ResponseEntity.ok(opinion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Usuń własną opinię (wymaga uwierzytelnienia)
     */
    @DeleteMapping("/{opinionId}")
    public ResponseEntity<?> deleteOpinion(
            @PathVariable Long opinionId,
            Principal principal) {
        try {
            if (principal == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
            }
            
            String userEmail = principal.getName();
            opinionService.deleteOpinion(opinionId, userEmail);
            return ResponseEntity.ok("Opinion deleted successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
