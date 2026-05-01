package com.ocms.ocms.dto;

import lombok.Data;

@Data
public class RegisterDto {
    private String userId;
    private String name;
    private String email;
    private String phone;
    private String password;
}