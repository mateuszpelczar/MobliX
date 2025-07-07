package com.example.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.LoginRequest;
import com.example.backend.dto.RegisterRequest;
import com.example.backend.services.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {

  @Autowired
  private UserService userService;

  @PostMapping("/register")
  public ResponseEntity<String> register (@RequestBody RegisterRequest request) {
    String jwt = userService.register(request);
    return ResponseEntity.ok(jwt);
    
  }


  @PostMapping("/login")
  public ResponseEntity<String> login (@RequestBody LoginRequest request) {
    String jwt = userService.login(request);
    return ResponseEntity.ok(jwt);
  }
  

  
}
