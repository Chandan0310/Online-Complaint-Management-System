package com.ocms.ocms.controller;

import com.ocms.ocms.dto.ManagerRequestDto;
import com.ocms.ocms.entity.Location;
import com.ocms.ocms.entity.Role;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.LocationRepository;
import com.ocms.ocms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.ocms.ocms.repository.ComplaintRepository complaintRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Helper method to verify the user is actually an Admin
    private boolean isAdmin(Principal principal) {
        User user = userRepository.findById(principal.getName()).orElse(null);
        return user != null && user.getRole() == Role.ADMIN;
    }

    // 1. Fetch all managers
    @GetMapping("/managers")
    public ResponseEntity<?> getAllManagers(Principal principal) {
        if (!isAdmin(principal)) return ResponseEntity.status(403).body("Access Denied.");

        List<User> managers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.MANAGER)
                .toList();
        return ResponseEntity.ok(managers);
    }

    // 2. Create a new manager
    @PostMapping("/managers/add")
    public ResponseEntity<?> createManager(@RequestBody ManagerRequestDto dto, Principal principal) {
        if (!isAdmin(principal)) return ResponseEntity.status(403).body("Access Denied.");

        try {
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));

            User manager = new User();
            // Generate a unique ID like MGR-1704293847
            manager.setUserId("MGR-" + System.currentTimeMillis() % 1000000);
            manager.setName(dto.getName());
            manager.setPhone(dto.getPhone());
            manager.setEmail(dto.getEmail());
            manager.setRole(Role.MANAGER);
            manager.setAssignedLocation(location);

            // SECURITY: Hash the password before saving!
            manager.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

            userRepository.save(manager);
            return ResponseEntity.ok("Manager " + manager.getName() + " created successfully with ID: " + manager.getUserId());

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating manager: " + e.getMessage());
        }
    }

    // 3. Fetch ALL complaints across the entire university
    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints(Principal principal) {
        if (!isAdmin(principal)) return ResponseEntity.status(403).body("Access Denied.");

        // Fetch all and sort by newest first
        java.util.List<com.ocms.ocms.entity.Complaint> allComplaints = complaintRepository.findAll().stream()
                .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                .toList();

        return ResponseEntity.ok(allComplaints);
    }
}