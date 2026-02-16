package com.example.backend.repository;

import com.example.backend.model.SmartphoneSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface SmartphoneSpecificationRepository extends JpaRepository<SmartphoneSpecification, Long> {
    SmartphoneSpecification findByAdvertisementId(Long advertisementId);

    @Modifying
    @Transactional
    @Query("DELETE FROM SmartphoneSpecification s WHERE s.advertisement.user.id = :userId")
    void deleteByAdvertisementUserId(@Param("userId") Long userId);
}