package com.ocms.ocms.dto;

import lombok.Data;

@Data
public class ManagerRequestDto {
    private String name;
    private String phone;
    private String email;
    private String password;
    private Integer locationId; // The building they are assigned to
}