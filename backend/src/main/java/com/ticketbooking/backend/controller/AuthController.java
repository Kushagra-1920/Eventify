package com.ticketbooking.backend.controller;

import com.ticketbooking.backend.dto.AuthRequest;
import com.ticketbooking.backend.dto.AuthResponse;
import com.ticketbooking.backend.dto.RefreshTokenRequest;
import com.ticketbooking.backend.dto.RegisterRequest;
import com.ticketbooking.backend.dto.UpdateProfileRequest;
import com.ticketbooking.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> registerUser(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginUser(@Valid @RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("AuthController /me - request is not authenticated!");
                return ResponseEntity.status(401).build();
            }
            String email = auth.getName();
            System.out.println("AuthController /me - email: " + email);
            return ResponseEntity.ok(authService.getCurrentUser(email));
        } catch (Exception e) {
            System.out.println("AuthController /me - Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @PutMapping("/me")
    public ResponseEntity<AuthResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        try {
            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                System.out.println("AuthController PUT /me - request is not authenticated!");
                return ResponseEntity.status(401).build();
            }
            String email = auth.getName();
            System.out.println("AuthController PUT /me - email: " + email);
            return ResponseEntity.ok(authService.updateProfile(email, request));
        } catch (Exception e) {
            System.out.println("AuthController PUT /me - Error: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}

