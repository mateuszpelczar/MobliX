package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.backend.dto.AdvertisementReportDTO;
import com.example.backend.model.*;
import com.example.backend.others.CreateReportRequest;
import com.example.backend.others.ReportStatus;
import com.example.backend.repository.*;
import com.example.backend.others.ReviewReportRequest;

import jakarta.transaction.Transactional;

@Service
public class AdvertisementReportService {

  private final AdvertisementReportRepository reportRepository;
  private final AdvertisementRepository advertisementRepository;
  private final UserRepository userRepository;
  private final NotificationService notificationService;
  private final FavoriteAdRepository favoriteAdRepository;

  public AdvertisementReportService(AdvertisementReportRepository reportRepository,
  AdvertisementRepository advertisementRepository,
  UserRepository userRepository,
  NotificationService notificationService,
  FavoriteAdRepository favoriteAdRepository
){
  this.reportRepository = reportRepository;
  this.advertisementRepository = advertisementRepository;
  this.userRepository = userRepository;
  this.notificationService = notificationService;
  this.favoriteAdRepository = favoriteAdRepository;
}

  //utworznie zgloszenia
  @Transactional
  public AdvertisementReportDTO createReport(Long advertisementId, String reporterEmail, CreateReportRequest request){
     Advertisement advertisement = advertisementRepository.findById(advertisementId)
     .orElseThrow(() -> new RuntimeException("Ogloszenie nie znalezione"));
       
  //znajdz zglaszajacego
  User reporter = userRepository.findByEmail(reporterEmail) 
    .orElseThrow(() -> new RuntimeException("Uzytkownik nie zostal znaleziony"));

    //sprawdzenie czy uzytkownik juz zglosil do ogloszenie
    if(reportRepository.existsByAdvertisementIdAndReporterId(advertisementId, reporter.getId())){
       throw new RuntimeException("Juz zglosiles to ogloszenie");

    }

    //wlasciciel ogloszenia
    User owner = advertisement.getUser();

    //utworz zgloszenie
    AdvertisementReport report = new AdvertisementReport();
    report.setAdvertisement(advertisement);
    report.setReporter(reporter);
    report.setAdvertisementOwner(owner);
    report.setReason(request.getReason());
    report.setComment(request.getComment());
    report.setStatus(ReportStatus.PENDING);

    AdvertisementReport savedReport = reportRepository.save(report);

    return convertToDTO(savedReport);

  }

  //pobierz wszystkie zgloszenia
  public List<AdvertisementReportDTO> getAllReports(){
    return reportRepository.findAllByOrderByCreatedAtDesc().stream()
          .map(this::convertToDTO)
          .collect(Collectors.toList());
    
  }

  //pobierz zgloszenia wedlug statusu
  public List<AdvertisementReportDTO> getReportsByStatus(String status){
    ReportStatus reportStatus = ReportStatus.valueOf(status.toUpperCase());
    return reportRepository.findByStatusOrderByCreatedAtDesc(reportStatus).stream()
    .map(this::convertToDTO)
    .collect(Collectors.toList());
  }

  /**
     * Rozpatrz zgłoszenie (zaakceptuj z akcją)
     */
    @Transactional
    public AdvertisementReportDTO reviewReport(Long reportId, String moderatorEmail, ReviewReportRequest request) {
        AdvertisementReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Zgłoszenie nie znalezione"));

        User moderator = userRepository.findByEmail(moderatorEmail)
                .orElseThrow(() -> new RuntimeException("Moderator nie znaleziony"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new RuntimeException("Zgłoszenie już zostało rozpatrzone");
        }

        
        Advertisement advertisement = report.getAdvertisement();
        User owner = report.getAdvertisementOwner();

        //zapisanie tytulu oraz id ogloszenia przed usunieciem
        String advertisementTitle = advertisement.getTitle();
        Long advertisementId = advertisement.getId();

        // Ustaw status i dane moderatora
        report.setStatus(ReportStatus.ACCEPTED);
        report.setReviewedBy(moderator);
        report.setReviewedAt(LocalDateTime.now());
        report.setModeratorNote(request.getModeratorNote());

    

        if ("DELETE".equals(request.getAction())) {

            //ustawienie ogloszenia na null przed usunieciem
            report.setAdvertisement(null);

            //zapisanie zgloszenia(bez referencji do ogloszenia)
            AdvertisementReport savedReport = reportRepository.save(report);

            favoriteAdRepository.deleteByAdvertisementId(advertisementId);
  
            // usuniecie ogloszenia dopiero po jego zapisie
            advertisementRepository.delete(advertisement);

            // Wyślij powiadomienie do właściciela
            notificationService.createAdvertisementDeletedNotification(
                    owner,
                    advertisementTitle,
                    request.getModeratorNote()
            );

            return convertToDTO(savedReport);

        } else if ("WARNING".equals(request.getAction())) {

            //zapisanie zgloszenia(ogloszenie pozostaje)
            AdvertisementReport savedReport = reportRepository.save(report);
        
            // Wyślij powiadomienie-ostrzeżenie do właściciela
            notificationService.createAdvertisementWarningNotification(
                    owner,
                    advertisement.getTitle(),
                    request.getModeratorNote()
            );
            return convertToDTO(savedReport);
        }

        //domyslne zapisanie zgloszenia
        AdvertisementReport savedReport = reportRepository.save(report);
        return convertToDTO(savedReport);
        
    }

    

    /**
     * Odrzuć zgłoszenie
     */
    @Transactional
    public AdvertisementReportDTO rejectReport(Long reportId, String moderatorEmail) {
        AdvertisementReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Zgłoszenie nie znalezione"));

        User moderator = userRepository.findByEmail(moderatorEmail)
                .orElseThrow(() -> new RuntimeException("Moderator nie znaleziony"));

        if (report.getStatus() != ReportStatus.PENDING) {
            throw new RuntimeException("Zgłoszenie już zostało rozpatrzone");
        }

        report.setStatus(ReportStatus.REJECTED);
        report.setReviewedBy(moderator);
        report.setReviewedAt(LocalDateTime.now());

        AdvertisementReport savedReport = reportRepository.save(report);
        return convertToDTO(savedReport);
    }

    /**
     * Konwersja na DTO
     */
    private AdvertisementReportDTO convertToDTO(AdvertisementReport report) {
        AdvertisementReportDTO dto = new AdvertisementReportDTO();
        dto.setId(report.getId());
        

        //sprawdzenie czy ogloszenie dalej istnieje (moze byc usuniete)
        Advertisement advertisement = report.getAdvertisement();
        if(advertisement != null){
            dto.setAdvertisementId(advertisement.getId());
            dto.setAdvertisementTitle(advertisement.getTitle());
        }else{
            dto.setAdvertisementTitle("Ogloszenie zostalo usuniete");
        }
        
        // Dane zgłaszającego
        User reporter = report.getReporter();
        dto.setReporterName(reporter.getFirstName() + " " + reporter.getLastName());
        dto.setReporterEmail(reporter.getEmail());
        
        // Dane właściciela
        User owner = report.getAdvertisementOwner();
        dto.setOwnerName(owner.getFirstName() + " " + owner.getLastName());
        dto.setOwnerEmail(owner.getEmail());
        
        dto.setReason(report.getReason());
        dto.setReasonLabel(getReasonLabel(report.getReason()));
        dto.setComment(report.getComment());
        dto.setStatus(report.getStatus().name());
        dto.setModeratorNote(report.getModeratorNote());
        
        if (report.getReviewedBy() != null) {
            dto.setReviewedByName(report.getReviewedBy().getFirstName() + " " + report.getReviewedBy().getLastName());
        }
        
        dto.setCreatedAt(report.getCreatedAt());
        dto.setReviewedAt(report.getReviewedAt());
        
        return dto;
    }

    /**
     * Pobierz czytelną nazwę powodu
     */
    private String getReasonLabel(String reason) {
        switch (reason) {
            case "SPAM": return "Spam / treści promocyjne";
            case "FRAUD": return "Oszustwo / fałszywe ogłoszenie";
            case "INAPPROPRIATE": return "Nieodpowiednie treści";
            case "DUPLICATE": return "Duplikat ogłoszenia";
            case "FAKE_SELLER": return "Podejrzany sprzedawca";
            case "OTHER": return "Inne";
            default: return reason;
        }
    }



}
