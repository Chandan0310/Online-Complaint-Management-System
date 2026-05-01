package com.ocms.ocms.controller;

import com.ocms.ocms.dto.ComplaintRequestDto;
import com.ocms.ocms.entity.Complaint;
import com.ocms.ocms.entity.ComplaintStatus;
import com.ocms.ocms.entity.Location;
import com.ocms.ocms.entity.Role;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.ComplaintRepository;
import com.ocms.ocms.repository.LocationRepository;
import com.ocms.ocms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    // This is the folder on your computer where images will be saved
    private final String UPLOAD_DIR = "uploads/";

    // We use @ModelAttribute instead of @RequestBody so it can accept files!
    @PostMapping("/submit")
    public ResponseEntity<?> submitComplaint(
            @ModelAttribute ComplaintRequestDto dto,
            Principal principal) { // Principal holds the identity of the logged-in user from the JWT!

        try {
            // 1. Identify the Student
            // principal.getName() extracts the userId (e.g., "23mcce11") straight from the validated token
            User student = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // ADD THIS STRICT ROLE CHECK:
            if (student.getRole() != com.ocms.ocms.entity.Role.STUDENT) {
                return ResponseEntity.status(403).body("Access Denied: Only Students can submit complaints.");
            }

            // 2. Identify the Location
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));

            // 3. Find the Manager assigned to this location (if one exists)
            User assignedManager = null;
            Optional<User> managerOpt = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.MANAGER &&
                            u.getAssignedLocation() != null &&
                            u.getAssignedLocation().getLocationId().equals(location.getLocationId()))
                    .findFirst();

            if (managerOpt.isPresent()) {
                assignedManager = managerOpt.get();
            }

            // 4. Handle the Image Upload
            String imageFileName = null;
            if (dto.getImage() != null && !dto.getImage().isEmpty()) {

                // Create the "uploads" folder if it doesn't exist yet
                File directory = new File(UPLOAD_DIR);
                if (!directory.exists()) {
                    directory.mkdirs();
                }

                // Generate a random, unique file name so images don't overwrite each other
                imageFileName = UUID.randomUUID().toString() + "_" + dto.getImage().getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + imageFileName);

                // Save the file to your hard drive
                Files.copy(dto.getImage().getInputStream(), filePath);
            }

            // 5. Build and Save the Complaint
            Complaint complaint = new Complaint();

            // Generate a unique complaint ID like CMP-1704293847
            complaint.setComplaintId("CMP-" + System.currentTimeMillis());
            complaint.setTitle(dto.getTitle());
            complaint.setDescription(dto.getDescription());
            complaint.setLocation(location);
            complaint.setStudent(student);
            complaint.setManager(assignedManager); // Routes to the specific manager!
            complaint.setSubmittedImagePath(imageFileName); // Saves the file path string
            complaint.setStatus(ComplaintStatus.PENDING);

            complaintRepository.save(complaint);

            return ResponseEntity.ok("Complaint successfully registered! ID: " + complaint.getComplaintId());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error submitting complaint: " + e.getMessage());
        }
    }

    // Fetch all complaints for the currently logged-in student
    @GetMapping("/my-complaints")
    public ResponseEntity<?> getMyComplaints(Principal principal) {
        try {
            // principal.getName() safely gets the "23mcce11" ID from the JWT
            String studentId = principal.getName();

            // Use the repository method we wrote back in Sprint 2!
            java.util.List<Complaint> myComplaints = complaintRepository.findByStudent_UserId(studentId);

            return ResponseEntity.ok(myComplaints);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching complaint history");
        }
    }

    // Fetch a single complaint by its ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintDetails(@PathVariable String id, Principal principal) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            User currentUser = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // SECURITY: If student, check ownership. If manager, check location assignment.
            if (currentUser.getRole() == Role.STUDENT && !complaint.getStudent().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(403).body("Error: You do not have permission to view this.");
            } else if (currentUser.getRole() == Role.MANAGER &&
                    (currentUser.getAssignedLocation() == null || !complaint.getLocation().getLocationId().equals(currentUser.getAssignedLocation().getLocationId()))) {
                return ResponseEntity.status(403).body("Error: This complaint is outside your jurisdiction.");
            }

            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }
    // Fetch all complaints for a Manager based on their assigned building
    @GetMapping("/manager-complaints")
    public ResponseEntity<?> getManagerComplaints(Principal principal) {
        try {
            // 1. Get the Manager's details using the ID from the JWT
            User manager = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            // SECURITY CHECK: Ensure they are actually a manager!
            if (manager.getRole() != Role.MANAGER) {
                return ResponseEntity.status(403).body("Access Denied: Only managers can view this.");
            }

            // 2. Get the Location ID they are assigned to
            if (manager.getAssignedLocation() == null) {
                return ResponseEntity.badRequest().body("Manager is not assigned to any building.");
            }
            Integer locationId = manager.getAssignedLocation().getLocationId();

            // 3. Fetch complaints for that specific building
            java.util.List<Complaint> buildingComplaints = complaintRepository.findAll().stream()
                    .filter(c -> c.getLocation().getLocationId().equals(locationId))
                    // Sort so newest complaints are at the top
                    .sorted((c1, c2) -> c2.getCreatedAt().compareTo(c1.getCreatedAt()))
                    .toList();

            return ResponseEntity.ok(buildingComplaints);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching manager complaints: " + e.getMessage());
        }
    }

    // Manager updates complaint status
    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable String id,
            @ModelAttribute com.ocms.ocms.dto.ComplaintUpdateDto dto,
            Principal principal) {

        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            // Update status
            if (dto.getStatus() != null) {
                complaint.setStatus(com.ocms.ocms.entity.ComplaintStatus.valueOf(dto.getStatus()));
            }

            // Update remarks
            if (dto.getRemarks() != null) {
                complaint.setRemarks(dto.getRemarks());
            }

            // Handle Resolved Image Upload
            if (dto.getResolvedImage() != null && !dto.getResolvedImage().isEmpty()) {
                String fileName = java.util.UUID.randomUUID().toString() + "_" + dto.getResolvedImage().getOriginalFilename();
                java.nio.file.Path filePath = java.nio.file.Paths.get("uploads/" + fileName);
                java.nio.file.Files.copy(dto.getResolvedImage().getInputStream(), filePath);
                complaint.setResolvedImagePath(fileName);
            }

            complaintRepository.save(complaint);
            return ResponseEntity.ok("Complaint updated successfully!");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating complaint: " + e.getMessage());
        }
    }
}