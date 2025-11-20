package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Advertisement;
import com.example.backend.model.FavoriteAd;
import com.example.backend.model.User;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteAdRepository extends JpaRepository<FavoriteAd, Long> {
    List<FavoriteAd> findByUserId(Long userId);
    List<FavoriteAd> findByUser(User user);
    List<FavoriteAd> findByAdvertisement(Advertisement advertisement);
    Optional<FavoriteAd> findByUserAndAdvertisement(User user, Advertisement advertisement);
    boolean existsByUserAndAdvertisement(User user, Advertisement advertisement);
    void deleteByUserAndAdvertisement(User user, Advertisement advertisement);
    long countByUser(User user);
    @Modifying
    @Query("DELETE FROM FavoriteAd f WHERE f.advertisement.id = :advertisementId")
    void deleteByAdvertisementId(@Param("advertisementId") Long advertisementId);

    @Modifying
    @Transactional
    @Query("DELETE FROM FavoriteAd f WHERE f.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
