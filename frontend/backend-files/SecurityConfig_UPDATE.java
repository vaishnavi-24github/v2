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
 * Spring Security Configuration with CORS support
 * 
 * This configuration:
 * 1. Enables CORS with global configuration
 * 2. Allows preflight OPTIONS requests
 * 3. Permits /api/auth/** endpoints without authentication
 * 4. Requires JWT authentication for all other /api/** endpoints
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

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
            // ===== STEP 1: Disable CSRF for stateless JWT authentication =====
            .csrf(csrf -> csrf.disable())
            
            // ===== STEP 2: Enable CORS with our global configuration =====
            // IMPORTANT: This must come before authorizeHttpRequests
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // ===== STEP 3: Configure exception handling =====
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            
            // ===== STEP 4: Set session management to stateless (JWT) =====
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // ===== STEP 5: Configure request authorization =====
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // ===== CRITICAL: Allow preflight OPTIONS requests =====
                // Browsers send OPTIONS requests before actual requests (preflight)
                // These MUST be allowed or CORS will fail
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // All other API endpoints require JWT authentication
                .requestMatchers("/api/**").authenticated()
                
                // Deny all other requests
                .anyRequest().authenticated()
            );
        
        // ===== STEP 6: Add JWT filter before UsernamePasswordAuthenticationFilter =====
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}

/**
 * ===================================================================
 * IF YOUR SecurityConfig.java LOOKS DIFFERENT:
 * ===================================================================
 * 
 * Just add these key changes to your existing SecurityConfig:
 * 
 * 1. Import these:
 *    import org.springframework.http.HttpMethod;
 *    import org.springframework.web.cors.CorsConfigurationSource;
 * 
 * 2. Add this field:
 *    @Autowired
 *    private CorsConfigurationSource corsConfigurationSource;
 * 
 * 3. In your filterChain() method, add:
 *    .cors(cors -> cors.configurationSource(corsConfigurationSource))
 *    (This should come right after .csrf().disable())
 * 
 * 4. In your authorizeHttpRequests(), add:
 *    .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
 *    (This allows preflight OPTIONS requests)
 * 
 * ===================================================================
 */
