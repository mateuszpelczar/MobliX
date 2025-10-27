package com.example.backend.repository;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.model.Advertisement;
import com.example.backend.model.AdvertisementStatus;
import com.example.backend.model.User;

@Repository
public interface AdvertisementRepository extends JpaRepository<Advertisement, Long> {

    List<Advertisement> findByUserId(Long userId);
    List<Advertisement> findByCategoryId(Long categoryId);
    List<Advertisement> findByStatus(AdvertisementStatus status);
    List<Advertisement> findByStatusOrderByCreatedAtDesc(AdvertisementStatus status);
    List<Advertisement> findByUser(User user);
    List<Advertisement> findByUserOrderByCreatedAtAsc(User user);
    
    // Liczenie ogłoszeń według statusu dla użytkownika
    long countByUserAndStatus(User user, AdvertisementStatus status);
    long countByUser(User user);
    
    // Zapytania związane ze specyfikacją smartfona
    @Query("SELECT a FROM Advertisement a WHERE a.smartphoneSpecification.status = ?1")
    List<Advertisement> findBySmartphoneSpecificationStatus(String status);
    
    @Query("SELECT a FROM Advertisement a ORDER BY a.smartphoneSpecification.dateAdded DESC")
    List<Advertisement> findAllByOrderBySmartphoneSpecificationDateAddedDesc();
    
    @Query("SELECT a FROM Advertisement a WHERE a.smartphoneSpecification.status = 'ACTIVE' AND a.smartphoneSpecification.dateAdded IS NOT NULL ORDER BY a.smartphoneSpecification.dateAdded DESC")
    List<Advertisement> findTop4ByOrderBySmartphoneSpecificationDateAddedDesc();

}
