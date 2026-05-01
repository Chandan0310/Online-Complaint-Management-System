package com.ocms.ocms.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Data Transfer Object for creating a new complaint manager via the Admin
 * dashboard.
 * <p>
 * Carries the form payload from ManageManagers to {@code AdminController#createManager}.
 * </p>
 */
@Data
public class ManagerRequestDto {

    /** Manager's full name (2–50 alphabetic characters). */
    @NotBlank(message = "Name is required.")
    @Pattern(regexp = "^[A-Za-z][A-Za-z\\s'.]{1,49}$",
             message = "Name must be 2-50 characters and contain only letters, spaces, apostrophes, or periods.")
    private String name;

    /** 10-digit Indian mobile number starting with 6-9. */
    @NotBlank(message = "Phone number is required.")
    @Pattern(regexp = "^[6-9]\\d{9}$",
             message = "Enter a valid 10-digit Indian mobile number starting with 6-9.")
    private String phone;

    /** Manager's university email address. */
    @NotBlank(message = "Email is required.")
    @Email(message = "Enter a valid email address.")
    @Pattern(regexp = "^[a-zA-Z0-9._%+\\-]+@uohyd\\.ac\\.in$",
             message = "Only University of Hyderabad emails (@uohyd.ac.in) are accepted.")
    private String email;

    /**
     * Temporary password — minimum 8 characters with complexity requirements.
     * The manager should change this on first login.
     */
    @NotBlank(message = "Password is required.")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
             message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.")
    private String password;

    /** ID of the building/location this manager will be responsible for. */
    @NotNull(message = "Building assignment is required.")
    private Integer locationId;
}