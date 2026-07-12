package com.ticketbooking.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class FinalizeBookingRequest {
    private List<AddonItem> addons;
    private String couponCode;

    @Data
    public static class AddonItem {
        private String id;
        private String name;
        private int quantity;
        private BigDecimal price;
    }
}
