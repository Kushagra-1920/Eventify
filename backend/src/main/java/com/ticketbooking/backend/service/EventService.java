package com.ticketbooking.backend.service;

import com.ticketbooking.backend.dto.EventDTO;
import com.ticketbooking.backend.dto.SeatDTO;
import com.ticketbooking.backend.entity.Event;
import com.ticketbooking.backend.exception.ResourceNotFoundException;
import com.ticketbooking.backend.mapper.EntityMapper;
import com.ticketbooking.backend.repository.EventRepository;
import com.ticketbooking.backend.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final EntityMapper mapper;

    public Page<EventDTO> getAllEvents(Pageable pageable) {
        return eventRepository.findAll(pageable).map(mapper::toEventDTO);
    }

    public EventDTO getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return mapper.toEventDTO(event);
    }

    public List<SeatDTO> getEventSeats(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found with id: " + id);
        }
        return seatRepository.findByEventId(id).stream()
                .map(seat -> {
                    SeatDTO dto = mapper.toSeatDTO(seat);
                    if ("VIP".equalsIgnoreCase(seat.getSection())) dto.setPrice(new java.math.BigDecimal("999"));
                    else if ("PREMIUM".equalsIgnoreCase(seat.getSection())) dto.setPrice(new java.math.BigDecimal("570"));
                    else if ("GENERAL".equalsIgnoreCase(seat.getSection())) dto.setPrice(new java.math.BigDecimal("320"));
                    
                    if (seat.getStatus() == com.ticketbooking.backend.entity.SeatStatus.LOCKED 
                        && seat.getLockExpiryTime() != null 
                        && seat.getLockExpiryTime().isBefore(java.time.LocalDateTime.now())) {
                        dto.setStatus(com.ticketbooking.backend.entity.SeatStatus.AVAILABLE);
                        dto.setLockOwner(null);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
