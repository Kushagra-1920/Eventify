package com.ticketbooking.backend.mapper;

import com.ticketbooking.backend.dto.EventDTO;
import com.ticketbooking.backend.dto.SeatDTO;
import com.ticketbooking.backend.dto.BookingDTO;
import com.ticketbooking.backend.entity.Event;
import com.ticketbooking.backend.entity.Seat;
import com.ticketbooking.backend.entity.Booking;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EntityMapper {
    EventDTO toEventDTO(Event event);
    
    @Mapping(source = "event.id", target = "eventId")
    SeatDTO toSeatDTO(Seat seat);

    @Mapping(source = "event.id", target = "eventId")
    @Mapping(source = "event.title", target = "eventTitle")
    @Mapping(source = "event.venue", target = "venue")
    @Mapping(source = "event.dateTime", target = "eventDateTime")
    BookingDTO toBookingDTO(Booking booking);

    @org.mapstruct.AfterMapping
    default void overridePrice(Seat seat, @org.mapstruct.MappingTarget SeatDTO dto) {
        if ("VIP".equalsIgnoreCase(dto.getSection())) dto.setPrice(new java.math.BigDecimal("999"));
        else if ("PREMIUM".equalsIgnoreCase(dto.getSection())) dto.setPrice(new java.math.BigDecimal("570"));
        else if ("GENERAL".equalsIgnoreCase(dto.getSection())) dto.setPrice(new java.math.BigDecimal("320"));
    }
}
