package com.example.backend.repository;

import com.example.backend.model.Conversation;
import com.example.backend.model.Message;
import com.example.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationId(Long conversationId);
    
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    
    List<Message> findByConversationOrderByCreatedAtDesc(Conversation conversation);
    
    List<Message> findByConversationAndReceiverAndIsReadFalse(Conversation conversation, User receiver);
    
    int countByConversationAndReceiverAndIsReadFalse(Conversation conversation, User receiver);
    
    // Stare metody do systemu moderacji
    List<Message> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Message> findByReceiverAndMessageTypeOrderByCreatedAtDesc(User receiver, String messageType);
    long countByReceiverAndIsReadFalse(User receiver);
}
