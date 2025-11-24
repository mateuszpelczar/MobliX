package com.example.backend.repository;

import com.example.backend.model.ContentPage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ContentPageRepository extends JpaRepository<ContentPage, Long> {
    
    // Znajdź stronę po slug (np. "zasady-bezpieczenstwa")
    Optional<ContentPage> findBySlug(String slug);
    
    // Sprawdź czy strona o danym slug istnieje
    boolean existsBySlug(String slug);
}