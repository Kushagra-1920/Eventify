package com.ticketbooking.backend.repository;

import com.ticketbooking.backend.entity.Booking;
import com.ticketbooking.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByBookingStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime time);
}
