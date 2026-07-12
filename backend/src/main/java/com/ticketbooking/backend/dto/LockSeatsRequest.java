package com.ticketbooking.backend.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class LockSeatsRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotEmpty(message = "Seat IDs are required")
    private List<Long> seatIds;
}
