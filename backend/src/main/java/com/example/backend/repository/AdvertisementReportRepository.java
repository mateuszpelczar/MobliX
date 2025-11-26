package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.model.AdvertisementReport;
import com.example.backend.others.ReportStatus;

@Repository
public interface AdvertisementReportRepository extends JpaRepository<AdvertisementReport, Long>{
  
  //wszystkie zgloszenia
  List<AdvertisementReport> findAllByOrderByCreatedAtDesc();

  //zgloszenia wedlug statusu
  List<AdvertisementReport> findByStatusOrderByCreatedAtDesc(ReportStatus status);

  //sprawdzenie czy uzytkownik juz zglosil dane ogloszenie
  boolean existsByAdvertisementIdAndReporterId(Long advertisementId, Long reporterId);

  //zgloszenia dla konkretnego ogloszenia
  List<AdvertisementReport> findByAdvertisementIdOrderByCreatedAtDesc(Long advertisementId);

  // usuwa zgloszenia powiazane z ogloszeniem
  void deleteByAdvertisementId(Long advertisementId);

  // do staff i admin panel
  long countByStatus(ReportStatus status);

  

  
}