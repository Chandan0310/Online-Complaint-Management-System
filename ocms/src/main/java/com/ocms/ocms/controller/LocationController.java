package com.ocms.ocms.controller;

import com.ocms.ocms.entity.Location;
import com.ocms.ocms.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for university building / location management.
 *
 * <p>Base path: {@code /api/locations}</p>
 */
@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    /**
     * Returns only <strong>active</strong> locations.  Used by student-facing
     * complaint submission and manager assignment dropdowns — inactive
     * buildings are hidden.
     *
     * @return list of active {@link Location} objects.
     */
    @GetMapping("/all")
    public ResponseEntity<List<Location>> getActiveLocations() {
        return ResponseEntity.ok(locationRepository.findByActiveTrue());
    }

    /**
     * Returns <strong>all</strong> locations (active and inactive).
     * Used exclusively by the admin ManageLocations table.
     *
     * @return list of every {@link Location} object.
     */
    @GetMapping("/all-admin")
    public ResponseEntity<List<Location>> getAllLocationsAdmin() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    /**
     * Adds a new building/location to the system.  New buildings are
     * active by default.
     * <p>
     * Rejects the request if a building with the same name already exists.
     * </p>
     *
     * @param location the location to add (expects {@code buildingName} in the JSON body).
     * @return the saved location or a {@code 400 Bad Request} on duplicate.
     */
    @PostMapping("/add")
    public ResponseEntity<?> addLocation(@RequestBody Location location) {
        if (locationRepository.findByBuildingName(location.getBuildingName()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Building already exists!");
        }

        location.setActive(true);
        Location savedLocation = locationRepository.save(location);
        return ResponseEntity.ok(savedLocation);
    }

    /**
     * Toggles a building's active/inactive status.
     * <p>
     * Active → Inactive: the building disappears from student and manager
     * dropdowns but retains all historical complaint data.<br/>
     * Inactive → Active: the building reappears in all dropdowns.
     * </p>
     *
     * @param id the location ID.
     * @return the updated location, or {@code 404 Not Found}.
     */
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleLocationStatus(@PathVariable Integer id) {
        return locationRepository.findById(id)
                .map(loc -> {
                    loc.setActive(!loc.isActive());
                    locationRepository.save(loc);
                    String status = loc.isActive() ? "activated" : "deactivated";
                    return ResponseEntity.ok("Building \"" + loc.getBuildingName() + "\" " + status + " successfully.");
                })
                .orElse(ResponseEntity.notFound().build());
    }
}