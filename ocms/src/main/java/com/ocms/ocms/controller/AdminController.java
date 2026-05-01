package com.ocms.ocms.controller;

import com.ocms.ocms.dto.ManagerRequestDto;
import com.ocms.ocms.entity.Complaint;
import com.ocms.ocms.entity.Location;
import com.ocms.ocms.entity.Role;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.ComplaintRepository;
import com.ocms.ocms.repository.LocationRepository;
import com.ocms.ocms.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * REST controller for admin-only operations — manager CRUD and university-wide
 * complaint overview.
 *
 * <p>Base path: {@code /api/admin}</p>
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private LocationRepository locationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    /**
     * Verifies that the currently authenticated user holds the {@code ADMIN} role.
     *
     * @param principal the authenticated user identity from the JWT.
     * @return {@code true} if the user is an admin, {@code false} otherwise.
     */
    private boolean isAdmin(Principal principal) {
        User user = userRepository.findById(principal.getName()).orElse(null);
        return user != null && user.getRole() == Role.ADMIN;
    }

    // ─── Manager CRUD ──────────────────────────────────────────────────

    /**
     * Returns a list of all users with the {@code MANAGER} role.
     *
     * @param principal the authenticated user identity.
     * @return list of managers or {@code 403 Forbidden} if not admin.
     */
    @GetMapping("/managers")
    public ResponseEntity<?> getAllManagers(Principal principal) {
        if (!isAdmin(principal)) return ResponseEntity.status(403).body("Access Denied.");

        List<User> managers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.MANAGER)
                .toList();
        return ResponseEntity.ok(managers);
    }

    /**
     * Creates a new complaint manager account and assigns them to a building.
     * <p>
     * The manager ID is deterministic: {@code MGR-<locationId>}.
     * Only one manager may be assigned per building — duplicate assignments
     * are rejected.
     * </p>
     *
     * @param dto       validated manager creation payload.
     * @param principal the authenticated user identity.
     * @return success message with the generated ID, or an error response.
     */
    @PostMapping("/managers/add")
    public ResponseEntity<?> createManager(@Valid @RequestBody ManagerRequestDto dto, Principal principal) {
        if (!isAdmin(principal)) return ResponseEntity.status(403).body("Access Denied.");

        try {
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));

            /* Enforce one-manager-per-building rule */
            boolean alreadyAssigned = userRepository.findAll().stream()
                    .anyMatch(u -> u.getRole() == Role.MANAGER
                            && u.getAssignedLocation() != null
                            && u.getAssignedLocation().getLocationId().equals(location.getLocationId()));

            if (alreadyAssigned) {
                return ResponseEntity.badRequest()
                        .body("Error: A manager is already assigned to \"" + location.getBuildingName() + "\". Each building can have only one manager.");
            }

            /* Check for duplicate email */
            if (userRepository.findByEmail(dto.getEmail()).isPresent()) {
                return ResponseEntity.badRequest().body("Error: Email already in use!");
            }

            /* Manager ID = MGR-<locationId> */
            String managerId = "MGR-" + location.getLocationId();

            /* Ensure no ID collision (shouldn't happen with one-per-building rule, but safety-first) */
            if (userRepository.existsById(managerId)) {
                return ResponseEntity.badRequest().body("Error: Manager ID " + managerId + " already exists.");
            }

            User manager = new User();
            manager.setUserId(managerId);
            manager.setName(dto.getName());
            manager.setPhone(dto.getPhone());
            manager.setEmail(dto.getEmail());
            manager.setRole(Role.MANAGER);
            manager.setAssignedLocation(location);
            manager.setPasswordHash(passwordEncoder.encode(dto.getPassword()));

            userRepository.save(manager);
            return ResponseEntity.ok("Manager " + manager.getName() + " created successfully with ID: " + managerId);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error creating manager: " + e.getMessage());
        }
    }

    /**
     * Updates an existing manager's name, email, and phone number.
     * <p>
     * Password and building assignment are not modifiable through this endpoint.
     * If the new email is already taken by another user, the request is rejected.
     * </p>
     *
     * @param id        the manager's user ID (e.g. "MGR-3").
     * @param updates   a map containing {@code name}, {@code email}, and/or {@code phone}.
     * @param principal the authenticated user identity.
     * @return success message or an error response.
     */
    @PutMapping("/managers/{id}/update")
    public ResponseEntity<?> updateManager(
            @PathVariable String id,
            @RequestBody Map<String, String> updates,
            Principal principal) {

        if (!isAdmin(principal)) return ResponseEntity.status(403).body("Access Denied.");

        try {
            User manager = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            if (manager.getRole() != Role.MANAGER) {
                return ResponseEntity.badRequest().body("Error: User is not a manager.");
            }

            /* Update name if provided */
            if (updates.containsKey("name") && !updates.get("name").isBlank()) {
                manager.setName(updates.get("name"));
            }

            /* Update email if provided — check for duplicates */
            if (updates.containsKey("email") && !updates.get("email").isBlank()) {
                String newEmail = updates.get("email");
                Optional<User> existing = userRepository.findByEmail(newEmail);
                if (existing.isPresent() && !existing.get().getUserId().equals(id)) {
                    return ResponseEntity.badRequest().body("Error: Email already in use by another user.");
                }
                manager.setEmail(newEmail);
            }

            /* Update phone if provided */
            if (updates.containsKey("phone") && !updates.get("phone").isBlank()) {
                manager.setPhone(updates.get("phone"));
            }

            userRepository.save(manager);
            return ResponseEntity.ok("Manager " + manager.getName() + " updated successfully.");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating manager: " + e.getMessage());
        }
    }

    // ─── Complaints Overview ────────────────────────────────────────────

    /**
     * Returns all complaints across the entire university, sorted newest-first.
     *
     * @param principal the authenticated user identity.
     * @return sorted list of all complaints, or {@code 403 Forbidden} if not admin.
     */
    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints(Principal principal) {
        if (!isAdmin(principal)) return ResponseEntity.status(403).body("Access Denied.");

        List<Complaint> allComplaints = complaintRepository.findAll().stream()
                .sorted(Comparator.comparing(Complaint::getCreatedAt).reversed())
                .toList();

        return ResponseEntity.ok(allComplaints);
    }
}