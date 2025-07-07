package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.Message;

public interface MessageRepository extends JpaRepository<Message, Long> {
  
    // Define any custom query methods if needed  
  
}
