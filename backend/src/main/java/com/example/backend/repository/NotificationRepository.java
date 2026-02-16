package com.example.backend.repository;

import com.example.backend.model.Notification;
import com.example.backend.model.User;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndIsReadOrderByCreatedAtDesc(User user, Boolean isRead);
    
    Long countByUserAndIsRead(User user, Boolean isRead);
    
    void deleteByUser(User user);

    //usuwa powiadomienia powiazane z danym ogloszeniem
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.advertisement.id = :adId")
    void deleteByAdvertisementId(@Param("adId") Long advertisementId);

    //usuwa powiadomienia powiazane z danym uzytkownikiem
    @Modifying
    @Transactional
    @Query("DELETE FROM Notification n WHERE n.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

    
}




