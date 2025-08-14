package com.example.backend.repository;

import com.example.backend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
  // Additional query methods can be added here, e.g.:
  // Optional<Category> findByName(String name);
}
