# Postman Guide - Step by Step

## Issue: "Invalid username or password"

This error means the user doesn't exist in the database yet. You need to **register first**, then login.

## Step 1: Register a New User

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/auth/register`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

### Expected Response (201 Created):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": "...",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["USER"]
  },
  "timestamp": "2026-01-10T11:20:00"
}
```

**✅ Save the token from the response!** You can use it immediately without logging in.

## Step 2: Login (After Registration)

### Request Setup:
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/auth/login`
- **Headers:** 
  - `Content-Type: application/json`
- **Body (raw JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": "...",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["USER"]
  },
  "timestamp": "2026-01-10T11:20:00"
}
```

## Step 3: Use Token for Protected Endpoints

### Example: Get All Deals

- **Method:** `GET`
- **URL:** `http://localhost:8081/api/deals`
- **Headers:** 
  - `Authorization: Bearer YOUR_TOKEN_HERE`
  - (Replace `YOUR_TOKEN_HERE` with the token from login/register response)

### Example: Verify Token

- **Method:** `GET`
- **URL:** `http://localhost:8081/api/token/verify`
- **Headers:** 
  - `Authorization: Bearer YOUR_TOKEN_HERE`

## Common Issues & Solutions

### ❌ Error: "Invalid username or password"
**Cause:** User doesn't exist in database  
**Solution:** Register the user first using `/api/auth/register`

### ❌ Error: "Username is already taken"
**Cause:** User already exists  
**Solution:** Use a different username, or login with existing credentials

### ❌ Error: "Unauthorized" when accessing `/api/deals`
**Cause:** Missing or invalid token  
**Solution:** 
1. Make sure you're including the `Authorization` header
2. Format: `Authorization: Bearer <token>` (note the space after "Bearer")
3. Token might be expired - login again to get a new token

### ❌ Error: "Access denied" for `/api/admin/**`
**Cause:** User doesn't have ADMIN role  
**Solution:** User needs ADMIN role. By default, registered users get USER role.

## Quick Test Flow in Postman

1. **Register User:**
   ```
   POST http://localhost:8081/api/auth/register
   Body: {"username":"admin","email":"admin@example.com","password":"admin123","firstName":"Admin","lastName":"User"}
   ```

2. **Copy Token** from response

3. **Test Protected Endpoint:**
   ```
   GET http://localhost:8081/api/deals
   Headers: Authorization: Bearer <paste_token_here>
   ```

4. **Verify Token:**
   ```
   GET http://localhost:8081/api/token/verify
   Headers: Authorization: Bearer <paste_token_here>
   ```

## Postman Collection Setup Tips

### Create Environment Variables:
1. Go to **Environments** → **Add**
2. Add variable: `baseUrl` = `http://localhost:8081`
3. Add variable: `token` = (leave empty, will be set after login)

### Use Variables in Requests:
- URL: `{{baseUrl}}/api/auth/login`
- Authorization Header: `Bearer {{token}}`

### Auto-save Token:
After login, add this to **Tests** tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
}
```

This automatically saves the token to your environment after successful login!
