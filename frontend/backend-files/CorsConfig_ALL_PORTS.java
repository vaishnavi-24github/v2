package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Global CORS Configuration for Spring Boot - DEVELOPMENT VERSION
 * 
 * This configuration allows localhost with ANY port for development.
 * WARNING: Do NOT use this in production! Use specific ports instead.
 * 
 * For production, use the regular CorsConfig.java with specific origins.
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // DEVELOPMENT: Allow localhost with any port
        // This is more flexible for Angular dev server which can use different ports
        // PRODUCTION: Replace with specific origins only
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",        // Any port on localhost
            "http://127.0.0.1:*"        // Alternative localhost format
        ));
        
        // For production, use specific origins instead:
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

/**
 * ===================================================================
 * IMPORTANT NOTES:
 * ===================================================================
 * 
 * 1. setAllowedOriginPatterns() with "http://localhost:*" allows ANY port
 *    This is convenient for development but should be restricted in production.
 * 
 * 2. If you prefer specific ports only, use the original CorsConfig.java
 *    and manually add each port you use.
 * 
 * 3. For production, ALWAYS use specific origins:
 *    configuration.setAllowedOrigins(Arrays.asList(
 *        "https://yourdomain.com",
 *        "https://www.yourdomain.com"
 *    ));
 * 
 * ===================================================================
 */
