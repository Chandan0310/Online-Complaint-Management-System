package com.ocms.ocms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * JPA entity representing a user in the OCMS system.
 * <p>
 * Users are identified by their {@code userId} which corresponds to the
 * university College ID for students (e.g. "23mcce11") or a generated ID
 * for managers (e.g. "MGR-123456").  The {@link #role} field determines
 * the user's access level.
 * </p>
 */
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    /** Primary key — College ID for students, generated ID for managers/admin. */
    @Id
    private String userId;

    /** Full name of the user. */
    @Column(nullable = false)
    private String name;

    /** Email address — must be unique across the system. */
    @Column(nullable = false, unique = true)
    private String email;

    /** 10-digit mobile phone number. */
    @Column(nullable = false)
    private String phone;

    /** BCrypt-hashed password. Never stored or transmitted in plain text. */
    @Column(nullable = false)
    private String passwordHash;

    /** Role that determines access permissions (STUDENT, MANAGER, or ADMIN). */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /**
     * Building assignment — only applicable for users with the {@code MANAGER}
     * role.  {@code null} for students and admins.
     */
    @ManyToOne
    @JoinColumn(name = "assigned_location_id")
    private Location assignedLocation;
}