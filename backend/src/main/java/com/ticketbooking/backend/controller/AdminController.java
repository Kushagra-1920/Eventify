package com.ticketbooking.backend.controller;

import com.ticketbooking.backend.dto.AnalyticsDTO;
import com.ticketbooking.backend.dto.GlobalAnalyticsDTO;
import com.ticketbooking.backend.dto.EventDTO;
import com.ticketbooking.backend.dto.UserDTO;
import com.ticketbooking.backend.entity.Event;
import com.ticketbooking.backend.entity.Booking;
import com.ticketbooking.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @PostMapping("/events")
    public ResponseEntity<EventDTO> createEvent(@RequestBody Event event) {
        return ResponseEntity.ok(adminService.createEvent(event));
    }

    @PutMapping("/events/{id}")
    public ResponseEntity<EventDTO> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        return ResponseEntity.ok(adminService.updateEvent(id, event));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        adminService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/events/{id}/analytics")
    public ResponseEntity<AnalyticsDTO> getEventAnalytics(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getEventAnalytics(id));
    }

    @GetMapping("/analytics/global")
    public ResponseEntity<GlobalAnalyticsDTO> getGlobalAnalytics() {
        return ResponseEntity.ok(adminService.getGlobalAnalytics());
    }

    @GetMapping("/users")
    public ResponseEntity<java.util.List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<UserDTO> updateUserRole(@PathVariable Long id, @RequestParam String role) {
        return ResponseEntity.ok(adminService.updateUserRole(id, role));
    }

    @GetMapping("/bookings")
    public ResponseEntity<java.util.List<com.ticketbooking.backend.dto.BookingDTO>> getAllBookings() {
        return ResponseEntity.ok(adminService.getAllBookings());
    }

    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<Void> cancelBooking(@PathVariable Long id) {
        adminService.cancelBooking(id);
        return ResponseEntity.ok().build();
    }
}
