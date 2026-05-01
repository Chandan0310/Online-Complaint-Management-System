package com.ocms.ocms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

/**
 * JPA entity representing a complaint submitted by a student.
 * <p>
 * A complaint progresses through the lifecycle defined by {@link ComplaintStatus}:
 * {@code PENDING → ACCEPTED → IN_PROGRESS → RESOLVED}, or it may be
 * {@code REJECTED} at the {@code PENDING} stage.
 * </p>
 */
@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Complaint {

    /** Unique tracking ID generated at submission time (format: CMP-<timestamp>). */
    @Id
    private String complaintId;

    /** The student who submitted this complaint. */
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    /** The building/location where the issue was reported. */
    @ManyToOne
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    /** The manager responsible for this complaint's building (may be {@code null}). */
    @ManyToOne
    @JoinColumn(name = "manager_id")
    private User manager;

    /** Short summary of the complaint (5–100 characters). */
    @Column(nullable = false)
    private String title;

    /** Detailed description of the issue. */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    /** Current lifecycle status of the complaint. Defaults to {@code PENDING}. */
    @Enumerated(EnumType.STRING)
    private ComplaintStatus status = ComplaintStatus.PENDING;

    /** Manager's textual remarks (populated when accepting, rejecting, or resolving). */
    @Column(columnDefinition = "TEXT")
    private String remarks;

    /** Filename of the photo evidence uploaded by the student (may be {@code null}). */
    private String submittedImagePath;

    /** Filename of the resolution proof uploaded by the manager (may be {@code null}). */
    private String resolvedImagePath;

    /** Timestamp when the complaint was created (set automatically by Hibernate). */
    @CreationTimestamp
    @Column(updatable = false)
    private Timestamp createdAt;

    /** Timestamp of the last update (set automatically by Hibernate). */
    @UpdateTimestamp
    private Timestamp updatedAt;
}