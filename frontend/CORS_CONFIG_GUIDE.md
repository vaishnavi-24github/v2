# Spring Boot CORS Configuration Guide

## Files to Create/Update in Your Backend

### 1. Create: `src/main/java/com/yourpackage/config/CorsConfig.java`

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow specific origins (Angular dev servers)
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:4200",
            "http://localhost:51514"
        ));
        
        // Allow all HTTP methods
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        // Allow specific headers
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type",
            "X-Requested-With",
            "Accept",
            "Origin",
            "Access-Control-Request-Method",
            "Access-Control-Request-Headers"
        ));
        
        // Allow credentials (cookies, authorization headers)
        configuration.setAllowCredentials(true);
        
        // Expose headers to frontend
        configuration.setExposedHeaders(Arrays.asList(
            "Authorization",
            "Content-Type"
        ));
        
        // Cache preflight response for 1 hour
        configuration.setMaxAge(3600L);
        
        // Apply CORS configuration to all endpoints
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }
}
```

### 2. Update: `src/main/java/com/yourpackage/config/SecurityConfig.java`

Add CORS configuration to your Spring Security config:

```java
package com.yourpackage.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
            // Disable CSRF for stateless JWT authentication
            .csrf(csrf -> csrf.disable())
            
            // Enable CORS with our configuration
            .cors(cors -> cors.configurationSource(corsConfigurationSource))
            
            // Configure exception handling
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
            )
            
            // Set session management to stateless (JWT)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            
            // Configure request authorization
            .authorizeHttpRequests(auth -> auth
                // Public endpoints (no authentication required)
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/error").permitAll()
                
                // All other API endpoints require authentication
                .requestMatchers("/api/**").authenticated()
                
                // Allow preflight OPTIONS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // Deny all other requests
                .anyRequest().authenticated()
            );
        
        // Add JWT filter before UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

**IMPORTANT:** If your SecurityConfig uses a different structure, add these lines:

```java
// Add this import
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;

// In your filterChain method, add:
.cors(cors -> cors.configurationSource(corsConfigurationSource))

// And ensure OPTIONS requests are allowed:
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
```

### 3. Alternative: Simple WebMvcConfigurer (If not using Spring Security)

If you're not using Spring Security or want a simpler approach, add this to your main application class or a separate config:

```java
package com.yourpackage.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:4200", "http://localhost:51514")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("Authorization", "Content-Type", "X-Requested-With", "Accept", "Origin")
            .allowCredentials(true)
            .maxAge(3600);
    }
}
```

## Why Preflight Was Failing

### The Problem:
1. **Preflight Requests (OPTIONS):** When your Angular app makes a request with custom headers (like `Authorization`), the browser first sends an OPTIONS request to check if the server allows CORS.
2. **Missing CORS Headers:** Your Spring Boot backend wasn't sending the required CORS headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, etc.) in response to preflight requests.
3. **Spring Security Blocking:** Spring Security was likely blocking the OPTIONS preflight request before it could reach your controller.

### The Solution:
1. **Global CORS Configuration:** Created a `CorsConfigurationSource` bean that defines CORS rules for all endpoints.
2. **Spring Security Integration:** Enabled CORS in `SecurityConfig` and allowed OPTIONS requests explicitly.
3. **Proper Headers:** Configured allowed origins, methods, and headers that match your frontend's requirements.
4. **Credentials Support:** Enabled `allowCredentials(true)` so JWT tokens in the Authorization header work properly.

## Testing CORS Configuration

After implementing, test with:

1. **Browser Console:** Check for CORS errors
2. **Network Tab:** Verify preflight OPTIONS requests return 200 with CORS headers
3. **Response Headers:** Look for:
   - `Access-Control-Allow-Origin: http://localhost:4200`
   - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
   - `Access-Control-Allow-Headers: Authorization, Content-Type`
   - `Access-Control-Allow-Credentials: true`

## Troubleshooting

If CORS errors persist:

1. **Check Spring Security Order:** Ensure `.cors()` comes before `.authorizeHttpRequests()`
2. **Verify OPTIONS Allowed:** Make sure OPTIONS requests are explicitly permitted
3. **Check Header Names:** Ensure `Authorization` is in allowed headers
4. **Verify Origins:** Check exact origin in browser (including port number)
5. **Clear Browser Cache:** Hard refresh (Ctrl+F5) after backend restart

## Notes

- Replace `com.yourpackage` with your actual package name
- The CORS configuration is applied globally to all endpoints (`/**`)
- This configuration allows credentials, which is required for JWT authentication
- Preflight caching is set to 1 hour (`maxAge(3600)`) to reduce OPTIONS requests
