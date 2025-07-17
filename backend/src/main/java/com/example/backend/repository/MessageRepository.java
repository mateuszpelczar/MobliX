package com.example.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Message;

@Repository
public interface MessageRepository extends JpaRepository<Message,Long>{
  List<Message> findByConversationId(Long conversationId);
  
}
