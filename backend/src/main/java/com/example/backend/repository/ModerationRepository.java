package com.example.backend.repository;
import com.example.backend.model.Moderation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ModerationRepository extends JpaRepository<Moderation, Long> {
    
  
}