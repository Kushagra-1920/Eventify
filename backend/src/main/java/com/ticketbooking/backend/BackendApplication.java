package com.ticketbooking.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BackendApplication {

	public static void main(String[] args) {
        sanitizeEnvironment();
		SpringApplication.run(BackendApplication.class, args);
	}

    private static void sanitizeEnvironment() {
        try {
            // 1. Sanitize Database URL (Railway might use MYSQL_URL, DATABASE_URL, or user might have set SPRING_DATASOURCE_URL)
            String dbUrl = System.getenv("SPRING_DATASOURCE_URL");
            if (dbUrl == null) dbUrl = System.getenv("DATABASE_URL");
            if (dbUrl == null) dbUrl = System.getenv("MYSQL_URL");
            
            if (dbUrl != null) {
                // Strip accidental quotes the user might have added in the Railway editor
                dbUrl = dbUrl.replace("\"", "").replace("'", "");
                
                if (dbUrl.startsWith("mysql://")) {
                    String withoutScheme = dbUrl.substring("mysql://".length());
                    int atIndex = withoutScheme.lastIndexOf('@');
                    String hostPortDb = atIndex != -1 ? withoutScheme.substring(atIndex + 1) : withoutScheme;
                    
                    String jdbcUrl = "jdbc:mysql://" + hostPortDb + "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";
                    System.setProperty("spring.datasource.url", jdbcUrl);
                    System.out.println("DEBUG: Auto-corrected DB URL into JDBC format: " + jdbcUrl);
                } else {
                    System.setProperty("spring.datasource.url", dbUrl);
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
