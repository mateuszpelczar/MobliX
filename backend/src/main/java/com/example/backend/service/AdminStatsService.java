package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.backend.others.AdvertisementStatus;
import com.example.backend.others.ReportStatus;
import com.example.backend.repository.AdvertisementReportRepository;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.SearchLogRepository;
import com.example.backend.repository.UserRepository;

@Service
public class AdminStatsService {

  private final UserRepository userRepository;
  private final AdvertisementRepository advertisementRepository;
  private final AdvertisementReportRepository reportRepository;
  private final SearchLogRepository searchLogRepository;

  public AdminStatsService(UserRepository userRepository, AdvertisementRepository advertisementRepository,AdvertisementReportRepository reportRepository,
  SearchLogRepository searchLogRepository
  )
  {
    this.userRepository = userRepository;
    this.advertisementRepository = advertisementRepository;
    this.reportRepository = reportRepository;
    this.searchLogRepository = searchLogRepository;
  }

  public Map<String,Object> getAdminDashboard(){
    Map<String, Object> stats = new HashMap<>();

    //podstawowe statystyki
    stats.put("totalUsers",userRepository.count());
    stats.put("activeAds", advertisementRepository.countByStatus(AdvertisementStatus.ACTIVE));
    stats.put("todayActivity", getTodayActivityCount());

    //analiza uzytkownikow
    stats.put("newUsersLast7Days", getNewUsersLast7Days());
    stats.put("activeUsersToday", getActiveUsersToday());

    //raporty zawartosci
    stats.put("newAdsLast24h", getNewAdsLast24Hours());
    stats.put("pendingModeration", advertisementRepository.countByStatus(AdvertisementStatus.PENDING));
    stats.put("activeReports", reportRepository.countByStatus(ReportStatus.PENDING));

    //wzrost procentowy
    stats.put("userGrowthPercent", calculateUserGrowth());
    stats.put("adGrowthPercent", calculateAdGrowth());
    stats.put("activityGrowthPercent", calculateActivityGrowth());

    return stats;
    
  }

  private long getTodayActivityCount(){
    LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
    return searchLogRepository.countByCreatedAtAfter(startOfDay);
  }

  private long getNewUsersLast7Days() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return userRepository.countByCreatedAtAfter(sevenDaysAgo);
    }

    private long getActiveUsersToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        // Liczba unikalnych użytkowników, którzy wykonali wyszukiwania dzisiaj
        return searchLogRepository.countDistinctUserIdByCreatedAtAfter(startOfDay);
    }

    private long getNewAdsLast24Hours() {
        LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
        return advertisementRepository.countByCreatedAtAfter(yesterday);
    }

    private double calculateUserGrowth() {
        LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
        long usersLastMonth = userRepository.countByCreatedAtBefore(lastMonth);
        long totalUsers = userRepository.count();
        
        if (usersLastMonth == 0) return 0;
        return ((double) (totalUsers - usersLastMonth) / usersLastMonth) * 100;
    }

    private double calculateAdGrowth() {
        LocalDateTime lastMonth = LocalDateTime.now().minusMonths(1);
        long adsLastMonth = advertisementRepository.countByCreatedAtBefore(lastMonth);
        long totalAds = advertisementRepository.count();
        
        if (adsLastMonth == 0) return 0;
        return ((double) (totalAds - adsLastMonth) / adsLastMonth) * 100;
    }

    private double calculateActivityGrowth(){
      LocalDateTime yesterday = LocalDateTime.now().minusDays(1);
      LocalDateTime twoDaysAgo = LocalDateTime.now().minusDays(2);

      long todayActivity = getTodayActivityCount();
      long yesterdayActivity = searchLogRepository.countByCreatedAtBetween(twoDaysAgo, yesterday);

      if(yesterdayActivity == 0) return 0;
      return ((double) (todayActivity - yesterdayActivity) / yesterdayActivity) * 100;
    }
  
}
