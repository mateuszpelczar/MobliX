package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Role;
import com.example.backend.model.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

  Optional<User>findByEmail(String email);
  Optional<User> findByUsername(String username);
  long countByRole(Role role);
  
  // Pobierz wszystkich użytkowników z daną rolą
  List<User> findByRole(Role role);
  
  // Pobierz użytkowników z wieloma rolami
  List<User> findByRoleIn(List<Role> roles);
  
}
