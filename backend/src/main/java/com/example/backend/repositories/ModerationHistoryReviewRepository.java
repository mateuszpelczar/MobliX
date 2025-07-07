package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.ModerationHistoryReview;

public interface ModerationHistoryReviewRepository  extends JpaRepository<ModerationHistoryReview, Long> {
    // Define any custom query methods if needed
  
}
