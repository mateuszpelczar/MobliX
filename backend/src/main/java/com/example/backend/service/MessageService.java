package com.example.backend.service;

import com.example.backend.dto.ConversationDTO;
import com.example.backend.dto.MessageDTO;
import com.example.backend.model.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MessageService {
    
    @Autowired
    private MessageRepository messageRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ConversationRepository conversationRepository;


    @Autowired
    private LogService logService;

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


    /**
     * Pobierz wszystkie konwersacje użytkownika
     */
    public List<ConversationDTO> getUserConversations(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Conversation> conversations = conversationRepository
                .findByUser1OrUser2OrderByUpdatedAtDesc(user, user);

        return conversations.stream()
                .map(conv -> mapToConversationDTO(conv, user))
                .collect(Collectors.toList());
    }

    /**
     * Pobierz lub utwórz konwersację
     */
        public ConversationDTO getOrCreateConversation(String userEmail, String otherUserEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findByEmail(otherUserEmail)
                .orElseThrow(() -> new RuntimeException("Other user not found"));
        // Najpierw spróbuj znaleźć istniejącą konwersację pomiędzy tymi użytkownikami
        Conversation conversation = conversationRepository
            .findByUsers(user, otherUser)
            .orElseGet(() -> {
                // Jeśli nie istnieje, utwórz nową konwersację niezwiązaną z ogłoszeniem
                Conversation newConv = new Conversation();
                newConv.setUser1(user);
                newConv.setUser2(otherUser);
                newConv.setCreatedAt(LocalDateTime.now());
                newConv.setUpdatedAt(LocalDateTime.now());
                // conversations are created detached from advertisements
                return conversationRepository.save(newConv);
            });

        return mapToConversationDTO(conversation, user);
    }

    /**
     * Pobierz wiadomości z konwersacji
     */
    public List<MessageDTO> getConversationMessages(Long conversationId, String userEmail) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Sprawdź czy użytkownik ma dostęp do konwersacji
        if (!conversation.getUser1().equals(user) && !conversation.getUser2().equals(user)) {
            throw new RuntimeException("Access denied");
        }

        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtAsc(conversation);

        return messages.stream()
                .map(this::mapToMessageDTO)
                .collect(Collectors.toList());
    }

    /**
     * Wyślij wiadomość
     */
    public MessageDTO sendMessage(String senderEmail, String receiverEmail, String content) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByEmail(receiverEmail)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        
        // Sprawdź, czy użytkownik nie próbuje wysłać wiadomości do samego siebie
        if (senderEmail.equals(receiverEmail)) {
            throw new RuntimeException("Nie możesz wysłać wiadomości do samego siebie");
        }
        
        // Use a single conversation per user-pair. Find it first; create it if missing.
        Conversation conversation = conversationRepository
            .findByUsers(sender, receiver)
            .orElseGet(() -> {
                Conversation newConv = new Conversation();
                newConv.setUser1(sender);
                newConv.setUser2(receiver);
                newConv.setCreatedAt(LocalDateTime.now());
                newConv.setUpdatedAt(LocalDateTime.now());
                return conversationRepository.save(newConv);
            });

        // Utwórz wiadomość
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setIsRead(false);
        message.setCreatedAt(LocalDateTime.now());
        message = messageRepository.save(message);

        // Zaktualizuj czas ostatniej aktualizacji konwersacji
        conversation.setUpdatedAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        // Log wysłania wiadomości.
        String subject = "ogólna konwersacja";
        logService.saveLog(
            "INFO",
            "message",
            "Wysłano wiadomość",
            "Od: " + senderEmail + " do: " + receiverEmail + " w sprawie: " + subject,
            "MessageService",
            sender,
            null
        );

        return mapToMessageDTO(message);
    }

    /**
     * Oznacz wiadomości jako przeczytane
     */
    public void markMessagesAsRead(Long conversationId, String userEmail) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Message> unreadMessages = messageRepository
                .findByConversationAndReceiverAndIsReadFalse(conversation, user);

        unreadMessages.forEach(msg -> msg.setIsRead(true));
        messageRepository.saveAll(unreadMessages);
    }

    // Mapowanie do DTO
    private ConversationDTO mapToConversationDTO(Conversation conversation, User currentUser) {
        ConversationDTO dto = new ConversationDTO();
        dto.setId(conversation.getId());
        
        // Określ drugiego użytkownika
        User otherUser = conversation.getUser1().equals(currentUser) 
                ? conversation.getUser2() 
                : conversation.getUser1();
        dto.setOtherUserName(otherUser.getFirstName() + " " + otherUser.getLastName());
        dto.setOtherUserEmail(otherUser.getEmail());

        // Pobierz ostatnią wiadomość
        List<Message> messages = messageRepository.findByConversationOrderByCreatedAtDesc(conversation);
        if (!messages.isEmpty()) {
            Message lastMessage = messages.get(0);
            dto.setLastMessage(lastMessage.getContent());
            dto.setLastMessageTime(lastMessage.getCreatedAt());
        }

        // Policz nieprzeczytane wiadomości
        int unreadCount = messageRepository.countByConversationAndReceiverAndIsReadFalse(conversation, currentUser);
        dto.setUnreadCount(unreadCount);

        return dto;
    }

    private MessageDTO mapToMessageDTO(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversation().getId());
        dto.setSenderEmail(message.getSender().getEmail());
        dto.setSenderName(message.getSender().getFirstName() + " " + message.getSender().getLastName());
        dto.setReceiverEmail(message.getReceiver().getEmail());
        dto.setReceiverName(message.getReceiver().getFirstName() + " " + message.getReceiver().getLastName());
        dto.setContent(message.getContent());
        dto.setIsRead(message.getIsRead());
        dto.setCreatedAt(message.getCreatedAt());
        return dto;
    }
}