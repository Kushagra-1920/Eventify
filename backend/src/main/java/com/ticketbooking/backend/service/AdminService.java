package com.ticketbooking.backend.service;

import com.ticketbooking.backend.dto.AnalyticsDTO;
import com.ticketbooking.backend.dto.EventDTO;
import com.ticketbooking.backend.entity.Event;
import com.ticketbooking.backend.entity.Seat;
import com.ticketbooking.backend.entity.SeatStatus;
import com.ticketbooking.backend.entity.BookingStatus;
import com.ticketbooking.backend.exception.ResourceNotFoundException;
import com.ticketbooking.backend.mapper.EntityMapper;
import com.ticketbooking.backend.repository.BookingRepository;
import com.ticketbooking.backend.repository.EventRepository;
import com.ticketbooking.backend.repository.SeatRepository;
import com.ticketbooking.backend.repository.UserRepository;
import com.ticketbooking.backend.dto.GlobalAnalyticsDTO;
import com.ticketbooking.backend.dto.UserDTO;
import com.ticketbooking.backend.dto.BookingDTO;
import com.ticketbooking.backend.entity.User;
import com.ticketbooking.backend.entity.Role;
import com.ticketbooking.backend.entity.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final EntityMapper mapper;

    public EventDTO createEvent(Event event) {
        return mapper.toEventDTO(eventRepository.save(event));
    }

    public EventDTO updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setVenue(eventDetails.getVenue());
        event.setDateTime(eventDetails.getDateTime());
        event.setCategory(eventDetails.getCategory());
        event.setBannerUrl(eventDetails.getBannerUrl());
        event.setStatus(eventDetails.getStatus());

        return mapper.toEventDTO(eventRepository.save(event));
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    public AnalyticsDTO getEventAnalytics(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResourceNotFoundException("Event not found");
        }

        List<Seat> seats = seatRepository.findByEventId(id);
        long totalSeats = seats.size();
        
        long available = seats.stream().filter(s -> s.getStatus() == SeatStatus.AVAILABLE).count();
        long locked = seats.stream().filter(s -> s.getStatus() == SeatStatus.LOCKED).count();
        long booked = seats.stream().filter(s -> s.getStatus() == SeatStatus.BOOKED).count();

        int occupancy = totalSeats > 0 ? (int) ((booked * 100) / totalSeats) : 0;
        
        var bookings = bookingRepository.findAll().stream()
                .filter(b -> b.getEvent().getId().equals(id))
                .toList();

        long confirmedBookings = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED).count();
        long cancelledBookings = bookings.stream().filter(b -> b.getBookingStatus() == BookingStatus.CANCELLED).count();
        
        BigDecimal revenue = bookings.stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .map(b -> b.getTotalAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return AnalyticsDTO.builder()
                .totalBookings(confirmedBookings)
                .totalCancelled(cancelledBookings)
                .totalRevenue(revenue)
                .occupancyPercentage(occupancy)
                .availableSeats(available)
                .lockedSeats(locked)
                .build();
    }

    public GlobalAnalyticsDTO getGlobalAnalytics() {
        long totalUsers = userRepository.count();
        long totalEvents = eventRepository.count();
        
        List<Booking> confirmedBookings = bookingRepository.findAll().stream()
                .filter(b -> b.getBookingStatus() == BookingStatus.CONFIRMED)
                .toList();
                
        long totalBookings = confirmedBookings.size();
        
        BigDecimal totalRevenue = confirmedBookings.stream()
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Calculate revenue over the last 7 days
        java.time.LocalDate today = java.time.LocalDate.now();
        List<GlobalAnalyticsDTO.RevenueDataPoint> revenueOverTime = new java.util.ArrayList<>();
        
        for (int i = 6; i >= 0; i--) {
            java.time.LocalDate date = today.minusDays(i);
            BigDecimal dayRevenue = confirmedBookings.stream()
                .filter(b -> b.getCreatedAt().toLocalDate().equals(date))
                .map(Booking::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
            revenueOverTime.add(new GlobalAnalyticsDTO.RevenueDataPoint(date.toString(), dayRevenue));
        }

        return GlobalAnalyticsDTO.builder()
                .totalUsers(totalUsers)
                .totalEvents(totalEvents)
                .totalBookings(totalBookings)
                .totalRevenue(totalRevenue)
                .revenueOverTime(revenueOverTime)
                .build();
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> UserDTO.builder()
                        .id(u.getId())
                        .name(u.getName())
                        .email(u.getEmail())
                        .role(u.getRole())
                        .phone(u.getPhone())
                        .createdAt(u.getCreatedAt())
                        .build())
                .toList();
    }

    public UserDTO updateUserRole(Long userId, String roleStr) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        try {
            Role role = Role.valueOf(roleStr.toUpperCase());
            user.setRole(role);
            user = userRepository.save(user);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role");
        }
        
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .build();
    }

    public List<BookingDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(mapper::toBookingDTO)
                .toList();
    }

    public void cancelBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        
        if (booking.getBookingStatus() != BookingStatus.CANCELLED) {
            booking.setBookingStatus(BookingStatus.CANCELLED);
            bookingRepository.save(booking);
            
            // Release seats
            java.util.List<Seat> seats = booking.getSeats();
            for (Seat seat : seats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockOwner(null);
                seat.setLockExpiryTime(null);
            }
            seatRepository.saveAll(seats);
        }
    }
}
