package com.ocms.ocms.entity;

/**
 * Enumeration of complaint lifecycle statuses.
 * <p>
 * Normal flow: {@code PENDING → ACCEPTED → IN_PROGRESS → RESOLVED}.<br/>
 * A complaint may also be {@code REJECTED} directly from the {@code PENDING} stage.
 * </p>
 */
public enum ComplaintStatus {
    /** Complaint has been submitted and awaits manager review. */
    PENDING,
    /** Manager has acknowledged the complaint and plans to address it. */
    ACCEPTED,
    /** Manager has declined the complaint with remarks. */
    REJECTED,
    /** Work is actively being done to resolve the issue. */
    IN_PROGRESS,
    /** The issue has been fixed and resolution proof has been uploaded. */
    RESOLVED
}