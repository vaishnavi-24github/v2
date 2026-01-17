# Verify CORS Configuration - Step by Step Checklist

## ✅ Backend Checklist

### Step 1: Verify CorsConfig.java Exists and is Correct

**Location:** `src/main/java/com/yourpackage/config/CorsConfig.java`

**Check these lines:**

1. ✅ File exists and is in the correct package
2. ✅ Uses `@Configuration` annotation
3. ✅ Has `@Bean` method returning `CorsConfigurationSource`
4. ✅ Uses `setAllowedOriginPatterns` (NOT `setAllowedOrigins` for wildcard ports):
   ```java
   configuration.setAllowedOriginPatterns(Arrays.asList(
       "http://localhost:*",
       "http://127.0.0.1:*"
   ));
   ```
5. ✅ Allows OPTIONS method
6. ✅ Allows Authorization header
7. ✅ `setAllowCredentials(true)` is set

### Step 2: Verify SecurityConfig.java is Updated

**Location:** `src/main/java/com/yourpackage/config/SecurityConfig.java`

**Check these imports exist:**
```java
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;
```

**Check this field exists:**
```java
@Autowired
private CorsConfigurationSource corsConfigurationSource;
```

**Check filterChain() method has these in ORDER:**
```java
http
    .csrf(csrf -> csrf.disable())
    .cors(cors -> cors.configurationSource(corsConfigurationSource))  // ← MUST BE HERE
    .exceptionHandling(...)
    .sessionManagement(...)
    .authorizeHttpRequests(auth -> auth
        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()  // ← MUST BE HERE
        .requestMatchers("/api/auth/**").permitAll()
        ...
    );
```

### Step 3: Backend is Running

**Check:**
- [ ] Backend is started (check console/logs)
- [ ] Backend is running on port 8081 (default)
- [ ] No errors in backend startup logs
- [ ] Backend logs show Spring Security initialized

**Test backend directly:**
```bash
# Test if backend is running
curl http://localhost:8081/api/auth/login -X OPTIONS -v
```

If backend is NOT running:
1. Navigate to backend directory
2. Run: `mvn spring-boot:run` or `./gradlew bootRun`
3. Wait for "Started Application" message

### Step 4: Restart Backend After CORS Changes

**After making CORS config changes:**
1. ✅ STOP the backend (Ctrl+C)
2. ✅ Clean build: `mvn clean install` or `./gradlew clean build`
3. ✅ START backend again
4. ✅ Check for compilation errors
5. ✅ Wait for "Started Application" message

**IMPORTANT:** CORS config changes require backend restart to take effect!

## ✅ Frontend Checklist

### Step 1: Verify Frontend is Running

- [ ] Angular dev server is running (`ng serve`)
- [ ] Frontend is accessible at `http://localhost:51986` (or your port)
- [ ] No compilation errors in Angular console

### Step 2: Check Browser Console

**Before clicking Login, check:**
- [ ] No errors in console
- [ ] Frontend loaded successfully

**After clicking Login, check:**
- [ ] Network tab shows OPTIONS request (preflight)
- [ ] What status does OPTIONS request return?

### Step 3: Test API Endpoint Directly

**Open browser DevTools → Network tab:**
1. Click "Login" button
2. Look for OPTIONS request to `/api/auth/login`
3. Click on the OPTIONS request
4. Check Response Headers:
   - ❌ If headers are empty → Backend CORS not configured
   - ✅ Should see: `Access-Control-Allow-Origin: http://localhost:51986`
   - ✅ Should see: `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
   - ✅ Should see: `Access-Control-Allow-Headers: Authorization, Content-Type`

## 🔍 Troubleshooting Steps

### If OPTIONS Request Fails (404 or 403):

**Problem:** Spring Security is blocking OPTIONS requests

**Solution:** Add this to SecurityConfig.java:
```java
.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
```

### If OPTIONS Request Returns 200 but No CORS Headers:

**Problem:** CORS configuration not being applied

**Solution:** 
1. Check CorsConfig.java is in correct package
2. Verify SecurityConfig.java imports CorsConfigurationSource
3. Verify `.cors(cors -> cors.configurationSource(corsConfigurationSource))` is in filterChain
4. Restart backend

### If "No 'Access-Control-Allow-Origin' header":

**Problem:** CORS config not loaded or wrong origin

**Solution:**
1. Use `setAllowedOriginPatterns` with `localhost:*` (wildcard)
2. OR add exact origin: `"http://localhost:51986"`
3. Restart backend

### If Backend Won't Start:

**Check for errors:**
1. Compilation errors? Fix them first
2. Port 8081 already in use? Change port or kill process
3. Missing dependencies? Run `mvn clean install` or `./gradlew build`

## 🧪 Quick Test Commands

### Test Backend CORS Response:

```bash
# Test OPTIONS (preflight) request
curl -X OPTIONS http://localhost:8081/api/auth/login \
  -H "Origin: http://localhost:51986" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  -v

# Should return 200 with CORS headers:
# Access-Control-Allow-Origin: http://localhost:51986
# Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
# Access-Control-Allow-Headers: Authorization, Content-Type
```

### Test if Backend is Running:

```bash
# Simple health check
curl http://localhost:8081

# Or check specific endpoint
curl http://localhost:8081/api/auth/login -X POST -H "Content-Type: application/json" -d '{"username":"test","password":"test"}'
```

## 📋 Common Mistakes

1. ❌ **Forgot to restart backend** after CORS changes
2. ❌ **Used `setAllowedOrigins` instead of `setAllowedOriginPatterns`** (wildcard ports)
3. ❌ **Missing `.cors()` in SecurityConfig** filterChain
4. ❌ **OPTIONS requests not permitted** in SecurityConfig
5. ❌ **Wrong package name** in CorsConfig.java
6. ❌ **Backend not running** or running on different port
7. ❌ **CORS config after authorization** (should come before authorizeHttpRequests)

## ✅ Final Verification

After fixing everything, you should see in browser Network tab:

**OPTIONS Request:**
- Status: `200 OK`
- Response Headers include:
  - `Access-Control-Allow-Origin: http://localhost:51986`
  - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: Authorization, Content-Type`
  - `Access-Control-Allow-Credentials: true`

**POST Request:**
- Status: `200` (success) or `401` (wrong credentials) - NOT `0` or blocked
- Can proceed with actual login attempt
