package com.investmentbanking.dealpipeline.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
    private boolean enabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    // Password is intentionally NOT included
}
