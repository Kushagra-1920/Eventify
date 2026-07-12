package com.ticketbooking.backend.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class AnalyticsDTO {
    private long totalBookings;
    private long totalCancelled;
    private BigDecimal totalRevenue;
    private int occupancyPercentage;
    private long availableSeats;
    private long lockedSeats;
}
