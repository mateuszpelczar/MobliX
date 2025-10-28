package com.example.backend.repository;
import com.example.backend.model.Log;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LogRepository extends  JpaRepository<Log,Long>{


  //logi wedlug poziomu(INFO, WARN, ERROR)
  Page<Log> findByLevel(String level, Pageable pageable);
  
  //logi wedlug kategorii
  Page<Log> findByCategory(String category, Pageable pageable);

  //logi wedlug poziomu i kategorii jednoczesnie
  Page<Log> findByLevelAndCategory(String level, String category, Pageable pageable);

  //wszystkie logi uzytkownika po email
  List<Log> findByUserEmail(String userEmail);

  //wszystkie logi uzytkownika po ID
  List<Log> findByUserId(Long userId);

  //pobranie ostatnich aktywnosci danego uzytkwonika do pliku userpanel(sekcja ostatnia aktywnosc)
  @Query("SELECT l FROM Log l WHERE l.userEmail = :userEmail AND l.category = 'user_activity' ORDER BY l.timestamp DESC")
  List<Log> findUserActivities(@Param("userEmail") String userEmail, Pageable pageable);

  
}
