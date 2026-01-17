package com.investmentbanking.dealpipeline.service;

import com.investmentbanking.dealpipeline.dto.CreateUserRequest;
import com.investmentbanking.dealpipeline.dto.UpdateUserStatusRequest;
import com.investmentbanking.dealpipeline.dto.UserProfileResponse;
import com.investmentbanking.dealpipeline.exception.BadRequestException;
import com.investmentbanking.dealpipeline.exception.ResourceNotFoundException;
import com.investmentbanking.dealpipeline.model.Role;
import com.investmentbanking.dealpipeline.model.User;
import com.investmentbanking.dealpipeline.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    
    /**
     * Get current logged-in user profile from SecurityContext
     * Does NOT return password
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("User not authenticated");
        }
        
        String username = authentication.getName();
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));
        
        return mapToUserProfileResponse(user);
    }
    
    /**
     * Create a new user (ADMIN only)
     * Password is BCrypt-hashed
     * Default active = true
     */
    @Transactional
    public UserProfileResponse createUser(CreateUserRequest request) {
        // Validate duplicate username
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        
        // Validate duplicate email
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }
        
        // Create user with BCrypt-hashed password
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword())) // BCrypt hash
                .firstName("") // Optional fields, can be added later
                .lastName("")
                .roles(new HashSet<>(Set.of(request.getRole())))
                .enabled(true) // Default active = true
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        user = userRepository.save(user);
        
        return mapToUserProfileResponse(user);
    }
    
    /**
     * Get all users (ADMIN only)
     * Returns list of all users without passwords
     */
    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::mapToUserProfileResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get user by ID (ADMIN only)
     * Returns user profile without password
     */
    @Transactional(readOnly = true)
    public UserProfileResponse getUserById(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        return mapToUserProfileResponse(user);
    }
    
    /**
     * Update user status (activate/deactivate) - ADMIN only
     * Deactivated users cannot login
     */
    @Transactional
    public UserProfileResponse updateUserStatus(String userId, UpdateUserStatusRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        user.setEnabled(request.getActive());
        user.setUpdatedAt(LocalDateTime.now());
        
        user = userRepository.save(user);
        
        return mapToUserProfileResponse(user);
    }
    
    /**
     * Map User entity to UserProfileResponse (excludes password)
     */
    private UserProfileResponse mapToUserProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream().map(Role::name).collect(Collectors.toSet()))
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
