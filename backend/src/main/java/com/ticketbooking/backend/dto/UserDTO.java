package com.ticketbooking.backend.dto;

import com.ticketbooking.backend.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String profilePicture;
    private LocalDateTime createdAt;
}
