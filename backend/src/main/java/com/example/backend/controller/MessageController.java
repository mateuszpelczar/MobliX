package com.example.backend.controller;

import com.example.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {

    @Autowired
    private MessageService messageService;

    @GetMapping("/user")
    public ResponseEntity<?> getUserMessages(Authentication authentication) {
        try {
            return ResponseEntity.ok(messageService.getUserMessages(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/rejections")
    public ResponseEntity<?> getUserRejectionMessages(Authentication authentication) {
        try {
            return ResponseEntity.ok(messageService.getUserRejectionMessages(authentication.getName()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}