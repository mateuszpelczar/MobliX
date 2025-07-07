package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.Conversation;

public interface ConversationRepository  extends JpaRepository<Conversation, Long> {
    // Define any custom query methods if needed  
  
}
