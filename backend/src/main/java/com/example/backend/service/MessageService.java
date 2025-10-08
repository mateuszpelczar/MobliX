package com.example.backend.service;

import com.example.backend.model.Message;
import com.example.backend.model.User;
import com.example.backend.model.Advertisement;
import com.example.backend.model.Role;
import com.example.backend.repository.MessageRepository;
import com.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public void sendRejectionMessage(Advertisement ad, String rejectReason, String moderatorEmail) {
        User systemUser = userRepository.findByEmail("system@moblix.pl")
            .orElse(createSystemUser());
        
        String messageContent = String.format(
            "Ogłoszenie o nazwie \"%s\" zostało odrzucone z następujących powodów: %s.\n\n" +
            "Aby mogło zostać opublikowane na platformie MobliX, należy je poprawić tak, " +
            "aby spełniało zasady oraz regulamin naszej platformy ogłoszeniowej.\n\n" +
            "Po wprowadzeniu zmian możesz ponownie przesłać ogłoszenie do weryfikacji.\n\n" +
            "Dziękujemy za korzystanie z MobliX.\n\nZespół MobliX.",
            ad.getTitle(), rejectReason
        );

        Message message = new Message();
        message.setSender(systemUser);
        message.setReceiver(ad.getUser());
        message.setMessageContent(messageContent);
        message.setMessageType("REJECTION");
        message.setAdvertisementId(ad.getId());
        message.setAdvertisementTitle(ad.getTitle());
        message.setCanReply(false);
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());

        messageRepository.save(message);
    }

    public List<Message> getUserMessages(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return messageRepository.findByReceiverOrderByCreatedAtDesc(user);
    }

    public List<Message> getUserRejectionMessages(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return messageRepository.findByReceiverAndMessageTypeOrderByCreatedAtDesc(user, "REJECTION");
    }

    public long getUnreadMessagesCount(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Użytkownik nie znaleziony"));
        return messageRepository.countByReceiverAndIsReadFalse(user);
    }

    private User createSystemUser() {
        User systemUser = new User();
        systemUser.setEmail("system@moblix.pl");
        systemUser.setUsername("ZespolMobliX");
        systemUser.setPassword(passwordEncoder.encode("SYSTEM_USER_PASSWORD_NOT_FOR_LOGIN"));
        systemUser.setRole(Role.ADMIN);
        return userRepository.save(systemUser);
    }
}