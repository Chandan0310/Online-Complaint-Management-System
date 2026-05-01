package com.ocms.ocms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

/**
 * Data Transfer Object for password change requests.
 * <p>
 * Carries the old and new passwords from the profile page
 * to {@code UserController#changePassword}.
 * </p>
 */
@Data
public class PasswordChangeDto {

    /** The user's current password (for verification). */
    @NotBlank(message = "Current password is required.")
    private String oldPassword;

    /**
     * The desired new password — minimum 8 characters with at least one
     * uppercase letter, one lowercase letter, one digit, and one special character.
     */
    @NotBlank(message = "New password is required.")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#])[A-Za-z\\d@$!%*?&#]{8,}$",
             message = "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 digit, and 1 special character.")
    private String newPassword;
}