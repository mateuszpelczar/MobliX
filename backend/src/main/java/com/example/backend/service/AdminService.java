package com.example.backend.service;

import com.example.backend.model.Report;
import com.example.backend.model.Category;
import com.example.backend.model.User;
import com.example.backend.model.Role;
import com.example.backend.dto.*;
import com.example.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final LogRepository logRepository;
    private final AdRepository adRepository;

    @Autowired
    public AdminService(ReportRepository reportRepository,
                       UserRepository userRepository,
                       CategoryRepository categoryRepository,
                       LogRepository logRepository,
                       AdRepository adRepository) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.logRepository = logRepository;
        this.adRepository = adRepository;
    }

    public List<RaportDto> getAllRaports() {
        return reportRepository.findAll().stream()
                .map(report -> RaportDto.builder()
                        .id(report.getId())
                        .description(report.getDescription())
                        .createdAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    public StatisticDto getBestSellingSmartphone(String from, String to) {

        return StatisticDto.builder().label("Brak danych").value(0L).build();
    }

    public StatisticDto getMostSearchedItem(String from, String to) {

        return StatisticDto.builder().label("Brak danych").value(0L).build();
    }

    public void changeUserRole(Long userId, UserRoleChangeRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRole(Role.valueOf(request.getRole()));
        userRepository.save(user);
    }

    public void deleteUser(Long userId) {
        userRepository.deleteById(userId);
    }

    public CategoryDto addCategory(CategoryDto categoryDto) {
        Category category = new Category();
        category.setName(categoryDto.getName());
        category = categoryRepository.save(category);
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    public CategoryDto editCategory(Long categoryId, CategoryDto categoryDto) {
        Category category = categoryRepository.findById(categoryId).orElseThrow();
        category.setName(categoryDto.getName());
        category = categoryRepository.save(category);
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .build();
    }

    public List<LogEntryDto> getSystemLogs() {
        return logRepository.findAll().stream()
                .map(log -> LogEntryDto.builder()
                        .id(log.getId())
                        .message(log.getMessage())
                        .timestamp(log.getTimestamp() != null ? log.getTimestamp().toString() : null)
                        .build())
                .collect(Collectors.toList());
    }

    public List<SystemContentDto> getSystemContents() {

        return List.of();
    }

    public SystemContentDto updateSystemContent(Long contentId, SystemContentDto dto) {

        return SystemContentDto.builder().build();
    }

    public SystemContentDto addSystemContent(SystemContentDto dto) {

        return SystemContentDto.builder().build();
    }
}
