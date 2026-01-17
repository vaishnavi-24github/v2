# CORS Error - Complete Troubleshooting Guide

## Current Error Analysis

**From your console:**
```
Access to XMLHttpRequest at 'http://localhost:8081/api/auth/login' 
from origin 'http://localhost:51986' has been blocked by CORS policy: 
Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**This means:**
1. ✅ Frontend is working correctly
2. ✅ Frontend is trying to connect to backend
3. ❌ Backend is NOT sending CORS headers
4. ❌ Backend CORS configuration is either missing or not applied

## Root Cause

The backend is **NOT responding with CORS headers**. This happens when:
- CORS config file doesn't exist
- CORS config exists but SecurityConfig doesn't use it
- Backend hasn't been restarted after adding CORS config
- CORS config is loaded but OPTIONS requests are blocked

## Step-by-Step Fix

### Step 1: Verify Backend Files Exist

**Check if these files exist in your backend:**

1. `src/main/java/com/yourpackage/config/CorsConfig.java`
2. `src/main/java/com/yourpackage/config/SecurityConfig.java`

**If files don't exist:**
- Copy `backend-files/CorsConfig.java` to your backend
- Update `backend-files/SecurityConfig_COMPLETE_EXAMPLE.java` and copy to your SecurityConfig

### Step 2: Verify CorsConfig.java Content

**Open:** `src/main/java/com/yourpackage/config/CorsConfig.java`

**Must have:**
```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // MUST use setAllowedOriginPatterns for wildcard ports
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "http://127.0.0.1:*"
        ));
        
        configuration.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));
        
        configuration.setAllowedHeaders(Arrays.asList(
            "Authorization", "Content-Type", ...
        ));
        
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### Step 3: Verify SecurityConfig.java Content

**Open:** `src/main/java/com/yourpackage/config/SecurityConfig.java`

**Must have:**

1. **Import:**
```java
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;
```

2. **Field:**
```java
@Autowired
private CorsConfigurationSource corsConfigurationSource;
```

3. **In filterChain() method:**
```java
http
    .csrf(csrf -> csrf.disable())
    .cors(cors -> cors.configurationSource(corsConfigurationSource))  // ← MUST BE HERE
    .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // ← MUST BE FIRST
        .requestMatchers("/api/auth/**").permitAll()
        ...
    );
```

### Step 4: Backend Build & Restart

**IMPORTANT: Backend MUST be restarted after CORS changes!**

1. **Stop backend** (Ctrl+C in terminal where it's running)

2. **Clean and rebuild:**
   ```bash
   cd <your-backend-directory>
   mvn clean install
   # OR if using Gradle:
   ./gradlew clean build
   ```

3. **Start backend:**
   ```bash
   mvn spring-boot:run
   # OR:
   ./gradlew bootRun
   # OR:
   java -jar target/your-app.jar
   ```

4. **Wait for:** `Started Application in X.XXX seconds`

5. **Check logs for:**
   - ✅ No CORS-related errors
   - ✅ Spring Security initialized
   - ✅ Application started successfully

### Step 5: Test Backend CORS Response

**In a new terminal, test OPTIONS request:**

```bash
curl -X OPTIONS http://localhost:8081/api/auth/login \
  -H "Origin: http://localhost:51986" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v
```

**Expected output:**
```
< HTTP/1.1 200
< Access-Control-Allow-Origin: http://localhost:51986
< Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
< Access-Control-Allow-Headers: Authorization, Content-Type
< Access-Control-Allow-Credentials: true
```

**If you get 403 or 404:** SecurityConfig is blocking OPTIONS requests

**If you get 200 but no CORS headers:** CORS config not being applied

### Step 6: Test from Browser

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Clear network log**
4. **Click Login button**
5. **Check OPTIONS request:**
   - Status should be `200`
   - Response Headers should include CORS headers

## Common Issues & Solutions

### Issue 1: "CORS config not found"

**Error in backend logs:** `No qualifying bean of type 'CorsConfigurationSource'`

**Solution:**
- Make sure CorsConfig.java is in the correct package
- Make sure `@Configuration` annotation is present
- Make sure `@Bean` method returns `CorsConfigurationSource`
- Check package scanning includes your config package

### Issue 2: "OPTIONS request returns 403"

**Problem:** Spring Security blocking OPTIONS before CORS applies

**Solution:** Add this FIRST in authorizeHttpRequests:
```java
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
```

### Issue 3: "setAllowedOriginPatterns not found"

**Problem:** Using older Spring Boot version (before 2.4)

**Solution:** Use specific origins instead:
```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:4200",
    "http://localhost:51514",
    "http://localhost:51986"
));
```

### Issue 4: "Backend won't start"

**Check:**
1. Compilation errors? Fix syntax errors first
2. Port 8081 in use? Change port in application.properties:
   ```properties
   server.port=8081
   ```
3. Missing dependency? Add to pom.xml or build.gradle:
   ```xml
   <dependency>
       <groupId>org.springframework.boot</groupId>
       <artifactId>spring-boot-starter-web</artifactId>
   </dependency>
   ```

## Quick Verification Checklist

- [ ] CorsConfig.java exists in `src/main/java/com/yourpackage/config/`
- [ ] CorsConfig.java has `@Configuration` and `@Bean` annotations
- [ ] Uses `setAllowedOriginPatterns` with `localhost:*`
- [ ] SecurityConfig.java imports `CorsConfigurationSource`
- [ ] SecurityConfig.java has `@Autowired CorsConfigurationSource` field
- [ ] SecurityConfig.java filterChain has `.cors()` line
- [ ] SecurityConfig.java permits `HttpMethod.OPTIONS`
- [ ] Backend compiled successfully (no errors)
- [ ] Backend started successfully (see "Started Application")
- [ ] Backend is running on port 8081
- [ ] curl test shows CORS headers in response
- [ ] Browser Network tab shows OPTIONS returns 200 with CORS headers

## Still Not Working?

If after all steps it still doesn't work:

1. **Share backend logs** - Check for CORS-related errors
2. **Check Spring Boot version** - CORS features may differ
3. **Verify package names** - Make sure `com.yourpackage` matches your actual package
4. **Check if using Spring WebFlux** - Different CORS config needed
5. **Verify no proxy/firewall** blocking requests

## Success Indicators

When CORS is working correctly, you should see:

✅ OPTIONS request returns `200 OK`
✅ Response includes `Access-Control-Allow-Origin` header
✅ POST request proceeds (not blocked)
✅ Login either succeeds (200) or fails with 401 (wrong credentials), NOT status 0
✅ Browser console shows actual API response, not CORS error
