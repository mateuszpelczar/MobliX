package com.example.backend.repository;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Advertisement;
import com.example.backend.model.User;
import com.example.backend.others.AdvertisementStatus;


import jakarta.transaction.Transactional;

@Repository
public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {

    List<Advertisement> findByUserId(Long userId);
    List<Advertisement> findByCategoryId(Long categoryId);
    List<Advertisement> findByStatus(AdvertisementStatus status);
    List<Advertisement> findByStatusOrderByCreatedAtDesc(AdvertisementStatus status);
    List<Advertisement> findByUser(User user);
    List<Advertisement> findByUserOrderByCreatedAtAsc(User user);
    List<Advertisement> findByUserAndStatus(User user, AdvertisementStatus status);

    
    
    long countByUserAndStatus(User user, AdvertisementStatus status);
    long countByUser(User user);

    
    long countByStatus(AdvertisementStatus status);

    
   
    @Query("SELECT a FROM Advertisement a WHERE a.smartphoneSpecification.status = ?1")
    List<Advertisement> findBySmartphoneSpecificationStatus(String status);
    
    @Query("SELECT a FROM Advertisement a ORDER BY a.smartphoneSpecification.dateAdded DESC")
    List<Advertisement> findAllByOrderBySmartphoneSpecificationDateAddedDesc();
    
    @Query("SELECT a FROM Advertisement a WHERE a.smartphoneSpecification.status = 'ACTIVE' AND a.smartphoneSpecification.dateAdded IS NOT NULL ORDER BY a.smartphoneSpecification.dateAdded DESC")
    List<Advertisement> findTop4ByOrderBySmartphoneSpecificationDateAddedDesc();

    //najczesciej wystawiane marki - limit 5
        @Query(value = "SELECT s.brand, COUNT(a.id) as count FROM ogloszenia a " +
            "INNER JOIN smartphone_specifications s ON s.advertisement_id = a.id " +
            "WHERE a.status = 'ACTIVE' AND s.brand IS NOT NULL " +
            "GROUP BY s.brand " +
            "ORDER BY count DESC " +
            "LIMIT 5", nativeQuery = true)
    List<Object[]> findTopListedBrands();

    
    long countByCreatedAtAfter(LocalDateTime date);
    long countByCreatedAtBefore(LocalDateTime date);

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM Advertisement a WHERE a.createdAt >= :date")
    long countDistinctUserByCreatedAtAfter(@Param("date") LocalDateTime date);

    @Modifying
    @Transactional
    @Query("DELETE FROM Advertisement a WHERE a.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

}