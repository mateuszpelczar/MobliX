package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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

  

  
}