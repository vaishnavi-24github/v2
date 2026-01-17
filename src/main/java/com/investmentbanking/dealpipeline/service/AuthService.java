package com.investmentbanking.dealpipeline.service;

import com.investmentbanking.dealpipeline.dto.AuthResponse;
import com.investmentbanking.dealpipeline.dto.LoginRequest;
import com.investmentbanking.dealpipeline.dto.RegisterRequest;
import com.investmentbanking.dealpipeline.exception.BadRequestException;
import com.investmentbanking.dealpipeline.model.Role;
import com.investmentbanking.dealpipeline.model.User;
import com.investmentbanking.dealpipeline.repository.UserRepository;
import com.investmentbanking.dealpipeline.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuthenticationManager authenticationManager;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already in use");
        }
        
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .roles(new HashSet<>(Set.of(Role.USER)))
                .enabled(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        user = userRepository.save(user);
        
        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
                .username(user.getUsername())
                .password(user.getPassword())
                .authorities(user.getRoles().stream()
                        .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()))
                        .collect(Collectors.toList()))
                .build();
        
        String token = jwtTokenProvider.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(user.getRoles().stream().map(Role::name).collect(Collectors.toSet()))
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        // Check if user exists and is enabled before authentication
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));
        
        // Prevent login if user is disabled
        if (!user.isEnabled()) {
            throw new BadRequestException("User account is disabled. Please contact administrator.");
        }
        
        // Authenticate user credentials
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String token = jwtTokenProvider.generateToken(userDetails);
            
            return AuthResponse.builder()
                    .token(token)
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .roles(user.getRoles().stream().map(Role::name).collect(Collectors.toSet()))
                    .build();
        } catch (org.springframework.security.authentication.BadCredentialsException ex) {
            throw new BadRequestException("Invalid username or password");
        }
    }
}
