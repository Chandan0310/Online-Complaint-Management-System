package com.ocms.ocms.entity;

/**
 * Enumeration of user roles within the OCMS system.
 * <p>
 * Each role maps to a distinct set of UI views and API permissions:
 * <ul>
 *   <li>{@code STUDENT} — can submit complaints and view own complaint history.</li>
 *   <li>{@code MANAGER} — can review and resolve complaints for an assigned building.</li>
 *   <li>{@code ADMIN}   — can manage buildings, managers, and view all complaints.</li>
 * </ul>
 * </p>
 */
public enum Role {
    STUDENT,
    MANAGER,
    ADMIN
}