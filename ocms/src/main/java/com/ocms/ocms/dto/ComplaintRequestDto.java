package com.ocms.ocms.dto;

import org.springframework.web.multipart.MultipartFile;
import lombok.Data;

/**
 * Data Transfer Object for new complaint submissions.
 * <p>
 * Received as {@code multipart/form-data} by {@code ComplaintController#submitComplaint}
 * because it may include an image upload.  Spring's {@code @ModelAttribute}
 * binding is used instead of {@code @RequestBody}.
 * </p>
 */
@Data
public class ComplaintRequestDto {

    /** Short summary of the complaint (5–100 characters). */
    private String title;

    /** Detailed description of the issue (minimum 20 characters). */
    private String description;

    /** ID of the building/location where the issue was observed. */
    private Integer locationId;

    /** Optional photo evidence attached by the student. */
    private MultipartFile image;
}