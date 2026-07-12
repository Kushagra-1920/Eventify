package com.ticketbooking.backend.scheduler;

import com.ticketbooking.backend.entity.BookingStatus;
import com.ticketbooking.backend.entity.Seat;
import com.ticketbooking.backend.entity.SeatStatus;
import com.ticketbooking.backend.repository.BookingRepository;
import com.ticketbooking.backend.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class SeatScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SeatScheduler.class);
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void releaseExpiredLocks() {
        LocalDateTime now = LocalDateTime.now();
        List<Seat> expiredSeats = seatRepository.findExpiredLocks(now);

        if (!expiredSeats.isEmpty()) {
            logger.info("Found {} expired seats. Releasing locks...", expiredSeats.size());
            
            for (Seat seat : expiredSeats) {
                seat.setStatus(SeatStatus.AVAILABLE);
                seat.setLockOwner(null);
                seat.setLockExpiryTime(null);
            }
            
            // Releasing the seats updates their version, letting Optimistic Locking do its job
            seatRepository.saveAll(expiredSeats);
            logger.info("Successfully released expired seats.");
        }

        // We should also expire PENDING bookings older than timeout
        var expiredBookings = bookingRepository.findByBookingStatusAndCreatedAtBefore(
                BookingStatus.PENDING, now.minusMinutes(10));
                
        if (!expiredBookings.isEmpty()) {
            expiredBookings.forEach(b -> b.setBookingStatus(BookingStatus.EXPIRED));
            bookingRepository.saveAll(expiredBookings);
        }
    }
}
