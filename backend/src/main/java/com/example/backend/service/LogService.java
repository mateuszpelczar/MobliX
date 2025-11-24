package com.example.backend.service;

import com.example.backend.dto.LogDTO;
import com.example.backend.model.Log;
import com.example.backend.model.User;
import com.example.backend.repository.LogRepository;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class LogService {

  private final LogRepository logRepository;

  public LogService(LogRepository logRepository){
    this.logRepository=logRepository;
  }

  // Zapisz log z obiektem User (zalecane - pełna relacja)
    public void saveLog(String level, String category, String message, String details, 
                       String source, User user, String ipAddress) {
        try {
            Log log = new Log(level, category, message, details, source, user, ipAddress);
            logRepository.save(log);
        } catch (Exception e) {
            // Jeśli logowanie się nie powiedzie, wypisz błąd ale NIE przerywaj działania aplikacji
            System.err.println("Błąd podczas zapisywania logu: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // zapisanie aktywnosci uzytkownika (userpanel)
    public void logUserActivity(User user, String message, String details){
        try{
            Log log = new Log("INFO", "user_activity", message, details, "User_ACTION",user,null );
            logRepository.save(log);
        } catch (Exception e) {
            System.err.println("Błąd podczas zapisywania aktywności: " + e.getMessage());
        }
    }

    // pobranie ostatnich aktywnosci uzytkownika do userpanel
    public List<LogDTO> getUserActivities(String userEmail, int limit){
        Pageable pageable = PageRequest.of(0, limit);
        List<Log> activities = logRepository.findUserActivities(userEmail, pageable);
        return activities.stream()
         .map(this::convertToDTO)
         .collect(Collectors.toList());
    }

    // Pobierz wszystkie logi z paginacją (najnowsze pierwsze)
    public Page<LogDTO> getAllLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Log> logs = logRepository.findAll(pageable);
        return logs.map(this::convertToDTO);
    }

    // Pobierz logi według poziomu: INFO, WARN, ERROR
    public Page<LogDTO> getLogsByLevel(String level, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Log> logs = logRepository.findByLevel(level, pageable);
        return logs.map(this::convertToDTO);
    }

    // Pobierz logi według kategorii
    public Page<LogDTO> getLogsByCategory(String category, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<Log> logs = logRepository.findByCategory(category, pageable);
        return logs.map(this::convertToDTO);
    }
  

    // Konwertuj Log (model bazodanowy) na LogDTO (do wysłania przez API)
    private LogDTO convertToDTO(Log log) {
        return new LogDTO(
            log.getId(),
            log.getTimestamp(),
            log.getLevel(),
            log.getCategory(),
            log.getMessage(),
            log.getDetails(),
            log.getSource(),
            log.getUserEmail(),
            log.getIpAddress()
        );
    }

    //pomocnicza metoda do wykrywania prawdziwego IP uzytkownika
    public String getClientIP(HttpServletRequest request){
      if(request == null){
        return null;
      }

      //sprawdzenie naglowki proxy
      String ip = request.getHeader("X-Forwarded-For");
      if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
         if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        // Jeśli IP zawiera wiele adresów (proxy chain), weź pierwszy (prawdziwy IP klienta)
        if(ip !=null && ip.contains(",") ) {
          ip=ip.split(",")[0].trim();
        }

        return ip;
    }

    //pobierz logi wedlug email uzytkownika
    public List<Log> getLogsByUserEmail(String userEmail){
        return logRepository.findByUserEmail(userEmail);
    }


}