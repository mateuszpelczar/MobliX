package com.example.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Message;
import com.example.backend.model.User;

@Repository
public interface MessageRepository extends JpaRepository<Message,Long>{
  List<Message> findByConversationId(Long conversationId);
  
  // Nowe metody do systemu moderacji
  List<Message> findByReceiverOrderByCreatedAtDesc(User receiver);
  List<Message> findByReceiverAndMessageTypeOrderByCreatedAtDesc(User receiver, String messageType);
  long countByReceiverAndIsReadFalse(User receiver);
}
