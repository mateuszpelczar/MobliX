package com.example.backend.controller;

import com.example.backend.dto.CreateOpinionDTO;
import com.example.backend.dto.OpinionResponseDTO;
import com.example.backend.dto.RejectOpinionDTO;
import com.example.backend.model.Opinion;
import com.example.backend.model.OpinionStatus;
import com.example.backend.model.User;
import com.example.backend.repository.OpinionRepository;
import com.example.backend.service.LogService;
import com.example.backend.service.OpinionService;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/opinions")
@CrossOrigin(origins = "http://localhost:5173")
public class OpinionController {

    private final OpinionService opinionService;
    private final LogService logService;
    private final UserService userService;
    private final OpinionRepository opinionRepository;

    public OpinionController(OpinionService opinionService, LogService logService, UserService userService, OpinionRepository opinionRepository) {
        this.opinionService = opinionService;
        this.logService = logService;
        this.userService = userService;
        this.opinionRepository = opinionRepository;
    }

    @PostMapping
    public ResponseEntity<OpinionResponseDTO> createOpinion(
            @Valid @RequestBody CreateOpinionDTO createOpinionDTO,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = principal.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            OpinionResponseDTO opinion = opinionService.createOpinion(createOpinionDTO, userEmail);
            
            // Log INFO - dodanie opinii
            logService.saveLog(
                "INFO",
                "opinion",
                "Opinia dodana",
                "ID ogłoszenia: " + createOpinionDTO.getAdvertisementId() + ", Ocena: " + createOpinionDTO.getRating() + "/5, Status: PENDING (oczekuje na moderację)",
                "OpinionController.createOpinion",
                user,
                ipAddress
            );
            
            return ResponseEntity.ok(opinion);
            
        } catch (Exception e) {
            // Log ERROR - błąd dodawania opinii
            String userEmail = principal.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "opinion",
                "Błąd dodawania opinii",
                "ID ogłoszenia: " + createOpinionDTO.getAdvertisementId() + ", Błąd: " + e.getMessage(),
                "OpinionController.createOpinion",
                user,
                ipAddress
            );
            
            throw e;
        }
    }

    @GetMapping("/advertisement/{advertisementId}")
    public ResponseEntity<List<OpinionResponseDTO>> getApprovedOpinions(@PathVariable Long advertisementId) {
        List<OpinionResponseDTO> opinions = opinionService.getApprovedOpinionsByAdvertisement(advertisementId);
        return ResponseEntity.ok(opinions);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<OpinionResponseDTO>> getPendingOpinions() {
        List<OpinionResponseDTO> opinions = opinionService.getPendingOpinions();
        return ResponseEntity.ok(opinions);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<OpinionResponseDTO>> getOpinionsByStatus(@PathVariable OpinionStatus status) {
        List<OpinionResponseDTO> opinions = opinionService.getOpinionsByStatus(status);
        return ResponseEntity.ok(opinions);
    }

    @PutMapping("/{opinionId}/approve")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<OpinionResponseDTO> approveOpinion(
            @PathVariable Long opinionId,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = principal.getName();
            User moderator = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            OpinionResponseDTO opinion = opinionService.approveOpinion(opinionId);
            
            // Log INFO - zatwierdzenie opinii
            logService.saveLog(
                "INFO",
                "opinion",
                "Opinia zatwierdzona przez moderatora",
                "ID opinii: " + opinionId + ", ID ogłoszenia: " + opinion.getAdvertisementId() + ", Ocena: " + opinion.getRating() + "/5, Moderator: " + userEmail,
                "OpinionController.approveOpinion",
                moderator,
                ipAddress
            );
            
            return ResponseEntity.ok(opinion);
            
        } catch (Exception e) {
            // Log ERROR - błąd zatwierdzania
            String userEmail = principal.getName();
            User moderator = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "opinion",
                "Błąd zatwierdzania opinii",
                "ID opinii: " + opinionId + ", Błąd: " + e.getMessage(),
                "OpinionController.approveOpinion",
                moderator,
                ipAddress
            );
            
            throw e;
        }
    }

    @PutMapping("/{opinionId}/reject")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<OpinionResponseDTO> rejectOpinion(
            @PathVariable Long opinionId,
            @RequestBody RejectOpinionDTO rejectDTO,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = principal.getName();
            User moderator = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            OpinionResponseDTO opinion = opinionService.rejectOpinion(opinionId, rejectDTO);
            
            // Log WARN - odrzucenie opinii
            logService.saveLog(
                "WARN",
                "opinion",
                "Opinia odrzucona przez moderatora",
                "ID opinii: " + opinionId + ", Powód: " + rejectDTO.getRejectionReason() + ", Moderator: " + userEmail,
                "OpinionController.rejectOpinion",
                moderator,
                ipAddress
            );
            
            return ResponseEntity.ok(opinion);
            
        } catch (Exception e) {
            // Log ERROR - błąd odrzucania
            String userEmail = principal.getName();
            User moderator = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "opinion",
                "Błąd odrzucania opinii",
                "ID opinii: " + opinionId + ", Błąd: " + e.getMessage(),
                "OpinionController.rejectOpinion",
                moderator,
                ipAddress
            );
            
            throw e;
        }
    }

    @PutMapping("/{opinionId}")
    public ResponseEntity<OpinionResponseDTO> updateOpinion(
            @PathVariable Long opinionId,
            @Valid @RequestBody CreateOpinionDTO updateDTO,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = principal.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            OpinionResponseDTO opinion = opinionService.updateOpinion(opinionId, updateDTO, userEmail);
            
            // Log INFO - edycja opinii
            logService.saveLog(
                "INFO",
                "opinion",
                "Opinia edytowana",
                "ID opinii: " + opinionId + ", Nowa ocena: " + updateDTO.getRating() + "/5, Status zmieniony na PENDING (wymaga ponownej moderacji)",
                "OpinionController.updateOpinion",
                user,
                ipAddress
            );
            
            return ResponseEntity.ok(opinion);
            
        } catch (Exception e) {
            // Log ERROR - błąd edycji
            String userEmail = principal.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "opinion",
                "Błąd edycji opinii",
                "ID opinii: " + opinionId + ", Błąd: " + e.getMessage(),
                "OpinionController.updateOpinion",
                user,
                ipAddress
            );
            
            throw e;
        }
    }

    @DeleteMapping("/{opinionId}")
    public ResponseEntity<Void> deleteOpinion(
            @PathVariable Long opinionId,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = principal.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Pobierz dane opinii przed usunięciem
            Opinion opinion = opinionRepository.findById(opinionId)
                .orElseThrow(() -> new RuntimeException("Nie znaleziono opinii o ID: " + opinionId));
            
            opinionService.deleteOpinion(opinionId, userEmail);
            
            // Log INFO - usunięcie opinii
            logService.saveLog(
                "INFO",
                "opinion",
                "Opinia usunięta",
                "ID opinii: " + opinionId + ", ID ogłoszenia: " + opinion.getAdvertisementId(),
                "OpinionController.deleteOpinion",
                user,
                ipAddress
            );
            
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            // Log ERROR - błąd usuwania
            String userEmail = principal.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "opinion",
                "Błąd usuwania opinii",
                "ID opinii: " + opinionId + ", Błąd: " + e.getMessage(),
                "OpinionController.deleteOpinion",
                user,
                ipAddress
            );
            
            throw e;
        }
    }
}