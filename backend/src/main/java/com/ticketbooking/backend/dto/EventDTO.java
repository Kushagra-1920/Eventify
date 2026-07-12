package com.ticketbooking.backend.dto;

import com.ticketbooking.backend.entity.EventStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class EventDTO {
    private Long id;
    private String title;
    private String description;
    private String venue;
    private LocalDateTime dateTime;
    private com.ticketbooking.backend.entity.EventCategory category;
    private String bannerUrl;
    private EventStatus status;
}
