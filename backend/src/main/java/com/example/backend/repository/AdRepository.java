package com.example.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Ad;

@Repository
public interface AdRepository  extends JpaRepository<Ad, Long> {

          List<Ad> findByUserId(Long userId);  
          List<Ad> findByCategoryId(Long categoryId);

  
}
