package com.example.backend.repository;

import com.example.backend.model.ContentPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentPageRepository extends JpaRepository<ContentPage, Long> {
    
    
    Optional<ContentPage> findBySlug(String slug);
    
   
    boolean existsBySlug(String slug);
}