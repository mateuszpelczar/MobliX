package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.FavoriteAd;
import java.util.List;

@Repository
public interface FavoriteAdRepository extends JpaRepository<FavoriteAd, Long> {
    List<FavoriteAd> findByUserId(Long userId);
  
}
