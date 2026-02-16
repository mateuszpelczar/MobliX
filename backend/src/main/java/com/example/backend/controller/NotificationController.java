package com.example.backend.controller;

import com.example.backend.dto.NotificationDTO;
import com.example.backend.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    //pobranie powiadomień użytkownika
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(Authentication authentication) {
        String userEmail = authentication.getName();
        List<NotificationDTO> notifications = notificationService.getUserNotifications(userEmail);
        return ResponseEntity.ok(notifications);
    }

    //pobranie nieprzeczytanych powiadomień
    @GetMapping("/unread")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(Authentication authentication) {
        String userEmail = authentication.getName();
        List<NotificationDTO> notifications = notificationService.getUnreadNotifications(userEmail);
        return ResponseEntity.ok(notifications);
    }

    //pobranie liczby nieprzeczytanych powiadomień
    @GetMapping("/unread/count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        String userEmail = authentication.getName();
        Long count = notificationService.getUnreadCount(userEmail);
        
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    //oznaczanie powiadomienia jako przeczytane
    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        notificationService.markAsRead(userEmail, id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

   //oznaczanie wszystkich powiadomień jako przeczytane
    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> markAllAsRead(Authentication authentication) {
        String userEmail = authentication.getName();
        notificationService.markAllAsRead(userEmail);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    //usuniecie powiadomienia
    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> deleteNotification(
            @PathVariable Long id,
            Authentication authentication) {
        String userEmail = authentication.getName();
        notificationService.deleteNotification(userEmail, id);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Notification deleted");
        return ResponseEntity.ok(response);
    }

    //wysyłanie powiadomienia o zmianie regulaminu do wszystkich
    @PostMapping("/admin/terms-updated")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> notifyTermsUpdate() {
        notificationService.createTermsUpdatedNotification();
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Terms update notification sent to all users");
        return ResponseEntity.ok(response);
    }
}