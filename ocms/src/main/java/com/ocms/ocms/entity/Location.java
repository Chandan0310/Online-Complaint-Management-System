package com.ocms.ocms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing a university building / campus location.
 * <p>
 * Locations are referenced by complaints (where the issue was observed)
 * and by managers (who are assigned to maintain a specific building).
 * An inactive location is hidden from student-facing dropdowns but
 * retains its historical data.
 * </p>
 */
@Entity
@Table(name = "locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

    /** Auto-generated primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer locationId;

    /** Human-readable building name — must be unique. */
    @Column(nullable = false, unique = true)
    private String buildingName;

    /**
     * Whether the building is currently active.  Inactive buildings are
     * hidden from complaint submission and manager assignment dropdowns
     * but remain in the admin management table.
     */
    @Column(nullable = false)
    private boolean active = true;
}