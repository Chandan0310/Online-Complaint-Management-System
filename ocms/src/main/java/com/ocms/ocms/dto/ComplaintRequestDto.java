package com.ocms.ocms.dto;

import org.springframework.web.multipart.MultipartFile;
import lombok.Data;

@Data
public class ComplaintRequestDto {
    private String title;
    private String description;
    private Integer locationId;

    // This specific data type handles the uploaded file!
    private MultipartFile image;
}