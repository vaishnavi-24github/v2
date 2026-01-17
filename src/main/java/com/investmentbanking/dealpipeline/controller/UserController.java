package com.investmentbanking.dealpipeline.controller;

import com.investmentbanking.dealpipeline.dto.ApiResponse;
import com.investmentbanking.dealpipeline.dto.UserProfileResponse;
import com.investmentbanking.dealpipeline.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    
    /**
     * GET /api/users/me - Protected endpoint
     * USER and ADMIN can access
     * Returns logged-in user profile from SecurityContext
     * Does NOT return password
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser() {
        UserProfileResponse userProfile = userService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(userProfile));
    }
}
