package com.ocms.ocms.controller;

import com.ocms.ocms.config.JwtUtil;
import com.ocms.ocms.dto.LoginDto;
import com.ocms.ocms.dto.RegisterDto;
import com.ocms.ocms.entity.Role;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller that handles public authentication endpoints — student
 * self-registration and login for all roles.
 *
 * <p>Base path: {@code /api/auth}</p>
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    /**
     * Registers a new student account.
     * <p>
     * Validates the payload, checks for duplicate College ID and email, hashes
     * the password, and persists the new {@link User} with the {@code STUDENT} role.
     * </p>
     *
     * @param dto validated registration payload.
     * @return success message or a {@code 400 Bad Request} on duplicate fields.
     */
    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@Valid @RequestBody RegisterDto dto) {
        /* Check for duplicate College ID */
        if (userRepository.existsById(dto.getUserId().toLowerCase())) {
            return ResponseEntity.badRequest().body("Error: College ID already exists!");
        }

        /* Check for duplicate email */
        if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email already in use!");
        }

        /* Build and persist the new user */
        User user = new User();
        user.setUserId(dto.getUserId().toLowerCase());
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setRole(Role.STUDENT);

        userRepository.save(user);

        return ResponseEntity.ok("Student registered successfully!");
    }

    /**
     * Authenticates a user by College ID and password and returns a JWT token.
     * <p>
     * On success the response body contains {@code token}, {@code userId},
     * {@code role}, and {@code name}.
     * </p>
     *
     * @param dto validated login payload.
     * @return JWT token bundle or {@code 401 Unauthorized} on bad credentials.
     */
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginDto dto) {
        /* Look up user by College ID (case-insensitive) */
        Optional<User> userOptional = userRepository.findById(dto.getUserId().toLowerCase());

        if (userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Error: Invalid College ID or password");
        }

        User user = userOptional.get();

        /* Verify password */
        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Error: Invalid College ID or password");
        }

        /* Generate JWT and build the response map */
        String token = jwtUtil.generateToken(user.getUserId(), user.getRole().name());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("role", user.getRole().name());
        response.put("name", user.getName());

        return ResponseEntity.ok(response);
    }
}