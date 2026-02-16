package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.model.AdvertisementReport;
import com.example.backend.others.ReportStatus;

@Repository
public interface AdvertisementReportRepository extends JpaRepository<AdvertisementReport, Long>{
  
  
  List<AdvertisementReport> findAllByOrderByCreatedAtDesc();

  
  List<AdvertisementReport> findByStatusOrderByCreatedAtDesc(ReportStatus status);

  
  boolean existsByAdvertisementIdAndReporterId(Long advertisementId, Long reporterId);

  
  List<AdvertisementReport> findByAdvertisementIdOrderByCreatedAtDesc(Long advertisementId);

 
  void deleteByAdvertisementId(Long advertisementId);

 
  long countByStatus(ReportStatus status);

  @Modifying
  @Transactional
  @Query("DELETE FROM AdvertisementReport r WHERE r.advertisement.user.id = :userId")
  void deleteByAdvertisementUserId(@Param("userId") Long userId);
}