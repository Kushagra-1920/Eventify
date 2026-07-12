package com.ticketbooking.backend;

import com.ticketbooking.backend.dto.LockSeatsRequest;
import com.ticketbooking.backend.entity.Event;
import com.ticketbooking.backend.entity.EventStatus;
import com.ticketbooking.backend.entity.Role;
import com.ticketbooking.backend.entity.Seat;
import com.ticketbooking.backend.entity.SeatStatus;
import com.ticketbooking.backend.entity.User;
import com.ticketbooking.backend.repository.EventRepository;
import com.ticketbooking.backend.repository.SeatRepository;
import com.ticketbooking.backend.repository.UserRepository;
import com.ticketbooking.backend.service.BookingService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class BookingServiceConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EventRepository eventRepository;

    private User user1;
    private User user2;
    private Event event;
    private Seat seat;

    @BeforeEach
    void setUp() {
        // Clear DB
        seatRepository.deleteAll();
        eventRepository.deleteAll();
        userRepository.deleteAll();

        user1 = userRepository.save(User.builder().name("User 1").email("u1@test.com").password("pass").role(Role.USER).build());
        user2 = userRepository.save(User.builder().name("User 2").email("u2@test.com").password("pass").role(Role.USER).build());

        event = eventRepository.save(Event.builder()
                .title("Test Event")
                .venue("Test Venue")
                .dateTime(LocalDateTime.now().plusDays(1))
                .status(EventStatus.UPCOMING)
                .build());

        seat = seatRepository.save(Seat.builder()
                .event(event)
                .section("VIP")
                .row("A")
                .seatNumber("A1")
                .price(new BigDecimal("1000"))
                .status(SeatStatus.AVAILABLE)
                .build());
    }

    @Test
    void testConcurrentSeatLocking() throws InterruptedException {
        int numberOfThreads = 2;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(numberOfThreads);
        
        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger lockFailureCount = new AtomicInteger(0);

        LockSeatsRequest request = new LockSeatsRequest();
        request.setEventId(event.getId());
        request.setSeatIds(List.of(seat.getId()));

        Runnable task1 = () -> {
            try {
                latch.await();
                bookingService.lockSeats(request, user1);
                successCount.incrementAndGet();
            } catch (ObjectOptimisticLockingFailureException e) {
                lockFailureCount.incrementAndGet();
            } catch (Exception e) {
                // Ignore other exceptions for this test scope
            } finally {
                doneLatch.countDown();
            }
        };

        Runnable task2 = () -> {
            try {
                latch.await();
                bookingService.lockSeats(request, user2);
                successCount.incrementAndGet();
            } catch (ObjectOptimisticLockingFailureException e) {
                lockFailureCount.incrementAndGet();
            } catch (Exception e) {
                // Ignore other exceptions
            } finally {
                doneLatch.countDown();
            }
        };

        executorService.submit(task1);
        executorService.submit(task2);

        // Start both threads simultaneously
        latch.countDown();
        doneLatch.await();

        // Exactly one should succeed, exactly one should fail due to optimistic locking
        assertEquals(1, successCount.get());
        assertEquals(1, lockFailureCount.get());

        // Verify final state of the seat
        Seat updatedSeat = seatRepository.findById(seat.getId()).orElseThrow();
        assertEquals(SeatStatus.LOCKED, updatedSeat.getStatus());
        assertEquals(1, updatedSeat.getVersion()); // Version should increment by 1
    }
}
