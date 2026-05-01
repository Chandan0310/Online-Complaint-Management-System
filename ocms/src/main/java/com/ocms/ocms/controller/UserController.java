package com.ocms.ocms.controller;

import com.ocms.ocms.dto.PasswordChangeDto;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * REST controller for authenticated user operations — profile retrieval
 * and password management.
 *
 * <p>Base path: {@code /api/users}</p>
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Returns the profile data of the currently authenticated user.
     *
     * @param principal the authenticated user identity from the JWT.
     * @return the {@link User} object (serialised as JSON).
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Principal principal) {
        try {
            User user = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching profile");
        }
    }

    /**
     * Changes the password of the currently authenticated user.
     * <p>
     * Validates the old password against the stored hash before applying
     * the new password.
     * </p>
     *
     * @param dto       validated password-change payload.
     * @param principal the authenticated user identity.
     * @return success message or {@code 400 Bad Request} if the old password is incorrect.
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordChangeDto dto, Principal principal) {
        try {
            User user = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            /* Verify the current password */
            if (!passwordEncoder.matches(dto.getOldPassword(), user.getPasswordHash())) {
                return ResponseEntity.badRequest().body("Error: Incorrect current password.");
            }

            /* Hash and persist the new password */
            user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok("Password updated successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating password.");
        }
    }
}