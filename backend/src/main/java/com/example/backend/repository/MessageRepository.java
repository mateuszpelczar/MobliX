package com.example.backend.repository;

import com.example.backend.model.Conversation;
import com.example.backend.model.Message;
import com.example.backend.model.User;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    
    List<Message> findByConversationId(Long conversationId);
    
    List<Message> findByConversationOrderByCreatedAtAsc(Conversation conversation);
    
    List<Message> findByConversationOrderByCreatedAtDesc(Conversation conversation);
    
    List<Message> findByConversationAndReceiverAndIsReadFalse(Conversation conversation, User receiver);
    
    int countByConversationAndReceiverAndIsReadFalse(Conversation conversation, User receiver);

    List<Message> findByReceiverOrderByCreatedAtDesc(User receiver);
    List<Message> findByReceiverAndMessageTypeOrderByCreatedAtDesc(User receiver, String messageType);
    long countByReceiverAndIsReadFalse(User receiver);

    @Modifying
    @Transactional
    @Query("DELETE FROM Message m WHERE m.sender.id = :userId OR m.receiver.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);



}