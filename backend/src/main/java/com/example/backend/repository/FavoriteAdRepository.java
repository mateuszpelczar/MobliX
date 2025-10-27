package com.example.backend.repository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Advertisement;
import com.example.backend.model.FavoriteAd;
import com.example.backend.model.User;
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
}
