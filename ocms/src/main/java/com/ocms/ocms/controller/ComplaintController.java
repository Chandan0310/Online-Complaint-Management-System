package com.ocms.ocms.controller;

import com.ocms.ocms.dto.ComplaintRequestDto;
import com.ocms.ocms.dto.ComplaintUpdateDto;
import com.ocms.ocms.entity.Complaint;
import com.ocms.ocms.entity.ComplaintStatus;
import com.ocms.ocms.entity.Location;
import com.ocms.ocms.entity.Role;
import com.ocms.ocms.entity.User;
import com.ocms.ocms.repository.ComplaintRepository;
import com.ocms.ocms.repository.LocationRepository;
import com.ocms.ocms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * REST controller for complaint lifecycle operations — submission, retrieval,
 * and status updates.
 *
 * <p>Base path: {@code /api/complaints}</p>
 */
@RestController
@RequestMapping("/api/complaints")
@CrossOrigin(origins = "http://localhost:5173")
public class ComplaintController {

    private static final Logger log = LoggerFactory.getLogger(ComplaintController.class);

    @Autowired
    private ComplaintRepository complaintRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LocationRepository locationRepository;

    /** Directory on the server where uploaded images are stored. */
    private final String UPLOAD_DIR = "uploads/";

    /**
     * Submits a new complaint on behalf of the authenticated student.
     * <p>
     * Accepts {@code multipart/form-data} so that an optional image can be
     * included.  The complaint is automatically routed to the manager
     * assigned to the selected building (if one exists).
     * </p>
     *
     * @param dto       complaint payload (title, description, locationId, optional image).
     * @param principal the authenticated user identity from the JWT.
     * @return success message with the generated tracking ID, or an error response.
     */
    @PostMapping("/submit")
    public ResponseEntity<?> submitComplaint(
            @ModelAttribute ComplaintRequestDto dto,
            Principal principal) {

        try {
            /* Identify the student from the JWT */
            User student = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            /* Only students may submit complaints */
            if (student.getRole() != Role.STUDENT) {
                return ResponseEntity.status(403).body("Access Denied: Only Students can submit complaints.");
            }

            /* Resolve the building */
            Location location = locationRepository.findById(dto.getLocationId())
                    .orElseThrow(() -> new RuntimeException("Location not found"));

            /* Find the manager assigned to this building (if any) */
            Optional<User> managerOpt = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.MANAGER
                            && u.getAssignedLocation() != null
                            && u.getAssignedLocation().getLocationId().equals(location.getLocationId()))
                    .findFirst();

            User assignedManager = managerOpt.orElse(null);

            /* Handle the optional image upload */
            String imageFileName = null;
            if (dto.getImage() != null && !dto.getImage().isEmpty()) {
                File directory = new File(UPLOAD_DIR);
                if (!directory.exists()) {
                    directory.mkdirs();
                }
                imageFileName = UUID.randomUUID() + "_" + dto.getImage().getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + imageFileName);
                Files.copy(dto.getImage().getInputStream(), filePath);
            }

            /* Build and persist the complaint */
            Complaint complaint = new Complaint();
            complaint.setComplaintId("CMP-" + System.currentTimeMillis());
            complaint.setTitle(dto.getTitle());
            complaint.setDescription(dto.getDescription());
            complaint.setLocation(location);
            complaint.setStudent(student);
            complaint.setManager(assignedManager);
            complaint.setSubmittedImagePath(imageFileName);
            complaint.setStatus(ComplaintStatus.PENDING);

            complaintRepository.save(complaint);

            return ResponseEntity.ok("Complaint successfully registered! ID: " + complaint.getComplaintId());

        } catch (Exception e) {
            log.error("Error submitting complaint", e);
            return ResponseEntity.status(500).body("Error submitting complaint: " + e.getMessage());
        }
    }

    /**
     * Returns all complaints submitted by the currently authenticated student,
     * identified via the JWT.
     *
     * @param principal the authenticated user identity.
     * @return list of the student's complaints.
     */
    @GetMapping("/my-complaints")
    public ResponseEntity<?> getMyComplaints(Principal principal) {
        try {
            String studentId = principal.getName();
            List<Complaint> myComplaints = complaintRepository.findByStudent_UserId(studentId);
            return ResponseEntity.ok(myComplaints);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching complaint history");
        }
    }

    /**
     * Returns the full details of a single complaint.
     * <p>
     * Access control: students may only view their own complaints; managers
     * may only view complaints in their assigned building; admins may view any.
     * </p>
     *
     * @param id        the complaint tracking ID.
     * @param principal the authenticated user identity.
     * @return the complaint object, or {@code 403}/{@code 500} on error.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getComplaintDetails(@PathVariable String id, Principal principal) {
        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            User currentUser = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));

            /* Students can only view their own complaints */
            if (currentUser.getRole() == Role.STUDENT
                    && !complaint.getStudent().getUserId().equals(currentUser.getUserId())) {
                return ResponseEntity.status(403).body("Error: You do not have permission to view this.");
            }

            /* Managers can only view complaints within their assigned building */
            if (currentUser.getRole() == Role.MANAGER
                    && (currentUser.getAssignedLocation() == null
                    || !complaint.getLocation().getLocationId().equals(currentUser.getAssignedLocation().getLocationId()))) {
                return ResponseEntity.status(403).body("Error: This complaint is outside your jurisdiction.");
            }

            return ResponseEntity.ok(complaint);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(e.getMessage());
        }
    }

    /**
     * Returns all complaints for the building assigned to the authenticated manager,
     * sorted newest-first.
     *
     * @param principal the authenticated user identity.
     * @return list of building complaints, or an error response.
     */
    @GetMapping("/manager-complaints")
    public ResponseEntity<?> getManagerComplaints(Principal principal) {
        try {
            User manager = userRepository.findById(principal.getName())
                    .orElseThrow(() -> new RuntimeException("Manager not found"));

            if (manager.getRole() != Role.MANAGER) {
                return ResponseEntity.status(403).body("Access Denied: Only managers can view this.");
            }

            if (manager.getAssignedLocation() == null) {
                return ResponseEntity.badRequest().body("Manager is not assigned to any building.");
            }

            Integer locationId = manager.getAssignedLocation().getLocationId();

            List<Complaint> buildingComplaints = complaintRepository.findAll().stream()
                    .filter(c -> c.getLocation().getLocationId().equals(locationId))
                    .sorted(Comparator.comparing(Complaint::getCreatedAt).reversed())
                    .toList();

            return ResponseEntity.ok(buildingComplaints);

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error fetching manager complaints: " + e.getMessage());
        }
    }

    /**
     * Updates the status, remarks, and/or resolution image of an existing complaint.
     * <p>
     * Intended for managers to progress a complaint through its lifecycle:
     * PENDING → ACCEPTED/REJECTED, ACCEPTED → IN_PROGRESS, IN_PROGRESS → RESOLVED.
     * </p>
     *
     * @param id        the complaint tracking ID.
     * @param dto       update payload (status, optional remarks, optional resolvedImage).
     * @param principal the authenticated user identity.
     * @return success message or an error response.
     */
    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateComplaintStatus(
            @PathVariable String id,
            @ModelAttribute ComplaintUpdateDto dto,
            Principal principal) {

        try {
            Complaint complaint = complaintRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Complaint not found"));

            /* Update status */
            if (dto.getStatus() != null) {
                complaint.setStatus(ComplaintStatus.valueOf(dto.getStatus()));
            }

            /* Update remarks */
            if (dto.getRemarks() != null) {
                complaint.setRemarks(dto.getRemarks());
            }

            /* Handle resolution proof image */
            if (dto.getResolvedImage() != null && !dto.getResolvedImage().isEmpty()) {
                String fileName = UUID.randomUUID() + "_" + dto.getResolvedImage().getOriginalFilename();
                Path filePath = Paths.get(UPLOAD_DIR + fileName);
                Files.copy(dto.getResolvedImage().getInputStream(), filePath);
                complaint.setResolvedImagePath(fileName);
            }

            complaintRepository.save(complaint);
            return ResponseEntity.ok("Complaint updated successfully!");

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error updating complaint: " + e.getMessage());
        }
    }
}