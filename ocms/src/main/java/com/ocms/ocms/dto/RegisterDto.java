package com.ocms.ocms.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Data Transfer Object for student self-registration requests.
 * <p>
 * Carries the form payload from the Register page to {@code AuthController#registerStudent}.
 * Every field is validated using Jakarta Bean Validation annotations so that
 * malformed input is rejected before it reaches the business logic.
 * </p>
 */
@Data
public class RegisterDto {

    /** University-issued College ID (e.g. "23mcce11"). */
    @NotBlank(message = "College ID is required.")
    @Pattern(regexp = "^\\d{2}[a-zA-Z]{3,5}\\d{2,3}$",
             message = "College ID must follow the format: 2-digit year + 3-5 letter dept code + 2-3 digit roll no.")
    private String userId;

    /** Full name of the student (2–50 alphabetic characters). */
    @NotBlank(message = "Name is required.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'.]{1,49}$",
             message = "Name must be 2-50 characters and contain only letters, spaces, apostrophes, or periods.")
    private String name;

    /** University email address — must belong to the uohyd.ac.in domain. */
    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Pattern(regexp = "^[a-zA-Z0-9._%+\\-]+@uohyd\\.ac\\.in$",
             message = "Only University of Hyderabad emails (@uohyd.ac.in) are accepted.")
    private String email;

    /** 10-digit Indian mobile number starting with 6-9. */
    @NotBlank(message = "Phone number is required.")
    @Pattern(regexp = "^[6-9]\\d{9}$",
             message = "Enter a valid 10-digit Indian mobile number starting with 6-9.")
    private String phone;

    /**
     * Account password — minimum 8 characters with at least one uppercase letter,
     * one lowercase letter, one digit, and one special character.
     */
    @NotBlank(message = "Password is required.")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
             message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.")
    private String password;
}