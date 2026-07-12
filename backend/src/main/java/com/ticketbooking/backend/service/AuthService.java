package com.ticketbooking.backend.service;

import com.ticketbooking.backend.dto.AuthRequest;
import com.ticketbooking.backend.dto.AuthResponse;
import com.ticketbooking.backend.dto.RefreshTokenRequest;
import com.ticketbooking.backend.dto.RegisterRequest;
import com.ticketbooking.backend.dto.UpdateProfileRequest;
import com.ticketbooking.backend.entity.Role;
import com.ticketbooking.backend.entity.User;
import com.ticketbooking.backend.repository.UserRepository;
import com.ticketbooking.backend.security.JwtUtils;
import com.ticketbooking.backend.security.UserDetailsImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .build();
        userRepository.save(user);
        return authenticateAndGenerateResponse(request.getEmail(), request.getPassword());
    }

    public AuthResponse login(AuthRequest request) {
        return authenticateAndGenerateResponse(request.getEmail(), request.getPassword());
    }

    private AuthResponse authenticateAndGenerateResponse(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);
        User user = userRepository.findByEmail(email).orElseThrow();
        return AuthResponse.builder()
                .token(jwt)
                .refreshToken(refreshToken)
                .id(userDetails.getId())
                .name(userDetails.getName())
                .email(userDetails.getEmail())
                .role(userDetails.getAuthorities().iterator().next().getAuthority().replace("ROLE_", ""))
                .phone(user.getPhone())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        if (jwtUtils.validateJwtToken(requestRefreshToken)) {
            String email = jwtUtils.getUserNameFromJwtToken(requestRefreshToken);
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            String token = jwtUtils.generateTokenFromUsername(email);
            return AuthResponse.builder()
                    .token(token)
                    .refreshToken(requestRefreshToken)
                    .id(user.getId())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole().name())
                    .phone(user.getPhone())
                    .profilePicture(user.getProfilePicture())
                    .build();
        }
        throw new IllegalArgumentException("Invalid refresh token");
    }

    public AuthResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .profilePicture(user.getProfilePicture())
                .build();
    }

    @Transactional
    public AuthResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (request.getName() != null && !request.getName().isBlank()) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
        userRepository.save(user);
        return AuthResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .phone(user.getPhone())
                .profilePicture(user.getProfilePicture())
                .build();
    }
}
