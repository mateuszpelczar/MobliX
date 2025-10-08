package com.example.backend.controller;

import com.example.backend.dto.CreateAdvertisementDTO;
import com.example.backend.dto.AdvertisementResponseDTO;
import com.example.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('STAFF')")
public class UserController {

    @Autowired
    private UserService userService;

    
}

