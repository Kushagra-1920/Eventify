package com.ticketbooking.backend.repository;

import com.ticketbooking.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByEventId(Long eventId);

    @Query("SELECT s FROM Seat s WHERE s.lockExpiryTime < :now AND s.status = 'LOCKED'")
    List<Seat> findExpiredLocks(LocalDateTime now);
}
