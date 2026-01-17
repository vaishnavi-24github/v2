# How to Check/Verify JWT Token

## Method 1: Using API Endpoints (Recommended)

### 1. Verify Token (Full Validation)
This endpoint validates the token signature, expiration, and extracts all information.

```powershell
curl -X GET http://localhost:8081/api/token/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "valid": true,
    "username": "testuser",
    "roles": ["ROLE_USER"],
    "expiresAt": "2024-01-11T10:45:20.000+00:00",
    "expiresIn": "86399 seconds",
    "isExpired": false
  }
}
```

### 2. Decode Token (Without Validation)
This endpoint decodes the token without validating the signature. Useful for testing.

```powershell
curl -X POST http://localhost:8081/api/token/decode \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"YOUR_TOKEN_HERE\"}"
```

**Response:**
```json
{
  "success": true,
  "message": "Token decoded successfully",
  "data": {
    "username": "testuser",
    "roles": ["ROLE_USER"],
    "expiresAt": "2024-01-11T10:45:20.000+00:00",
    "isExpired": false,
    "note": "This is decoded without signature validation. Use /verify for full validation."
  }
}
```

### 3. Get Current User Info
Get information about the currently authenticated user from SecurityContext.

```powershell
curl -X GET http://localhost:8081/api/token/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "testuser",
    "authorities": ["ROLE_USER"],
    "authenticated": true,
    "principal": "User"
  }
}
```

## Method 2: Online JWT Decoders (For Testing Only)

⚠️ **WARNING:** Only use these for testing with non-production tokens. Never paste production tokens!

### Popular JWT Decoders:
1. **JWT.io** - https://jwt.io
   - Paste your token to decode
   - Shows header, payload, and signature
   - Can verify signature if you provide the secret

2. **JWT Decoder** - https://www.jsonwebtoken.io
   - Simple token decoder
   - Shows all claims

### How to Use:
1. Copy your JWT token (the long string after "Bearer ")
2. Go to jwt.io
3. Paste token in the "Encoded" section
4. View decoded payload on the right

**Example Token Structure:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0dXNlciIsInJvbGVzIjpbIlJPTEVfVVNFUiJdLCJpYXQiOjE3MDQ4OTI4MDAsImV4cCI6MTcwNDk3OTIwMH0.signature
```

**Decoded:**
```json
{
  "sub": "testuser",
  "roles": ["ROLE_USER"],
  "iat": 1704892800,
  "exp": 1704979200
}
```

## Method 3: Complete Test Flow

### Step 1: Register/Login to Get Token
```powershell
# Register
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{\"username\":\"testuser\",\"email\":\"test@example.com\",\"password\":\"password123\",\"firstName\":\"Test\",\"lastName\":\"User\"}'

# Or Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{\"username\":\"testuser\",\"password\":\"password123\"}'
```

**Save the token from the response!**

### Step 2: Verify the Token
```powershell
curl -X GET http://localhost:8081/api/token/verify \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Step 3: Use Token to Access Protected Endpoint
```powershell
curl -X GET http://localhost:8081/api/deals \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Method 4: Using PowerShell Script

Create a file `check-token.ps1`:

```powershell
param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

Write-Host "Verifying token..." -ForegroundColor Yellow
$response = Invoke-RestMethod -Uri "http://localhost:8081/api/token/verify" -Method Get -Headers $headers

Write-Host "`nToken Information:" -ForegroundColor Green
$response.data | ConvertTo-Json -Depth 10
```

**Usage:**
```powershell
.\check-token.ps1 -Token "YOUR_TOKEN_HERE"
```

## Method 5: Programmatic Token Checking

### In Your Code (Java):
```java
@Autowired
private JwtTokenProvider jwtTokenProvider;

// Extract username
String username = jwtTokenProvider.extractUsername(token);

// Extract roles
List<String> roles = jwtTokenProvider.extractRoles(token);

// Check expiration
Date expiration = jwtTokenProvider.extractExpiration(token);
boolean isExpired = expiration.before(new Date());

// Validate token
UserDetails userDetails = userDetailsService.loadUserByUsername(username);
boolean isValid = jwtTokenProvider.validateToken(token, userDetails);
```

## Common Token Issues

### Issue: "Invalid token"
**Causes:**
- Token expired
- Invalid signature
- Malformed token
- Wrong secret key

**Solution:**
- Check token expiration: `expiresAt` field
- Verify you're using the correct JWT secret
- Get a new token by logging in again

### Issue: "Token expired"
**Solution:**
- Login again to get a new token
- Tokens expire after 24 hours (configurable in `application.yml`)

### Issue: "Missing Authorization header"
**Solution:**
- Include header: `Authorization: Bearer <token>`
- Make sure there's a space after "Bearer"

## Quick Test Commands

### Complete Test Flow:
```powershell
# 1. Login
$loginResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body '{"username":"testuser","password":"password123"}'

# 2. Extract token
$token = $loginResponse.data.token
Write-Host "Token: $token" -ForegroundColor Green

# 3. Verify token
$headers = @{"Authorization" = "Bearer $token"}
$verifyResponse = Invoke-RestMethod -Uri "http://localhost:8081/api/token/verify" `
    -Method Get `
    -Headers $headers

# 4. Display token info
$verifyResponse.data | ConvertTo-Json
```

## Token Structure Explained

### Header:
```json
{
  "alg": "HS256",  // Algorithm: HMAC SHA-256
  "typ": "JWT"     // Type: JSON Web Token
}
```

### Payload (Claims):
```json
{
  "sub": "username",           // Subject (username)
  "roles": ["ROLE_USER"],      // User roles
  "authorities": ["ROLE_USER"], // Same as roles
  "iat": 1704892800,          // Issued at (timestamp)
  "exp": 1704979200           // Expiration (timestamp)
}
```

### Signature:
- HMAC SHA-256 signature
- Created using: `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`

## Security Notes

1. ✅ **Never share production tokens** - They contain sensitive information
2. ✅ **Use HTTPS in production** - Tokens should only be sent over encrypted connections
3. ✅ **Store tokens securely** - Don't log tokens or store them in plain text
4. ✅ **Check expiration** - Always validate token expiration
5. ✅ **Validate signature** - Always verify token signature before trusting it
