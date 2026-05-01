package com.ocms.ocms.controller;

import com.ocms.ocms.dto.PasswordChangeDto;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Fetch Profile Details
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

    // 2. Change Password securely
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody PasswordChangeDto dto, Principal principal) {
        try {
            User user = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if the old password they typed matches the one in the database
            if (!passwordEncoder.matches(dto.getOldPassword(), user.getPasswordHash())) {
                return ResponseEntity.badRequest().body("Error: Incorrect current password.");
            }

            // Hash the new password and save it
            user.setPasswordHash(passwordEncoder.encode(dto.getNewPassword()));
            userRepository.save(user);

            return ResponseEntity.ok("Password updated successfully!");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating password.");
        }
    }
}