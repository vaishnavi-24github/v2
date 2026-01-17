# URGENT: Update CORS Configuration

## Problem
Your Angular frontend is running on port **51986**, but CORS only allows ports 4200 and 51514. This causes the login to fail with CORS errors.

## Quick Fix - Choose ONE Option:

### Option 1: Allow Any Localhost Port (Recommended for Development)

**Update `CorsConfig.java`:**

Replace the `setAllowedOrigins` line with:

```java
// Use setAllowedOriginPatterns instead for wildcard port matching
configuration.setAllowedOriginPatterns(Arrays.asList(
    "http://localhost:*",        // Any port on localhost
    "http://127.0.0.1:*"        // Alternative localhost format
));
```

**IMPORTANT:** Change `setAllowedOrigins` to `setAllowedOriginPatterns` to support wildcard ports.

### Option 2: Add Port 51986 Explicitly

**Update `CorsConfig.java`:**

Add port 51986 to the allowed origins list:

```java
configuration.setAllowedOrigins(Arrays.asList(
    "http://localhost:4200",
    "http://localhost:51514",
    "http://localhost:51986",      // ADD THIS LINE
    "http://127.0.0.1:4200",
    "http://127.0.0.1:51514",
    "http://127.0.0.1:51986"       // ADD THIS LINE
));
```

## After Updating:

1. **Stop your Spring Boot backend**
2. **Clean and rebuild:**
   ```bash
   mvn clean install
   # OR
   ./gradlew clean build
   ```
3. **Restart your backend**
4. **Test login again from Angular frontend**

## Verify CORS is Working:

Check browser DevTools → Network tab:
- OPTIONS request should return **200 OK**
- Response headers should include:
  ```
  Access-Control-Allow-Origin: http://localhost:51986
  Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
  Access-Control-Allow-Headers: Authorization, Content-Type
  Access-Control-Allow-Credentials: true
  ```

## Why This Happens:

Angular CLI (`ng serve`) can use different ports:
- Default: 4200
- If 4200 is busy: 4201, 4202, etc.
- Sometimes: Random ports like 51514, 51986

Using `setAllowedOriginPatterns` with `localhost:*` avoids this issue in development.
