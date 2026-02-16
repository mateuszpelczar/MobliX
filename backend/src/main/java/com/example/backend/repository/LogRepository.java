package com.example.backend.repository;
import com.example.backend.model.Log;

import jakarta.transaction.Transactional;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LogRepository extends  JpaRepository<Log,Long>{


  
  Page<Log> findByLevel(String level, Pageable pageable);
  
  
  Page<Log> findByCategory(String category, Pageable pageable);

  
  Page<Log> findByLevelAndCategory(String level, String category, Pageable pageable);

  
  List<Log> findByUserEmail(String userEmail);


  List<Log> findByUserId(Long userId);

 
  @Query("SELECT l FROM Log l WHERE l.userEmail = :userEmail ORDER BY l.timestamp DESC")
  List<Log> findUserActivities(@Param("userEmail") String userEmail, Pageable pageable);

  @Modifying
  @Transactional
  @Query("UPDATE Log l SET l.user = null WHERE l.user.id = :userId")
  void nullifyUserIdForUser(@Param("userId") Long userId);
  
  @Query("SELECT COUNT(l) FROM Log l WHERE l.category = :category AND l.timestamp >= :since")
  long countByCategoryAndTimestampAfter(@Param("category") String category, @Param("since") java.time.LocalDateTime since);

    @Query("SELECT COUNT(DISTINCT l.userEmail) FROM Log l WHERE l.category = :category AND l.timestamp >= :since")
  long countDistinctUserEmailByCategoryAndTimestampAfter(@Param("category") String category, @Param("since") java.time.LocalDateTime since);

}