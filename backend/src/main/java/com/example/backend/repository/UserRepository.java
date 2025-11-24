package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Role;
import com.example.backend.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {

  Optional<User>findByEmail(String email);
  Optional<User> findByUsername(String username);
  long countByRole(Role role);
  boolean existsByEmail(String email);
  
  // Pobierz wszystkich użytkowników z daną rolą
  List<User> findByRole(Role role);
  
  // Pobierz użytkowników z wieloma rolami
  List<User> findByRoleIn(List<Role> roles);

  //zliczanie zablokowanych uzytkownikow
  long countByIsBlockedTrue();

  //metody do statystyk admina
  long countByCreatedAtAfter(LocalDateTime date);
  long countByCreatedAtBefore(LocalDateTime date);

  @Query(value = """
      SELECT COUNT(DISTINCT uid) FROM(
      SELECT s.user_id AS uid
      FROM search_logs s
      WHERE s.user_id IS NOT NULL AND s.created_at >= :since
      UNION
      SELECT a.user_id AS uid
      FROM ogloszenia a
      WHERE a.user_id IS NOT NULL AND a.created_at >= :since
      UNION
      SELECT l.user_id AS uid
      FROM logs l
      WHERE l.user_id IS NOT NULL AND l.timestamp >= :since AND l.category = 'authentication'
      ) AS t
      """, nativeQuery= true)
      long countDistinctActiveUsersSince(@Param("since")java.time.LocalDateTime since);




  
}
