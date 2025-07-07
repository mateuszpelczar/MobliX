package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.models.Brand;

public interface BrandRepository extends JpaRepository<Brand, Long> {
    // Define any custom query methods if needed
  
}
