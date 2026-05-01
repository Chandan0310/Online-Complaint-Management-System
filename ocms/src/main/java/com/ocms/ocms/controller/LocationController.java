package com.ocms.ocms.controller;

import com.ocms.ocms.entity.Location;
import com.ocms.ocms.repository.LocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@CrossOrigin(origins = "http://localhost:5173")
public class LocationController {

    @Autowired
    private LocationRepository locationRepository;

    // 1. Fetch all locations (For the Student's dynamic dropdown menu)
    @GetMapping("/all")
    public ResponseEntity<List<Location>> getAllLocations() {
        return ResponseEntity.ok(locationRepository.findAll());
    }

    // 2. Add a new location (For the Admin Dashboard)
    @PostMapping("/add")
    public ResponseEntity<?> addLocation(@RequestBody Location location) {
        // Check if building already exists
        if (locationRepository.findByBuildingName(location.getBuildingName()).isPresent()) {
            return ResponseEntity.badRequest().body("Error: Building already exists!");
        }

        Location savedLocation = locationRepository.save(location);
        return ResponseEntity.ok(savedLocation);
    }
}