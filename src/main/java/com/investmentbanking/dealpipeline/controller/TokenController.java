package com.investmentbanking.dealpipeline.controller;

import com.investmentbanking.dealpipeline.dto.ApiResponse;
import com.investmentbanking.dealpipeline.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/token")
@RequiredArgsConstructor
public class TokenController {
    
    private final JwtTokenProvider jwtTokenProvider;
    
    /**
     * Verify and decode JWT token
     * Returns token information including username, roles, expiration, etc.
     */
    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyToken(
            @RequestHeader(value = "Authorization", required = false) String authHeader) {
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Missing or invalid Authorization header. Use: Authorization: Bearer <token>"));
        }
        
        String token = authHeader.substring(7);
        
        try {
            Map<String, Object> tokenInfo = new HashMap<>();
            
            // Extract token information
            String username = jwtTokenProvider.extractUsername(token);
            List<String> roles = jwtTokenProvider.extractRoles(token);
            java.util.Date expiration = jwtTokenProvider.extractExpiration(token);
            
            tokenInfo.put("valid", true);
            tokenInfo.put("username", username);
            tokenInfo.put("roles", roles);
            tokenInfo.put("expiresAt", expiration);
            tokenInfo.put("expiresIn", (expiration.getTime() - System.currentTimeMillis()) / 1000 + " seconds");
            tokenInfo.put("isExpired", expiration.before(new java.util.Date()));
            
            return ResponseEntity.ok(ApiResponse.success("Token is valid", tokenInfo));
            
        } catch (Exception e) {
            Map<String, Object> errorInfo = new HashMap<>();
            errorInfo.put("valid", false);
            errorInfo.put("error", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid token: " + e.getMessage()));
        }
    }
    
    /**
     * Get current authenticated user information from SecurityContext
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Not authenticated"));
        }
        
        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("username", authentication.getName());
        userInfo.put("authorities", authentication.getAuthorities().stream()
                .map(auth -> auth.getAuthority())
                .toList());
        userInfo.put("authenticated", authentication.isAuthenticated());
        userInfo.put("principal", authentication.getPrincipal().getClass().getSimpleName());
        
        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }
    
    /**
     * Decode token without validation (for testing purposes)
     * WARNING: This doesn't validate the token signature
     */
    @PostMapping("/decode")
    public ResponseEntity<ApiResponse<Map<String, Object>>> decodeToken(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        
        if (token == null || token.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Token is required in request body: {\"token\": \"your_token_here\"}"));
        }
        
        try {
            Map<String, Object> tokenInfo = new HashMap<>();
            
            // Extract without full validation (just parsing)
            String username = jwtTokenProvider.extractUsername(token);
            List<String> roles = jwtTokenProvider.extractRoles(token);
            java.util.Date expiration = jwtTokenProvider.extractExpiration(token);
            
            tokenInfo.put("username", username);
            tokenInfo.put("roles", roles);
            tokenInfo.put("expiresAt", expiration);
            tokenInfo.put("isExpired", expiration.before(new java.util.Date()));
            tokenInfo.put("note", "This is decoded without signature validation. Use /verify for full validation.");
            
            return ResponseEntity.ok(ApiResponse.success("Token decoded successfully", tokenInfo));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Failed to decode token: " + e.getMessage()));
        }
    }
}
