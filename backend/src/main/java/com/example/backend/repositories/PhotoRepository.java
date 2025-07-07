package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.Photo;

public interface PhotoRepository extends JpaRepository<Photo, Long> {
    // Define any custom query methods if needed
  
}
