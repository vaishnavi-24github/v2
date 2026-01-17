package com.investmentbanking.dealpipeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
}
