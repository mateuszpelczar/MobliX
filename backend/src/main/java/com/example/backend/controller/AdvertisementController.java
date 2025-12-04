package com.example.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.SellerInfoDTO;
import com.example.backend.model.Advertisement;
import com.example.backend.model.User;
import com.example.backend.others.AdvertisementStatus;
import com.example.backend.service.AdvertisementService;
import com.example.backend.service.LogService;
import com.example.backend.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/advertisements")
public class AdvertisementController {

    private final AdvertisementService advertisementService;
    private final LogService logService;
    private final UserService userService;

    public AdvertisementController(AdvertisementService advertisementService, LogService logService, UserService userService) {
        this.advertisementService = advertisementService;
        this.logService = logService;
        this.userService = userService;
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
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = authentication.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            AdvertisementResponseDTO createdAd = advertisementService.createAdvertisement(createDto, userEmail);
            
            // Log INFO - pomyślne utworzenie ogłoszenia
            logService.saveLog(
                "INFO",
                "advertisement",
                "Ogłoszenie utworzone",
                "Tytuł: " + createDto.getTitle() + ", Model: " + createDto.getModel() + ", Cena: " + createDto.getPrice() + " PLN, Status: PENDING (oczekuje na moderację)",
                "AdvertisementController.createAdvertisement",
                user,
                ipAddress
            );
            
            return ResponseEntity.status(HttpStatus.CREATED).body(createdAd);
            
        } catch (Exception e) {
            // Log ERROR - błąd tworzenia ogłoszenia
            String userEmail = authentication.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "advertisement",
                "Błąd tworzenia ogłoszenia",
                "Błąd: " + e.getMessage(),
                "AdvertisementController.createAdvertisement",
                user,
                ipAddress
            );
            
            throw e;
        }
    }

    //pobranie szczegolow ogloszenia po ID

    @GetMapping("/{id}")
public ResponseEntity<AdvertisementResponseDTO> getAdvertisementById(
        @PathVariable Long id,
        HttpServletRequest request) { // ⭐ DODAJ TEN PARAMETR
    try {
        AdvertisementResponseDTO ad = advertisementService.getAdvertisementById(id);
        
        // Zwiększ licznik wyświetleń
        advertisementService.incrementViewCount(id, request); // ⭐ TERAZ request ISTNIEJE
        
        return ResponseEntity.ok(ad);
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}

/**
 * Zwiększa licznik wyświetleń dla ogłoszenia (opcjonalny osobny endpoint)
 */
@PostMapping("/{id}/view")
public ResponseEntity<Void> incrementViewCount(
        @PathVariable Long id,
        HttpServletRequest request) {
    try {
        advertisementService.incrementViewCount(id, request);
        return ResponseEntity.ok().build();
    } catch (RuntimeException e) {
        return ResponseEntity.notFound().build();
    }
}
    @GetMapping
    public ResponseEntity<List<AdvertisementResponseDTO>> getAllActiveAdvertisements() {
        List<AdvertisementResponseDTO> advertisements = advertisementService.getAllActiveAdvertisements();
        return ResponseEntity.ok(advertisements);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<AdvertisementResponseDTO>> getLatestAdvertisements() {
        List<AdvertisementResponseDTO> latest = advertisementService.getLatestAdvertisements(20);
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

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdvertisementResponseDTO> updateAdvertisementStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String status = request.get("status");
            String rejectReason = request.get("rejectReason");
            String userEmail = authentication.getName();
            User moderator = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            AdvertisementResponseDTO updated = advertisementService.updateAdvertisementStatus(id, status, rejectReason, userEmail);
            
            // Logowanie zależnie od akcji moderacji
            if (status.equals("APPROVED")) {
                // Log INFO - zatwierdzenie ogłoszenia
                logService.saveLog(
                    "INFO",
                    "advertisement",
                    "Ogłoszenie zatwierdzone przez moderatora",
                    "ID ogłoszenia: " + id + ", Tytuł: " + updated.getTitle() + ", Moderator: " + userEmail,
                    "AdvertisementController.updateAdvertisementStatus",
                    moderator,
                    ipAddress
                );
            } else if (status.equals("REJECTED")) {
                // Log WARN - odrzucenie ogłoszenia
                logService.saveLog(
                    "WARN",
                    "advertisement",
                    "Ogłoszenie odrzucone przez moderatora",
                    "ID ogłoszenia: " + id + ", Tytuł: " + updated.getTitle() + ", Powód: " + rejectReason + ", Moderator: " + userEmail,
                    "AdvertisementController.updateAdvertisementStatus",
                    moderator,
                    ipAddress
                );
            } else {
                // Log INFO - zmiana statusu (np. SOLD, PAUSED przez użytkownika)
                logService.saveLog(
                    "INFO",
                    "advertisement",
                    "Status ogłoszenia zmieniony",
                    "ID ogłoszenia: " + id + ", Nowy status: " + status + ", Użytkownik: " + userEmail,
                    "AdvertisementController.updateAdvertisementStatus",
                    moderator,
                    ipAddress
                );
            }
            
            return ResponseEntity.ok(updated);
            
        } catch (Exception e) {
            // Log ERROR - błąd zmiany statusu
            String userEmail = authentication.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "advertisement",
                "Błąd zmiany statusu ogłoszenia",
                "ID ogłoszenia: " + id + ", Błąd: " + e.getMessage(),
                "AdvertisementController.updateAdvertisementStatus",
                user,
                ipAddress
            );
            
            throw e;
        }
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
    public ResponseEntity<Void> deleteAdvertisement(
            @PathVariable Long id, 
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = authentication.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Pobierz dane ogłoszenia przed usunięciem (do logowania)
            AdvertisementResponseDTO ad = advertisementService.getAdvertisementById(id);
            
            advertisementService.deleteAdvertisement(id, userEmail);
            
            // Log INFO - usunięcie ogłoszenia
            logService.saveLog(
                "INFO",
                "advertisement",
                "Ogłoszenie usunięte",
                "ID: " + id + ", Tytuł: " + ad.getTitle() + ", Model: " + (ad.getSpecification() != null ? ad.getSpecification().getModel() : "N/A"),
                "AdvertisementController.deleteAdvertisement",
                user,
                ipAddress
            );
            
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            // Log ERROR - błąd usuwania
            String userEmail = authentication.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "advertisement",
                "Błąd usuwania ogłoszenia",
                "ID: " + id + ", Błąd: " + e.getMessage(),
                "AdvertisementController.deleteAdvertisement",
                user,
                ipAddress
            );
            
            throw e;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdvertisementResponseDTO> updateAdvertisement(
            @PathVariable Long id,
            @Valid @RequestBody CreateAdvertisementDTO updateDto,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        try {
            String userEmail = authentication.getName();
            User user = userService.getCurrentUser(userEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            AdvertisementResponseDTO updated = advertisementService.updateAdvertisement(id, updateDto, userEmail);
            
            // Log INFO - edycja ogłoszenia
            logService.saveLog(
                "INFO",
                "advertisement",
                "Ogłoszenie edytowane",
                "ID: " + id + ", Tytuł: " + updateDto.getTitle() + ", Status zmieniony na PENDING (wymaga ponownej moderacji)",
                "AdvertisementController.updateAdvertisement",
                user,
                ipAddress
            );
            
            return ResponseEntity.ok(updated);
            
        } catch (Exception e) {
            // Log ERROR - błąd edycji
            User user = userService.getCurrentUser(authentication.getName());
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "advertisement",
                "Błąd edycji ogłoszenia",
                "ID: " + id + ", Błąd: " + e.getMessage(),
                "AdvertisementController.updateAdvertisement",
                user,
                ipAddress
            );
            
            throw e;
        }
    }

    @GetMapping("/user/stats")
    public ResponseEntity<Map<String, Long>> getUserAdvertisementStats(Authentication authentication) {
        String userEmail = authentication.getName();
        Map<String, Long> stats = advertisementService.getUserAdvertisementStats(userEmail);
        return ResponseEntity.ok(stats);
    }

    //Pobranie statystyki(wszystkie aktywne ogloszenie danego uzytkownika) w userpanel
    @GetMapping("/user/dashboard-stats")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>>getUserDashboardStats(Authentication authenctication){
        String userEmail = authenctication.getName();

        Map<String, Long> stats = new HashMap<>();
        stats.put("activeAds", advertisementService.getUserAdvertisementStats(userEmail).get("active"));
        stats.put("totalViews", advertisementService.getTotalViewsForActiveAds(userEmail));

        return ResponseEntity.ok(stats);
    }

    //udostepnianie linku ogloszenia
    @PostMapping("/{id}/share")
    public ResponseEntity<Void> shareAdvertisement(
        @PathVariable Long id,
        Authentication authentication,
        HttpServletRequest request
    ){
        User currentUser = null;
        if(authentication !=null && authentication.isAuthenticated()){
            try{
                currentUser = userService.findByEmail(authentication.getName());
            }catch (Exception e){
                // niezalogowany uzytkownik
            }
        }
    Advertisement ad = advertisementService.findById(id);
    String ipAddress = logService.getClientIP(request);

    logService.saveLog(
        "INFO",
        "advertisement",
        "Udostepniono ogloszenie: " + ad.getTitle(),
        "ID: " + id,
        "AdvertisementController.shareAdvertisement",
        currentUser,
        ipAddress
    );
    return ResponseEntity.ok().build();
    }

    

}