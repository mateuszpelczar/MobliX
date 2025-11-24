package com.example.backend.controller;

import com.example.backend.dto.UserDto;
import com.example.backend.dto.UserModerationDTO;
import com.example.backend.model.Role;
import com.example.backend.model.User;
import com.example.backend.others.AdvertisementStatus;
import com.example.backend.others.ReportStatus;
import com.example.backend.others.UpdateUserRequest;
import com.example.backend.others.UserRoleChangeRequest;
import com.example.backend.repository.AdvertisementReportRepository;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.service.LogService;
import com.example.backend.service.NotificationService;
import com.example.backend.service.UserService;
import jakarta.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import java.util.Map;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    
    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);
    
    private final UserService userService;
    private final LogService logService;
    private final NotificationService notificationService; 
    private final AdvertisementRepository advertisementRepository;
    private final AdvertisementReportRepository reportRepository;


    public AdminController(UserService userService, LogService logService, NotificationService notificationService,AdvertisementRepository advertisementRepository, AdvertisementReportRepository reportRepository) {
        this.userService = userService;
        this.logService = logService;
        this.notificationService = notificationService;
        this.advertisementRepository = advertisementRepository;
        this.reportRepository = reportRepository;
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        List<UserDto> userDtos = users.stream()
                .map(user -> new UserDto(
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
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(userDtos);
    }

    @PutMapping("/users/{userId}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> changeUserRole(
            @PathVariable Long userId,
            @RequestBody UserRoleChangeRequest request,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Pobierz dane użytkownika przed zmianą roli
            User targetUser = userService.getUserById(userId);
            Role oldRole = targetUser.getRole();
            
            User updatedUser = userService.changeUserRole(userId, request.getRole());
            
            // Log INFO - zmiana roli użytkownika
            logService.saveLog(
                "INFO",
                "admin",
                "Rola użytkownika zmieniona przez admina",
                "Użytkownik: " + targetUser.getEmail() + ", Stara rola: " + oldRole + ", Nowa rola: " + request.getRole() + ", Admin: " + adminEmail,
                "AdminController.changeUserRole",
                admin,
                ipAddress
            );
            
            UserDto userDto = new UserDto(
                    updatedUser.getId(),
                    updatedUser.getEmail(),
                    updatedUser.getUsername(),
                    updatedUser.getRole().toString(),
                    updatedUser.getAccountType(),
                    updatedUser.getFirstName(),
                    updatedUser.getLastName(),
                    updatedUser.getPhone(),
                    updatedUser.getCompanyName(),
                    updatedUser.getNip(),
                    updatedUser.getRegon(),
                    updatedUser.getAddress(),
                    updatedUser.getWebsite()
            );
            
            return ResponseEntity.ok(userDto);
            
        } catch (Exception e) {
            // Log ERROR - błąd zmiany roli
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "admin",
                "Błąd zmiany roli użytkownika",
                "ID użytkownika: " + userId + ", Błąd: " + e.getMessage() + ", Admin: " + adminEmail,
                "AdminController.changeUserRole",
                admin,
                ipAddress
            );
            
            throw e;
        }
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long userId,
            Principal principal,
            HttpServletRequest httpRequest) {
        try {
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            // Pobierz dane użytkownika przed usunięciem
            User targetUser = userService.getUserById(userId);
            String targetUserEmail = targetUser.getEmail();
            String targetUserRole = targetUser.getRole().toString();
            
            userService.deleteUser(userId);
            
            // Log WARN - usunięcie użytkownika (poważna akcja!)
            logService.saveLog(
                "WARN",
                "admin",
                "Użytkownik usunięty przez admina",
                "Usunięty użytkownik: " + targetUserEmail + ", Rola: " + targetUserRole + ", Admin: " + adminEmail,
                "AdminController.deleteUser",
                admin,
                ipAddress
            );
            
            return ResponseEntity.noContent().build();
            
        } catch (Exception e) {
            // Log ERROR - błąd usuwania użytkownika
            String adminEmail = principal.getName();
            User admin = userService.getCurrentUser(adminEmail);
            String ipAddress = logService.getClientIP(httpRequest);
            
            logService.saveLog(
                "ERROR",
                "admin",
                "Błąd usuwania użytkownika",
                "ID użytkownika: " + userId + ", Błąd: " + e.getMessage() + ", Admin: " + adminEmail,
                "AdminController.deleteUser",
                admin,
                ipAddress
            );
            
            throw e;
        }
    }

    /**
     * Pobierz wszystkich użytkowników do moderacji
     * STAFF widzi tylko USER, ADMIN widzi wszystkich
     */
    @GetMapping("/users/moderation")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<com.example.backend.dto.UserModerationDTO>> getUsersForModeration(Principal principal) {
        String currentUserEmail = principal.getName();
        List<com.example.backend.dto.UserModerationDTO> users = userService.getUsersForModeration(currentUserEmail);
        return ResponseEntity.ok(users);
    }
    
    /**
     * Zablokuj użytkownika
     */
    @PostMapping("/users/{userId}/block")
@PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
public ResponseEntity<com.example.backend.dto.UserModerationDTO> blockUser(
        @PathVariable Long userId,
        @RequestBody com.example.backend.others.BlockUserRequest request,
        Principal principal,
        HttpServletRequest httpRequest) {
    
    String adminEmail = principal.getName();
    User admin = userService.getCurrentUser(adminEmail);
    String ipAddress = logService.getClientIP(httpRequest);
    
    User blockedUser = userService.blockUser(userId, request.getDurationMinutes(), request.getReason());
    
    // UTWÓRZ POWIADOMIENIE o zablokowaniu konta
    notificationService.createAccountBlockedNotification(
        blockedUser, 
        request.getReason(), 
        adminEmail,
        blockedUser.getBlockedUntil()
    );
    
    logService.saveLog(
        "WARN",
        "admin",
        "Użytkownik zablokowany",
        "Email: " + blockedUser.getEmail() + ", Czas: " + request.getDurationMinutes() + " min, Powód: " + request.getReason(),
        "AdminController.blockUser",
        admin,
        ipAddress
    );
    
    return ResponseEntity.ok(userService.convertToModerationDTO(blockedUser));
}
    
    /**
     * Odblokuj użytkownika
     */
    @PostMapping("/users/{userId}/unblock")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<com.example.backend.dto.UserModerationDTO> unblockUser(
            @PathVariable Long userId,
            Principal principal,
            HttpServletRequest httpRequest) {
        
        String adminEmail = principal.getName();
        User admin = userService.getCurrentUser(adminEmail);
        String ipAddress = logService.getClientIP(httpRequest);
        
        User unblockedUser = userService.unblockUser(userId);
        
        logService.saveLog(
            "INFO",
            "admin",
            "Użytkownik odblokowany",
            "Email: " + unblockedUser.getEmail(),
            "AdminController.unblockUser",
            admin,
            ipAddress
        );
        
        return ResponseEntity.ok(userService.convertToModerationDTO(unblockedUser));
    }
    
    /**
     * Pobierz logi aktywności użytkownika
     */
    @GetMapping("/users/{userId}/activity-logs")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<List<com.example.backend.dto.LogDTO>> getUserActivityLogs(@PathVariable Long userId, @RequestParam(defaultValue="10")int limit) {
        User user = userService.getUserById(userId);
        List<com.example.backend.dto.LogDTO> logDTOs = logService.getUserActivities(user.getEmail(),limit);
        
        return ResponseEntity.ok(logDTOs);
    }

    /**
     * Pobierz szczegóły użytkownika do moderacji
     */
    @GetMapping("/users/{userId}/details")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<UserModerationDTO> getUserModerationDetails(@PathVariable Long userId) {
        logger.info("Fetching moderation details for user ID: {}", userId);
        
        User user = userService.getUserById(userId);
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        UserModerationDTO dto = userService.convertToModerationDTOWithFullDetails(user);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/users/{userId}")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody UpdateUserRequest request,
            Authentication authentication) {
        
        logger.info("Updating user ID: {} by: {}", userId, authentication.getName());
        
        try {
            userService.updateUserByAdmin(userId, request);
            
            // Log do systemu
            User adminUser = userService.getCurrentUser(authentication.getName());
            logService.saveLog(
                "INFO",
                "USER_MANAGEMENT",
                "Admin/Staff updated user data: " + userId,
                "Updated by: " + authentication.getName(),
                "AdminController.updateUser",
                adminUser,
                null
            );
            
            return ResponseEntity.ok().body(Map.of("message", "User updated successfully"));
        } catch (Exception e) {
            logger.error("Error updating user: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
        
    
        }

        //pobierz statystyki dla staff panel
        @GetMapping("/stats/staff")
        @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
        public ResponseEntity<Map<String,Long>> getStaffStats(){
            Map<String,Long> stats = new HashMap<>();

            //oczekujace ogloszenia (status PENDING)
            stats.put("pendingAdvertisements", advertisementRepository.countByStatus(AdvertisementStatus.PENDING));

            //ogloszenia zatwierdzone
            stats.put("approvedAdvertisements", advertisementRepository.countByStatus(AdvertisementStatus.ACTIVE));

            //aktywni uzytkownicy (nie zablokowaniu)
            stats.put("activeUsers",userService.countActiveUsers());

            //zgloszone ogloszenia - oczekujace
            stats.put("pendingReports", reportRepository.countByStatus(ReportStatus.PENDING));

            return ResponseEntity.ok(stats);

        }

        // //pobierz statystyki dla admin panel
        // @GetMapping("/stats/dashboard")
        // @PreAuthorize("hasRole('ADMIN')")
        // public ResponseEntity<Map<String,Long>> getAdminDashboardStats(){
        //     Map<String, Long> stats = new HashMap<>();

        //     //pobranie wszystkich uzytkownikow w systemie(wlacznie z zablokowanymi)
        //     stats.put("totalUsers",(long) userService.getAllUsers().size());

        //     //pobranie wszystkich aktywnych ogloszen w systemie
        //     stats.put("activeAdvertisements", advertisementRepository.countByStatus(AdvertisementStatus.ACTIVE));

        //     return ResponseEntity.ok(stats);
        // }

        
        
    }
