package com.ticketbooking.backend.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.ticketbooking.backend.dto.BookingDTO;
import com.ticketbooking.backend.dto.ConfirmBookingRequest;
import com.ticketbooking.backend.entity.Booking;
import com.ticketbooking.backend.entity.BookingStatus;
import com.ticketbooking.backend.entity.User;
import com.ticketbooking.backend.exception.ResourceNotFoundException;
import com.ticketbooking.backend.repository.BookingRepository;
import com.ticketbooking.backend.security.UserDetailsImpl;
import com.ticketbooking.backend.service.BookingService;
import lombok.Data;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;
    private final com.ticketbooking.backend.repository.UserRepository userRepository;

    public PaymentController(BookingRepository bookingRepository, BookingService bookingService, com.ticketbooking.backend.repository.UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.bookingService = bookingService;
        this.userRepository = userRepository;
    }

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Long> payload, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        Long bookingId = payload.get("bookingId");
        
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
                
        if (!booking.getUser().getId().equals(userDetails.getId())) {
            return ResponseEntity.status(403).body(Map.of("message", "Forbidden"));
        }
        
        if (booking.getBookingStatus() != BookingStatus.PENDING) {
            return ResponseEntity.badRequest().body(Map.of("message", "Booking is not pending"));
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(keyId, keySecret);
            
            // Razorpay amount is in paise (multiply by 100)
            BigDecimal amount = booking.getTotalAmount().multiply(new BigDecimal("100"));
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount.intValue());
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + bookingId);

            Order order = razorpay.orders.create(orderRequest);

            return ResponseEntity.ok(Map.of(
                    "id", order.get("id"),
                    "amount", order.get("amount"),
                    "currency", order.get("currency")
            ));
        } catch (RazorpayException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error creating Razorpay order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@RequestBody PaymentVerificationRequest request, @AuthenticationPrincipal UserDetailsImpl userDetails) {
        try {
            // Validate signature
            String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
            String generatedSignature = calculateRFC2104HMAC(payload, keySecret);
            
            if (generatedSignature.equals(request.getRazorpaySignature())) {
                // Payment is successful, confirm the booking
                ConfirmBookingRequest confirmRequest = new ConfirmBookingRequest();
                confirmRequest.setBookingId(request.getBookingId());
                confirmRequest.setTransactionId(request.getRazorpayPaymentId()); // Store razorpay payment ID
                
                User user = userRepository.findById(userDetails.getId())
                        .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                        
                BookingDTO confirmedBooking = bookingService.confirmBooking(confirmRequest, user);
                return ResponseEntity.ok(confirmedBooking);
            } else {
                return ResponseEntity.badRequest().body(Map.of("message", "Payment verification failed. Invalid signature."));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Error during verification: " + e.getMessage()));
        }
    }

    private static String calculateRFC2104HMAC(String data, String secret) throws java.security.SignatureException {
        String result;
        try {
            // Get an hmac_sha256 key from the raw secret bytes
            SecretKeySpec signingKey = new SecretKeySpec(secret.getBytes(), "HmacSHA256");

            // Get an hmac_sha256 Mac instance and initialize with the signing key
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(signingKey);

            // Compute the hmac on input data bytes
            byte[] rawHmac = mac.doFinal(data.getBytes());

            // Convert raw bytes to Hex
            result = bytesToHex(rawHmac);
        } catch (Exception e) {
            throw new java.security.SignatureException("Failed to generate HMAC : " + e.getMessage());
        }
        return result;
    }

    private static String bytesToHex(byte[] bytes) {
        StringBuilder sb = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}

@Data
class PaymentVerificationRequest {
    private Long bookingId;
    private String razorpayPaymentId;
    private String razorpayOrderId;
    private String razorpaySignature;
}
