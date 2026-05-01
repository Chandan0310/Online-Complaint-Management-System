package com.ocms.ocms.dto;

import org.springframework.web.multipart.MultipartFile;
import lombok.Data;

@Data
public class ComplaintUpdateDto {
    private String status; // ACCEPTED, REJECTED, IN_PROGRESS, RESOLVED
    private String remarks;
    private MultipartFile resolvedImage; // For proof of completion
}