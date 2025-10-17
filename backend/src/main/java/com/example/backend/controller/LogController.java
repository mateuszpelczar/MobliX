package com.example.backend.controller;

import com.example.backend.dto.LogDTO;
import com.example.backend.service.LogService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
@CrossOrigin(origins = "http://localhost:5173")
public class LogController {

  private final LogService logService;

  public LogController(LogService logService){
    this.logService = logService;
  }

    // Pobierz WSZYSTKIE logi (tylko ADMIN)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<LogDTO>> getAllLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<LogDTO> logs = logService.getAllLogs(page, size);
        return ResponseEntity.ok(logs);
    }

    //pobiera wszystkie dane, dostep tylko dla ADMINA
    @GetMapping("/level/{level}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<LogDTO>> getLogsByLevel(
            @PathVariable String level,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        // Walidacja - tylko dozwolone poziomy
        if (!level.equals("INFO") && !level.equals("WARN") && !level.equals("ERROR")) {
            return ResponseEntity.badRequest().build();
        }

        Page<LogDTO> logs = logService.getLogsByLevel(level, page, size);
        return ResponseEntity.ok(logs);
    }

    // Pobierz logi według kategorii (tylko ADMIN)
    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<LogDTO>> getLogsByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        Page<LogDTO> logs = logService.getLogsByCategory(category, page, size);
        return ResponseEntity.ok(logs);
    }
  
  

}
