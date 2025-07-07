package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.Review;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Define any custom query methods if needed
  
}
