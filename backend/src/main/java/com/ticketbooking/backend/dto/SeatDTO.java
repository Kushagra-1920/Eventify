package com.ticketbooking.backend.dto;

import com.ticketbooking.backend.entity.SeatStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class SeatDTO {
    private Long id;
    private Long eventId;
    private String section;
    private String row;
    private String seatNumber;
    private BigDecimal price;
    private SeatStatus status;
    private Long lockOwner;
}
