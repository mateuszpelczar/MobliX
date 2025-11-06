package com.example.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.service.AdminStatsService;

@RestController
@RequestMapping("/api/admin/stats")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminStatsController {

  private final AdminStatsService adminStatsService;

  public AdminStatsController(AdminStatsService adminStatsService){
    this.adminStatsService = adminStatsService;
  }

  @GetMapping("/dashboard")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<Map<String, Object>> getDashboardStats(){
    Map<String, Object> stats = adminStatsService.getAdminDashboard();
    return ResponseEntity.ok(stats);
  }
  
  
}
