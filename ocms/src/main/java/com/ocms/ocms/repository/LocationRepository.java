package com.ocms.ocms.repository;

import com.ocms.ocms.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Integer> {
    // Custom query to find a building by its exact name
    Optional<Location> findByBuildingName(String buildingName);
}