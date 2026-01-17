package com.yourpackage.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.yourpackage.security.JwtAuthenticationEntryPoint;
import com.yourpackage.security.JwtAuthenticationFilter;

/**
 * COMPLETE Spring Security Configuration with CORS
 * 
 * Copy this file and replace your existing SecurityConfig.java
 * IMPORTANT: Replace 'com.yourpackage' with your actual package name
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // ===== CRITICAL: This must be autowired for CORS to work =====
    @Autowired
    private CorsConfigurationSource corsConfigurationSource;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ===== STEP 1: Disable CSRF (required for JWT stateless auth) =====
            .csrf(csrf -> csrf.disable())
            
            // ===== STEP 2: ENABLE CORS (MUST be before authorizeHttpRequests) =====
            // This applies the CORS configuration from CorsConfig.java
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // ===== STEP 3: Exception handling =====
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            
            // ===== STEP 4: Stateless session (JWT) =====
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // ===== STEP 5: Request authorization =====
            .authorizeHttpRequests(auth -> auth
                // ===== CRITICAL: Allow preflight OPTIONS requests FIRST =====
                // Browsers send this before actual requests - MUST be permitted
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Public endpoints (no authentication required)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // All other API endpoints require JWT authentication
                .requestMatchers("/api/**").authenticated()
                
                // Deny all other requests
                .anyRequest().authenticated()
            );
        
        // ===== STEP 6: Add JWT filter =====
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}

/**
 * ===================================================================
 * IF YOU HAVE AN EXISTING SecurityConfig.java:
 * ===================================================================
 * 
 * Just add these THREE things:
 * 
 * 1. Import:
 *    import org.springframework.http.HttpMethod;
 *    import org.springframework.web.cors.CorsConfigurationSource;
 * 
 * 2. Add field:
 *    @Autowired
 *    private CorsConfigurationSource corsConfigurationSource;
 * 
 * 3. In filterChain(), add these TWO lines:
 *    
 *    Right after .csrf().disable():
 *    .cors(cors -> cors.configurationSource(corsConfigurationSource))
 *    
 *    Inside authorizeHttpRequests(), FIRST line:
 *    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
 * 
 * ===================================================================
 * ORDER MATTERS! The filterChain should look like this:
 * ===================================================================
 * 
 * http
 *     .csrf().disable()
 *     .cors() ← MUST BE HERE (before authorize)
 *     .exceptionHandling()
 *     .sessionManagement()
 *     .authorizeHttpRequests(auth -> auth
 *         .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() ← MUST BE FIRST
 *         .requestMatchers("/api/auth/**").permitAll()
 *         ...
 *     )
 *     .addFilterBefore(...)
 * 
 * ===================================================================
 */
