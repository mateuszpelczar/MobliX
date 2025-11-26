package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.backend.others.AdvertisementStatus;
import com.example.backend.others.ReportStatus;
import com.example.backend.repository.AdvertisementReportRepository;
import com.example.backend.repository.AdvertisementRepository;
import com.example.backend.repository.LogRepository;
import com.example.backend.repository.SearchLogRepository;
import com.example.backend.repository.UserRepository;

@Service
public class AdminStatsService {

  private final UserRepository userRepository;
  private final AdvertisementRepository advertisementRepository;
  private final AdvertisementReportRepository reportRepository;
  private final SearchLogRepository searchLogRepository;
  private final LogRepository logRepository;

  public AdminStatsService(UserRepository userRepository, AdvertisementRepository advertisementRepository,AdvertisementReportRepository reportRepository,
  SearchLogRepository searchLogRepository, LogRepository logRepository
  )
  {
    this.userRepository = userRepository;
    this.advertisementRepository = advertisementRepository;
    this.reportRepository = reportRepository;
    this.searchLogRepository = searchLogRepository;
    this.logRepository = logRepository;
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
    long searchCount = 0;
    long loginCount = 0;
    try {
      searchCount = searchLogRepository.countByCreatedAtAfter(startOfDay);
    } catch (Exception ex) {
      searchCount = 0;
    }
    try {
      // zliczamy wszystkie logowania (każde logowanie jako jedno zdarzenie)
      loginCount = logRepository.countByCategoryAndTimestampAfter("authentication", startOfDay);
    } catch (Exception ex) {
      loginCount = 0;
    }
    return searchCount + loginCount;
  }

  private long getNewUsersLast7Days() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        return userRepository.countByCreatedAtAfter(sevenDaysAgo);
    }

    private long getActiveUsersToday() {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
        // Liczba unikalnych użytkowników, którzy wykonali wyszukiwania dzisiaj
        //ignoruj null userId - niezalogowani uzytkownicy
        long searchActiveUsers = searchLogRepository.countDistinctUserIdByCreatedAtAfter(startOfDay);
        
        // Użytkownicy, którzy dodali ogłoszenia
        long adActiveUsers = advertisementRepository.countDistinctUserByCreatedAtAfter(startOfDay);

        long loginDistinct = 0;
        try{
          loginDistinct = logRepository.countDistinctUserEmailByCategoryAndTimestampAfter("authentication", startOfDay);
      } catch (Exception ex) {
        loginDistinct = 0;
      }
       
        return searchActiveUsers + adActiveUsers + loginDistinct;
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

      // wyszukiwania z okresu twoDaysAgo..yesterday (tak jak wcześniej)
      long yesterdaySearch = 0;
      try {
        yesterdaySearch = searchLogRepository.countByCreatedAtBetween(twoDaysAgo, yesterday);
      } catch (Exception ex) {
        yesterdaySearch = 0;
      }

      // logowania w okresie twoDaysAgo..yesterday
      long yesterdayLogin = 0;
      try {
        long sinceTwoDays = logRepository.countByCategoryAndTimestampAfter("authentication", twoDaysAgo);
        long sinceYesterday = logRepository.countByCategoryAndTimestampAfter("authentication", yesterday);
        long between = sinceTwoDays - sinceYesterday;
        yesterdayLogin = Math.max(0, between);
      } catch (Exception ex) {
        yesterdayLogin = 0;
      }

      long yesterdayActivity = yesterdaySearch + yesterdayLogin;

      if(yesterdayActivity == 0) return 0;
      return ((double) (todayActivity - yesterdayActivity) / yesterdayActivity) * 100;
    }
  
}