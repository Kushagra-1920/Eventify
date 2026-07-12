package com.ticketbooking.backend.dto;

import com.ticketbooking.backend.entity.BookingStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class BookingDTO {
    private Long id;
    private Long eventId;
    private String eventTitle;
    private List<SeatDTO> seats;
    private BigDecimal totalAmount;
    private String venue;
    private LocalDateTime eventDateTime;
    private String addons;
    private String couponCode;
    private BigDecimal discountAmount;
    private BigDecimal addonAmount;
    private BigDecimal taxAmount;
    private BookingStatus bookingStatus;
    private LocalDateTime createdAt;
}
