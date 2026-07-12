package com.ticketbooking.backend.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ConfigValidator {

    @Value("${jwt.secret:#{null}}")
    private String jwtSecret;

    @Value("${razorpay.key.id:#{null}}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:#{null}}")
    private String razorpayKeySecret;

    @Value("${spring.security.oauth2.client.registration.google.client-id:#{null}}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret:#{null}}")
    private String googleClientSecret;

    @Value("${spring.datasource.url:#{null}}")
    private String dbUrl;

    @PostConstruct
    public void validate() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            throw new IllegalStateException("FATAL: JWT_SECRET environment variable is missing.");
        }
        if (razorpayKeyId == null || razorpayKeyId.isBlank()) {
            throw new IllegalStateException("FATAL: RAZORPAY_KEY_ID environment variable is missing.");
        }
        if (razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new IllegalStateException("FATAL: RAZORPAY_KEY_SECRET environment variable is missing.");
        }
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new IllegalStateException("FATAL: GOOGLE_CLIENT_ID environment variable is missing.");
        }
        if (googleClientSecret == null || googleClientSecret.isBlank()) {
            throw new IllegalStateException("FATAL: GOOGLE_CLIENT_SECRET environment variable is missing.");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            throw new IllegalStateException("FATAL: Database URL (MYSQL_URL / DATABASE_URL) environment variable is missing.");
        }
    }
}
