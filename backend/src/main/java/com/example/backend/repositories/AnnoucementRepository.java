package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.Announcement;

public interface AnnoucementRepository extends JpaRepository<Announcement, Long> {
  
}
