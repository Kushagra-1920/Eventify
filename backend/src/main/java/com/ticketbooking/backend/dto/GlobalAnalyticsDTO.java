package com.ticketbooking.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class GlobalAnalyticsDTO {
    private long totalUsers;
    private long totalEvents;
    private long totalBookings;
    private BigDecimal totalRevenue;
    private List<RevenueDataPoint> revenueOverTime;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class RevenueDataPoint {
        private String date;
        private BigDecimal amount;
    }
}
