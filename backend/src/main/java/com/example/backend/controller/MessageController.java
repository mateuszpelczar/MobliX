package com.example.backend.controller;

import com.example.backend.dto.ConversationDTO;
import com.example.backend.dto.MessageDTO;
import com.example.backend.others.SendMessageRequest;
import com.example.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Stare endpointy dla systemu moderacji
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

   

    /**
     * Pobierz wszystkie konwersacje użytkownika
     */
    @GetMapping("/conversations")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(Principal principal) {
        String userEmail = principal.getName();
        List<ConversationDTO> conversations = messageService.getUserConversations(userEmail);
        return ResponseEntity.ok(conversations);
    }

    /**
     * Pobierz konwersację z użytkownikiem dotyczącą ogłoszenia
     * (jeśli nie istnieje, utwórz ją)
     */
    @GetMapping("/conversation")
    @PreAuthorize("isAuthenticated()")
        public ResponseEntity<ConversationDTO> getOrCreateConversation(
            @RequestParam String otherUserEmail,
            Principal principal) {
        String userEmail = principal.getName();
        ConversationDTO conversation = messageService.getOrCreateConversation(
                userEmail, otherUserEmail);
        return ResponseEntity.ok(conversation);
    }

    /**
     * Pobierz wiadomości z konwersacji
     */
    @GetMapping("/conversation/{conversationId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MessageDTO>> getConversationMessages(
            @PathVariable Long conversationId,
            Principal principal) {
        String userEmail = principal.getName();
        List<MessageDTO> messages = messageService.getConversationMessages(conversationId, userEmail);
        return ResponseEntity.ok(messages);
    }

    /**
     * Wyślij wiadomość
     */
    @PostMapping("/send")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MessageDTO> sendMessage(
            @RequestBody SendMessageRequest request,
            Principal principal) {
        String senderEmail = principal.getName();
        MessageDTO message = messageService.sendMessage(
            senderEmail,
            request.getReceiverEmail(),
            request.getContent()
        );
        return ResponseEntity.ok(message);
    }

    /**
     * Oznacz wiadomości jako przeczytane
     */
    @PutMapping("/conversation/{conversationId}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> markAsRead(
            @PathVariable Long conversationId,
            Principal principal) {
        String userEmail = principal.getName();
        messageService.markMessagesAsRead(conversationId, userEmail);
        return ResponseEntity.ok().build();
    }
}