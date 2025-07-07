package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModerationHistory extends JpaRepository<ModerationHistory, Long> {
    // Define any custom query methods if needed
  
}
