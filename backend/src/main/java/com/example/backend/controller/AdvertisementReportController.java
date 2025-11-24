package com.example.backend.controller;


import com.example.backend.dto.AdvertisementReportDTO;
import com.example.backend.others.CreateReportRequest;
import com.example.backend.others.ReviewReportRequest;
import com.example.backend.service.AdvertisementReportService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class AdvertisementReportController {

    private final AdvertisementReportService reportService;

    public AdvertisementReportController(AdvertisementReportService reportService){
      this.reportService = reportService;
    }

    /** 
    stworzenie nowego zgloszenia dla uzytkownika
    niezalogowany uzytkownik nie moze stworzyc zgloszenia
    */
    @PostMapping("/{advertisementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> createReport(
        @PathVariable Long advertisementId,
        @RequestBody CreateReportRequest request,
        Authentication authentication
        ){
          
          if(request.getReason() == null || request.getReason().trim().isEmpty()){
            return ResponseEntity.badRequest().body("Prosze podac powod zgloszenia");
          }
          try{
          String userEmail = authentication.getName();
          AdvertisementReportDTO report = reportService.createReport(advertisementId, userEmail, request);
          return ResponseEntity.status(HttpStatus.CREATED).body(report);
        }catch (IllegalStateException e){
          return ResponseEntity.badRequest().body(e.getMessage());
        }catch (Exception e) {
          return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body("Blad podczas tworzenia zgloszenia: " + e.getMessage());
        }
        }

      /**
       * pobierz wszystkie zgloszenia (staff panel)
       * 
       */
      @GetMapping
      @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
        public ResponseEntity<List<AdvertisementReportDTO>> getAllReports(
            @RequestParam(required = false) String status) {
        
        try {
            List<AdvertisementReportDTO> reports;
            
            if (status != null && !status.trim().isEmpty()) {
                reports = reportService.getReportsByStatus(status.toUpperCase());
            } else {
                reports = reportService.getAllReports();
            }
            
            return ResponseEntity.ok(reports);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Ocena zgloszenia - zaakceptowanie = usuniecie ogloszenia lub ostrzezenie
     **/
    @PostMapping("/{reportId}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> reviewReport(
            @PathVariable Long reportId,
            @RequestBody ReviewReportRequest request,
            Authentication authentication) {
        
        if (request.getAction() == null || request.getAction().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Wymagane jest usuniecie lub odrzucenie");
        }

        if (!request.getAction().equals("DELETE") && !request.getAction().equals("WARNING")) {
            return ResponseEntity.badRequest().body("Akcja wymaga usunieta lub wyslaniaostrzezenie ");
        }

        if (request.getAction().equals("WARNING") && 
            (request.getModeratorNote() == null || request.getModeratorNote().trim().isEmpty())) {
            return ResponseEntity.badRequest().body("komentarz moderatora nie jest wymagany");
        }

        try {
            String moderatorEmail = authentication.getName();
            AdvertisementReportDTO report = reportService.reviewReport(
                    reportId, 
                    moderatorEmail, 
                    request);
            
            return ResponseEntity.ok(report);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Blad podczas przegladania zgloszenia: " + e.getMessage());
        }
    }

    /**
     * odrzucenie zgloszenia
     */
    @PostMapping("/{reportId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<?> rejectReport(
            @PathVariable Long reportId,
            Authentication authentication) {
        
        try {
            String moderatorEmail = authentication.getName();
            AdvertisementReportDTO report = reportService.rejectReport(reportId, moderatorEmail);
            return ResponseEntity.ok(report);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Blad podczas przegladania zgloszenia: " + e.getMessage());
        }
    }
        
}