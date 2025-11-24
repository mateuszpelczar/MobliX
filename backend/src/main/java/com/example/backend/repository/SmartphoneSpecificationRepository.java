package com.example.backend.repository;

import com.example.backend.model.SmartphoneSpecification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SmartphoneSpecificationRepository extends JpaRepository<SmartphoneSpecification, Long> {
    SmartphoneSpecification findByAdvertisementId(Long advertisementId);
}