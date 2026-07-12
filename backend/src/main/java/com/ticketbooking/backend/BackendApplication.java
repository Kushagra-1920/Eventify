package com.ticketbooking.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.net.URI;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
        sanitizeEnvironment();
		SpringApplication.run(BackendApplication.class, args);
	}

    private static void sanitizeEnvironment() {
        try {
            // 1. Sanitize MYSQL_URL if present (Railway injects mysql:// but Java needs jdbc:mysql://)
            String mysqlUrl = System.getenv("MYSQL_URL");
            if (mysqlUrl != null) {
                // Strip accidental quotes the user might have added in the Railway editor
                mysqlUrl = mysqlUrl.replace("\"", "").replace("'", "");
                
                if (mysqlUrl.startsWith("mysql://")) {
                    URI uri = new URI(mysqlUrl);
                    String host = uri.getHost();
                    int port = uri.getPort() == -1 ? 3306 : uri.getPort();
                    String path = uri.getPath(); // e.g. /railway
                    
                    String jdbcUrl = "jdbc:mysql://" + host + ":" + port + path + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
                    System.setProperty("spring.datasource.url", jdbcUrl);
                    System.out.println("DEBUG: Auto-corrected MYSQL_URL into JDBC format: " + jdbcUrl);
                } else {
                    System.setProperty("spring.datasource.url", mysqlUrl);
                }
            }

            // 2. Sanitize user and password just in case they have quotes
            String user = System.getenv("MYSQLUSER");
            if (user != null) System.setProperty("spring.datasource.username", user.replace("\"", "").replace("'", ""));
            
            String pass = System.getenv("MYSQLPASSWORD");
            if (pass != null) System.setProperty("spring.datasource.password", pass.replace("\"", "").replace("'", ""));
            
            // 3. Sanitize CORS origins to fix double quotes breaking frontend connection
            String cors = System.getenv("ALLOWED_ORIGINS");
            if (cors != null) System.setProperty("app.cors.allowed-origins", cors.replace("\"", "").replace("'", ""));
            
            // 4. Sanitize frontend URL
            String frontend = System.getenv("FRONTEND_URL");
            if (frontend != null) System.setProperty("app.frontend.url", frontend.replace("\"", "").replace("'", ""));
            
            // 5. Sanitize Profiles
            String profiles = System.getenv("SPRING_PROFILES_ACTIVE");
            if (profiles != null) System.setProperty("spring.profiles.active", profiles.replace("\"", "").replace("'", ""));

        } catch (Exception e) {
            System.err.println("WARNING: Failed to sanitize environment variables: " + e.getMessage());
        }
    }
}
