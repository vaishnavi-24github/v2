package com.investmentbanking.dealpipeline.controller;

import com.investmentbanking.dealpipeline.dto.ApiResponse;
import com.investmentbanking.dealpipeline.dto.CreateUserRequest;
import com.investmentbanking.dealpipeline.dto.UpdateUserStatusRequest;
import com.investmentbanking.dealpipeline.dto.UserProfileResponse;
import java.util.List;
import com.investmentbanking.dealpipeline.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final UserService userService;
    
    /**
     * POST /api/admin/users - ADMIN only
     * Create new user
     * Fields: username, email, password, role
     * Password must be BCrypt-hashed
     * Default active = true
     * Validates duplicate username/email
     */
    @PostMapping
    public ResponseEntity<ApiResponse<UserProfileResponse>> createUser(@Valid @RequestBody CreateUserRequest request) {
        UserProfileResponse userProfile = userService.createUser(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", userProfile));
    }
    
    /**
     * GET /api/admin/users - ADMIN only
     * List all users
     * Returns all users without passwords
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        List<UserProfileResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success(users));
    }
    
    /**
     * GET /api/admin/users/{id} - ADMIN only
     * Get user by ID
     * Returns user profile without password
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable String id) {
        UserProfileResponse userProfile = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(userProfile));
    }
    
    /**
     * PUT /api/admin/users/{id}/status - ADMIN only
     * Activate or deactivate user
     * Body: { "active": true/false }
     * Deactivated users must not be able to login
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        UserProfileResponse userProfile = userService.updateUserStatus(id, request);
        String message = request.getActive() ? "User activated successfully" : "User deactivated successfully";
        return ResponseEntity.ok(ApiResponse.success(message, userProfile));
    }
}
