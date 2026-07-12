package com.ticketbooking.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "seats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private Event event;

    @Column(nullable = false)
    private String section;

    @Column(name = "seat_row", nullable = false)
    private String row;

    @Column(nullable = false)
    private String seatNumber;

    @Column(nullable = false)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status;

    @Column(name = "lock_owner")
    private Long lockOwner; // User ID who locked the seat

    @Column(name = "lock_expiry_time")
    private LocalDateTime lockExpiryTime;

    /**
     * Optimistic Locking is used here instead of Pessimistic Locking because:
     * 1. It provides better throughput, as it doesn't hold physical database locks during user think-time (checkout process).
     * 2. It prevents long DB locks that could degrade overall system performance.
     * 3. Write conflicts (two people selecting the exact same seat at the exact same millisecond) are relatively infrequent compared to reads.
     * 
     * When two transactions try to modify the same seat simultaneously, the one that commits second 
     * will encounter an OptimisticLockException due to a version mismatch. We will catch this 
     * exception and return a 409 Conflict.
     */
    @Version
    private Long version;
}
