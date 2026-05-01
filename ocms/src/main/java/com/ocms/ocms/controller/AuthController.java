package com.ocms.ocms.controller;

import com.ocms.ocms.dto.RegisterDto;
import com.ocms.ocms.entity.Role;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private com.ocms.ocms.config.JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerStudent(@RequestBody RegisterDto dto) {
        // 1. Check if the UoH Roll Number already exists
        if(userRepository.existsById(dto.getUserId().toLowerCase())) {
            return ResponseEntity.badRequest().body("Error: College ID already exists!");
        }

        // 2. Check if email exists
        if(userRepository.findByEmail(dto.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Email already in use!");
        }

        // 3. Create the new User
        User user = new User();
        user.setUserId(dto.getUserId().toLowerCase()); // We save it as lowercase (e.g., "23mcce11")
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhone(dto.getPhone());

        // Hash the password before saving!
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

        // Force the role to be STUDENT (only admins can make managers)
        user.setRole(Role.STUDENT);

        // 4. Save to Database
        userRepository.save(user);

        return ResponseEntity.ok("Student registered successfully!");
    }
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody com.ocms.ocms.dto.LoginDto dto) {

        // 1. Find the user by their College ID (Convert to lowercase just in case they typed '23MCCE11')
        java.util.Optional<User> userOptional = userRepository.findById(dto.getUserId().toLowerCase());

        if(userOptional.isEmpty()) {
            return ResponseEntity.status(401).body("Error: Invalid College ID or password");
        }

        User user = userOptional.get();

        // 2. Check if the password matches
        if(!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            return ResponseEntity.status(401).body("Error: Invalid College ID or password");
        }

        // 3. Passwords match! Generate the JWT Token using their College ID
        String token = jwtUtil.generateToken(user.getUserId(), user.getRole().name());

        // 4. Return the token and user details to React
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("role", user.getRole().name());
        response.put("name", user.getName());

        return ResponseEntity.ok(response);
    }
}