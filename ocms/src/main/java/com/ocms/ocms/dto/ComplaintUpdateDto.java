package com.ocms.ocms.dto;

import org.springframework.web.multipart.MultipartFile;
import lombok.Data;

/**
 * Data Transfer Object for updating an existing complaint's status.
 * <p>
 * Received as {@code multipart/form-data} by {@code ComplaintController#updateComplaintStatus}
 * because the resolution step may include an image upload as proof.
 * </p>
 */
@Data
public class ComplaintUpdateDto {

    /** Target status — one of ACCEPTED, REJECTED, IN_PROGRESS, or RESOLVED. */
    private String status;

    /** Manager's textual remarks about the complaint (required when rejecting or resolving). */
    private String remarks;

    /** Photo proof uploaded by the manager when marking a complaint as resolved. */
    private MultipartFile resolvedImage;
}