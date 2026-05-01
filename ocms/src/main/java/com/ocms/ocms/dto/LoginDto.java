package com.ocms.ocms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Data Transfer Object for authentication (login) requests.
 * <p>
 * Carries the College ID and password from the Login page
 * to {@code AuthController#loginUser}.
 * </p>
 */
@Data
public class LoginDto {

    /** University-issued College ID (e.g. "23mcce11"). */
    @NotBlank(message = "College ID is required.")
    private String userId;

    /** Account password. */
    @NotBlank(message = "Password is required.")
    private String password;
}