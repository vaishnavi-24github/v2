package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Global CORS Configuration for Spring Boot
 * 
 * This configuration allows the Angular frontend running on:
 * - http://localhost:4200 (default)
 * - http://localhost:51514
 * - http://localhost:51986 (current)
 * - Plus alternative 127.0.0.1 formats
 * 
 * To communicate with the Spring Boot backend running on http://localhost:8081
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // DEVELOPMENT: Allow localhost with ANY port (more flexible)
        // This avoids issues when Angular CLI uses different ports
        // Use setAllowedOriginPatterns for wildcard port matching
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",        // Any port on localhost (development)
            "http://127.0.0.1:*"        // Alternative localhost format
        ));
        
        // PRODUCTION: Replace above with specific origins only:
        // configuration.setAllowedOrigins(Arrays.asList(
        //     "http://localhost:4200",
        //     "https://yourdomain.com"
        // ));
        
        // Allow all required HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", 
            "POST", 
            "PUT", 
            "PATCH", 
            "DELETE", 
            "OPTIONS"  // Required for preflight requests
        ));
        
        // Allow specific headers required for JWT authentication
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",           // Required for JWT Bearer tokens
            "Content-Type",            // Required for JSON requests
            "X-Requested-With",        // Standard header
            "Accept",                  // Standard header
            "Origin",                  // Standard header
            "Access-Control-Request-Method",   // For preflight
            "Access-Control-Request-Headers"   // For preflight
        ));
        
        // Allow credentials (required for JWT in Authorization header)
        configuration.setAllowCredentials(true);
        
        // Expose headers that frontend needs to read
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));
        
        // Cache preflight response for 1 hour (reduces OPTIONS requests)
        configuration.setMaxAge(3600L);
        
        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
