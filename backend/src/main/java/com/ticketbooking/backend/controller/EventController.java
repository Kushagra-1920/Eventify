package com.ticketbooking.backend.controller;

import com.ticketbooking.backend.dto.EventDTO;
import com.ticketbooking.backend.dto.SeatDTO;
import com.ticketbooking.backend.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping
    public ResponseEntity<Page<EventDTO>> getAllEvents(Pageable pageable) {
        return ResponseEntity.ok(eventService.getAllEvents(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<List<SeatDTO>> getEventSeats(@PathVariable Long id) {
        return ResponseEntity.ok(eventService.getEventSeats(id));
    }
}
