package com.ticketbooking.backend.controller;

import com.ticketbooking.backend.dto.BookingDTO;
import com.ticketbooking.backend.dto.ConfirmBookingRequest;
import com.ticketbooking.backend.dto.LockSeatsRequest;
import com.ticketbooking.backend.security.UserDetailsImpl;
import com.ticketbooking.backend.entity.User;
import com.ticketbooking.backend.repository.UserRepository;
import com.ticketbooking.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository; // Just to fetch the entity

    private User getUser(UserDetailsImpl userDetails) {
        return userRepository.findById(userDetails.getId()).orElseThrow();
    }

    @PostMapping("/lock-seats")
    public ResponseEntity<BookingDTO> lockSeats(@Valid @RequestBody LockSeatsRequest request,
                                                @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(bookingService.lockSeats(request, getUser(userDetails)));
    }

    @PostMapping("/confirm")
    public ResponseEntity<BookingDTO> confirmBooking(@Valid @RequestBody ConfirmBookingRequest request,
                                                     @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(bookingService.confirmBooking(request, getUser(userDetails)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<BookingDTO> cancelBooking(@PathVariable Long id,
                                                    @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, getUser(userDetails)));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingDTO>> getMyBookings(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(bookingService.getMyBookings(getUser(userDetails)));
    }

    @PutMapping("/{id}/finalize")
    public ResponseEntity<BookingDTO> finalizeBooking(@PathVariable Long id,
                                                      @Valid @RequestBody com.ticketbooking.backend.dto.FinalizeBookingRequest request,
                                                      @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(bookingService.finalizeBooking(id, request, getUser(userDetails)));
    }
}
