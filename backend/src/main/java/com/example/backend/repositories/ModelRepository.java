package com.example.backend.repositories;

import org.springframework.data.jpa.repository.JpaRepository;

import ch.qos.logback.core.model.Model;

public interface ModelRepository extends JpaRepository<Model, Long> {
    // Define any custom query methods if needed
  
}
