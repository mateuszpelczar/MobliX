package com.example.backend.controller;

import com.example.backend.dto.*;
import com.example.backend.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.lang.annotation.Repeatable;
import java.util.List;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService){
        this.adminService=adminService;
    }


    @GetMapping("/raports")
    public ResponseEntity<List<RaportDto>> getAllRaports(){
        return ResponseEntity.ok(adminService.getAllRaports());
    }

    @GetMapping("/stats/best-selling-smartphone")
    public ResponseEntity<StatisticDto> getBestSellingSmartphone(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(adminService.getBestSellingSmartphone(from, to));
    }

    @GetMapping("/stats/most-searched-item")
    public ResponseEntity<StatisticDto> getMostSearchedItem(@RequestParam String from, @RequestParam String to) {
        return ResponseEntity.ok(adminService.getMostSearchedItem(from, to));
    }

    @PutMapping("/users/{userId}/role")
    public ResponseEntity<Void> changeUserRole(@PathVariable Long userId, @RequestBody UserRoleChangeRequest request) {
        adminService.changeUserRole(userId, request);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/categories")
    public ResponseEntity<CategoryDto> addCategory(@RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(adminService.addCategory(categoryDto));
    }
    @PutMapping("/categories/{categoryId}")
    public ResponseEntity<CategoryDto> editCategory(@PathVariable Long categoryId, @RequestBody CategoryDto categoryDto) {
        return ResponseEntity.ok(adminService.editCategory(categoryId, categoryDto));
    }

    // 8. Wyświetlanie logów systemowych
    @GetMapping("/logs")
    public ResponseEntity<List<LogEntryDto>> getSystemLogs() {
        return ResponseEntity.ok(adminService.getSystemLogs());
    }

    @GetMapping("/system-content")
    public ResponseEntity<List<SystemContentDto>> getSystemContents() {
        return ResponseEntity.ok(adminService.getSystemContents());
    }

    @PutMapping("/system-content/{contentId}")
    public ResponseEntity<SystemContentDto> updateSystemContent(@PathVariable Long contentId, @RequestBody SystemContentDto dto) {
        return ResponseEntity.ok(adminService.updateSystemContent(contentId, dto));
    }

    @PostMapping("/system-content")
    public ResponseEntity<SystemContentDto> addSystemContent(@RequestBody SystemContentDto dto) {
        return ResponseEntity.ok(adminService.addSystemContent(dto));
    }



}
