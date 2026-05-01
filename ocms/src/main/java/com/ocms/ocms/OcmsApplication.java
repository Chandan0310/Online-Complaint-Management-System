package com.ocms.ocms;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Entry point for the Online Complaint Management System (OCMS) backend.
 * <p>
 * Bootstraps the Spring Boot application which exposes REST APIs for
 * authentication, complaint management, user profiles, and admin operations.
 * </p>
 */
@SpringBootApplication
public class OcmsApplication {

    /**
     * Application entry point.
     *
     * @param args command-line arguments (none expected).
     */
    public static void main(String[] args) {
        SpringApplication.run(OcmsApplication.class, args);
    }
}
