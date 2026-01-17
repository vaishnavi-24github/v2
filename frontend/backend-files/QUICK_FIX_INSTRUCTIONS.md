# Quick CORS Fix Instructions for Spring Boot Backend

## Problem
CORS errors when Angular frontend (ports 4200/51514) tries to call Spring Boot backend (port 8081).

## Solution: 2 Steps

### Step 1: Create CorsConfig.java

**Location:** `src/main/java/com/yourpackage/config/CorsConfig.java`

**Replace:** `com.yourpackage` with your actual package name

**Copy the entire file from:** `backend-files/CorsConfig.java`

This file creates a global CORS configuration bean that allows:
- Origins: http://localhost:4200 and http://localhost:51514
- Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- Headers: Authorization, Content-Type, etc.
- Credentials: true (required for JWT)

### Step 2: Update SecurityConfig.java

**Location:** `src/main/java/com/yourpackage/config/SecurityConfig.java`

**Add these imports:**
```java
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;
```

**Add this field:**
```java
@Autowired
private CorsConfigurationSource corsConfigurationSource;
```

**In your filterChain() method, add this line (right after .csrf().disable()):**
```java
.cors(cors -> cors.configurationSource(corsConfigurationSource))
```

**In your authorizeHttpRequests(), add this line (before other requestMatchers):**
```java
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
```

**Complete filterChain example:**
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .csrf(csrf -> csrf.disable())
        .cors(cors -> cors.configurationSource(corsConfigurationSource))  // ADD THIS
        .exceptionHandling(exceptions -> exceptions
            .authenticationEntryPoint(jwtAuthenticationEntryPoint)
        )
        .sessionManagement(session -> session
            .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        )
        .authorizeHttpRequests(auth -> auth
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // ADD THIS
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/**").authenticated()
            .anyRequest().authenticated()
        );
    
    http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
    return http.build();
}
```

### Step 3: Restart Backend

1. Stop your Spring Boot application
2. Clean and rebuild: `mvn clean install` or `./gradlew clean build`
3. Restart the application
4. Test the login from Angular frontend

## Why Preflight Was Failing

1. **Browser sends OPTIONS request first** (preflight check)
2. **Spring Security was blocking it** (no explicit permission)
3. **No CORS headers in response** (CORS not configured)
4. **Browser blocks the actual request** (CORS policy violation)

## The Fix Works Because

1. **CorsConfig.java** creates a global CORS configuration
2. **SecurityConfig.java** applies CORS to all requests
3. **OPTIONS requests are explicitly allowed** (preflight passes)
4. **CORS headers are added automatically** to all responses
5. **Authorization header is allowed** (JWT tokens work)

## Verification

After implementing, check in browser DevTools:

**Network Tab:**
- Login request should show Status 200 (not blocked)
- OPTIONS preflight request should succeed

**Response Headers should include:**
```
Access-Control-Allow-Origin: http://localhost:4200
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

**Console should NOT show:**
- ❌ "Access to XMLHttpRequest has been blocked by CORS policy"
- ✅ Should show successful login
