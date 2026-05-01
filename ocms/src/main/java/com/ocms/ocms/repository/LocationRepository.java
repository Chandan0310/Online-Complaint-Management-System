package com.ocms.ocms.repository;

import com.ocms.ocms.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA repository for {@link Location} entities.
 * <p>
 * Provides derived query methods for duplicate-name detection and
 * filtering by active status.
 * </p>
 */
public interface LocationRepository extends JpaRepository<Location, Integer> {

    /**
     * Finds a location by its exact building name.
     * Used by {@code LocationController#addLocation} to prevent duplicates.
     *
     * @param buildingName the building name to search for.
     * @return an {@link Optional} containing the matching location, or empty.
     */
    Optional<Location> findByBuildingName(String buildingName);

    /**
     * Returns only active locations.  Used to populate the building dropdown
     * in student complaint submission and manager assignment forms.
     *
     * @return list of active locations.
     */
    List<Location> findByActiveTrue();
}