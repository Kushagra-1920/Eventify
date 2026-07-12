package com.ticketbooking.backend.service;

import com.ticketbooking.backend.dto.BookingDTO;
import com.ticketbooking.backend.dto.ConfirmBookingRequest;
import com.ticketbooking.backend.dto.LockSeatsRequest;
import com.ticketbooking.backend.entity.*;
import com.ticketbooking.backend.exception.ResourceNotFoundException;
import com.ticketbooking.backend.mapper.EntityMapper;
import com.ticketbooking.backend.repository.BookingRepository;
import com.ticketbooking.backend.repository.EventRepository;
import com.ticketbooking.backend.repository.PaymentRepository;
import com.ticketbooking.backend.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final EventRepository eventRepository;
    private final PaymentRepository paymentRepository;
    private final EntityMapper mapper;
    
    // Configurable lock timeout, e.g., 10 minutes
    private static final int LOCK_TIMEOUT_MINUTES = 10;

    /**
     * Locks seats for a user.
     * Uses Optimistic Locking (@Version in Seat). 
     * If two users try to lock the same seat simultaneously, the one that commits second 
     * will get an OptimisticLockException.
     */
    @Transactional
    public BookingDTO lockSeats(LockSeatsRequest request, User user) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());

        if (seats.size() != request.getSeatIds().size()) {
            throw new IllegalArgumentException("One or more seats not found");
        }

        BigDecimal totalAmount = BigDecimal.ZERO;
        LocalDateTime expiryTime = LocalDateTime.now().plusMinutes(LOCK_TIMEOUT_MINUTES);

        for (Seat seat : seats) {
            if (!seat.getEvent().getId().equals(event.getId())) {
                throw new IllegalArgumentException("Seat " + seat.getSeatNumber() + " does not belong to this event");
            }
            if (seat.getStatus() != SeatStatus.AVAILABLE) {
                // If a seat is locked but expired, we can take it
                if (seat.getStatus() == SeatStatus.LOCKED && seat.getLockExpiryTime() != null && seat.getLockExpiryTime().isBefore(LocalDateTime.now())) {
                    // Proceed to override lock
                } else if (seat.getStatus() == SeatStatus.LOCKED && user.getId().equals(seat.getLockOwner())) {
                    // Allow the same user to re-lock their own seat
                } else {
                    throw new IllegalArgumentException("Seat " + seat.getSeatNumber() + " is not available");
                }
            }

            // Lock the seat
            seat.setStatus(SeatStatus.LOCKED);
            seat.setLockOwner(user.getId());
            seat.setLockExpiryTime(expiryTime);
            BigDecimal seatPrice = seat.getPrice();
            if ("VIP".equalsIgnoreCase(seat.getSection())) seatPrice = new BigDecimal("999");
            else if ("PREMIUM".equalsIgnoreCase(seat.getSection())) seatPrice = new BigDecimal("570");
            else if ("GENERAL".equalsIgnoreCase(seat.getSection())) seatPrice = new BigDecimal("320");
            totalAmount = totalAmount.add(seatPrice);
        }

        // Save seats will trigger Optimistic Locking checks
        seatRepository.saveAll(seats);

        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .seats(seats)
                .totalAmount(totalAmount)
                .bookingStatus(BookingStatus.PENDING)
                .build();

        booking = bookingRepository.save(booking);
        return mapToDTO(booking);
    }

    @Transactional
    public BookingDTO confirmBooking(ConfirmBookingRequest request, User user) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking does not belong to the user");
        }

        if (booking.getBookingStatus() == BookingStatus.CONFIRMED) {
            return mapToDTO(booking);
        }

        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Booking is not in PENDING state. Current state: " + booking.getBookingStatus());
        }

        // Check if locks are still valid
        for (Seat seat : booking.getSeats()) {
            if (seat.getStatus() != SeatStatus.LOCKED || !seat.getLockOwner().equals(user.getId())) {
                throw new IllegalArgumentException("Seat lock has been lost for seat: " + seat.getSeatNumber());
            }
            if (seat.getLockExpiryTime() != null && seat.getLockExpiryTime().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Seat lock has expired for seat: " + seat.getSeatNumber());
            }
        }

        // Update seats to BOOKED
        for (Seat seat : booking.getSeats()) {
            seat.setStatus(SeatStatus.BOOKED);
            seat.setLockExpiryTime(null); // Clear expiry
        }
        seatRepository.saveAll(booking.getSeats());

        // Update booking
        booking.setBookingStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);

        // Record payment
        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .transactionId(request.getTransactionId())
                .paymentStatus(PaymentStatus.SUCCESS)
                .build();
        paymentRepository.save(payment);

        return mapToDTO(booking);
    }

    @Transactional
    public BookingDTO cancelBooking(Long bookingId, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking does not belong to the user");
        }

        if (booking.getBookingStatus() == BookingStatus.CANCELLED || booking.getBookingStatus() == BookingStatus.EXPIRED) {
            throw new IllegalArgumentException("Booking is already " + booking.getBookingStatus());
        }

        // Release seats
        for (Seat seat : booking.getSeats()) {
            seat.setStatus(SeatStatus.AVAILABLE);
            seat.setLockOwner(null);
            seat.setLockExpiryTime(null);
        }
        seatRepository.saveAll(booking.getSeats());

        booking.setBookingStatus(BookingStatus.CANCELLED);
        return mapToDTO(bookingRepository.save(booking));
    }

    public List<BookingDTO> getMyBookings(User user) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private BookingDTO mapToDTO(Booking booking) {
        return BookingDTO.builder()
                .id(booking.getId())
                .eventId(booking.getEvent().getId())
                .eventTitle(booking.getEvent().getTitle())
                .seats(booking.getSeats().stream().map(mapper::toSeatDTO).collect(Collectors.toList()))
                .totalAmount(booking.getTotalAmount())
                .venue(booking.getEvent().getVenue())
                .eventDateTime(booking.getEvent().getDateTime())
                .addons(booking.getAddons())
                .couponCode(booking.getCouponCode())
                .discountAmount(booking.getDiscountAmount())
                .addonAmount(booking.getAddonAmount())
                .taxAmount(booking.getTaxAmount())
                .bookingStatus(booking.getBookingStatus())
                .createdAt(booking.getCreatedAt())
                .build();
    }

    @Transactional
    public BookingDTO finalizeBooking(Long bookingId, com.ticketbooking.backend.dto.FinalizeBookingRequest request, User user) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        if (!booking.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Booking does not belong to the user");
        }

        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Booking is not in PENDING state");
        }

        // Calculate Seat Subtotal
        BigDecimal seatSubtotal = booking.getSeats().stream()
                .map(seat -> {
                    if ("VIP".equalsIgnoreCase(seat.getSection())) return new BigDecimal("999");
                    if ("PREMIUM".equalsIgnoreCase(seat.getSection())) return new BigDecimal("570");
                    if ("GENERAL".equalsIgnoreCase(seat.getSection())) return new BigDecimal("320");
                    return seat.getPrice();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Validate and apply coupon
        BigDecimal discount = BigDecimal.ZERO;
        String appliedCoupon = null;
        if (request.getCouponCode() != null && !request.getCouponCode().trim().isEmpty()) {
            String code = request.getCouponCode().trim().toUpperCase();
            if (code.equals("WELCOME10")) {
                discount = seatSubtotal.multiply(new BigDecimal("0.10"));
                appliedCoupon = code;
            } else if (code.equals("EARLYBIRD")) {
                if (seatSubtotal.compareTo(new BigDecimal("1000")) > 0) {
                    discount = new BigDecimal("200");
                    appliedCoupon = code;
                } else {
                    throw new IllegalArgumentException("EARLYBIRD coupon requires ticket total > ₹1000");
                }
            } else if (code.equals("FESTIVE25")) {
                BigDecimal possibleDiscount = seatSubtotal.multiply(new BigDecimal("0.25"));
                discount = possibleDiscount.min(new BigDecimal("500"));
                appliedCoupon = code;
            } else {
                throw new IllegalArgumentException("Invalid or expired coupon code");
            }
        }

        // Calculate Addon Subtotal
        BigDecimal addonSubtotal = BigDecimal.ZERO;
        StringBuilder addonsJson = new StringBuilder("[");
        if (request.getAddons() != null && !request.getAddons().isEmpty()) {
            for (int i = 0; i < request.getAddons().size(); i++) {
                com.ticketbooking.backend.dto.FinalizeBookingRequest.AddonItem item = request.getAddons().get(i);
                
                BigDecimal correctPrice = BigDecimal.ZERO;
                if (item.getId().equals("addon_popcorn")) correctPrice = new BigDecimal("150");
                else if (item.getId().equals("addon_nachos")) correctPrice = new BigDecimal("180");
                else if (item.getId().equals("addon_coffee")) correctPrice = new BigDecimal("120");
                else if (item.getId().equals("addon_soda")) correctPrice = new BigDecimal("80");
                else throw new IllegalArgumentException("Invalid addon selected");

                BigDecimal itemTotal = correctPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
                addonSubtotal = addonSubtotal.add(itemTotal);

                addonsJson.append(String.format("{\"id\":\"%s\",\"name\":\"%s\",\"quantity\":%d,\"price\":%d}",
                        item.getId(), item.getName(), item.getQuantity(), correctPrice.intValue()));
                if (i < request.getAddons().size() - 1) {
                    addonsJson.append(",");
                }
            }
        }
        addonsJson.append("]");

        // Subtotal after Discount
        BigDecimal subtotal = seatSubtotal.subtract(discount).add(addonSubtotal);
        if (subtotal.compareTo(BigDecimal.ZERO) < 0) {
            subtotal = BigDecimal.ZERO;
        }

        // Tax (18% GST)
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.18"));
        
        // Final Total
        BigDecimal finalTotal = subtotal.add(tax);

        // Update booking fields
        booking.setAddons(request.getAddons() == null || request.getAddons().isEmpty() ? null : addonsJson.toString());
        booking.setCouponCode(appliedCoupon);
        booking.setDiscountAmount(discount);
        booking.setAddonAmount(addonSubtotal);
        booking.setTaxAmount(tax);
        booking.setTotalAmount(finalTotal);

        bookingRepository.save(booking);

        return mapToDTO(booking);
    }
}
