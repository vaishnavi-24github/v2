# New Endpoints Guide

## 1. GET /api/users/me - Get Current User Profile

### Description
Protected endpoint for USER and ADMIN roles. Returns the logged-in user's profile from SecurityContext. **Password is NOT returned**.

### Access
- ✅ USER role
- ✅ ADMIN role
- ❌ Unauthenticated users

### Request
```http
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_TOKEN_HERE
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["USER"],
    "enabled": true,
    "createdAt": "2026-01-10T10:00:00",
    "updatedAt": "2026-01-10T10:00:00"
  },
  "timestamp": "2026-01-10T11:30:00"
}
```

**Note:** Password field is intentionally excluded from the response.

### Postman Example
```
Method: GET
URL: http://localhost:8081/api/users/me
Headers:
  Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 2. POST /api/admin/users - Create New User (ADMIN Only)

### Description
ADMIN only endpoint to create new users. Password is automatically BCrypt-hashed. Default active status is `true`. Validates for duplicate username/email.

### Access
- ✅ ADMIN role only
- ❌ USER role
- ❌ Unauthenticated users

### Request
```http
POST http://localhost:8081/api/admin/users
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER"
}
```

### Request Body Fields
- `username` (required, 3-50 characters) - Must be unique
- `email` (required, valid email format) - Must be unique
- `password` (required, minimum 6 characters) - Will be BCrypt-hashed
- `role` (required) - Either "USER" or "ADMIN"

### Response (201 Created)
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "username": "newuser",
    "email": "newuser@example.com",
    "firstName": "",
    "lastName": "",
    "roles": ["USER"],
    "enabled": true,
    "createdAt": "2026-01-10T11:30:00",
    "updatedAt": "2026-01-10T11:30:00"
  },
  "timestamp": "2026-01-10T11:30:00"
}
```

### Error Responses

**400 Bad Request - Username already taken:**
```json
{
  "success": false,
  "message": "Username is already taken",
  "timestamp": "2026-01-10T11:30:00"
}
```

**400 Bad Request - Email already in use:**
```json
{
  "success": false,
  "message": "Email is already in use",
  "timestamp": "2026-01-10T11:30:00"
}
```

**403 Forbidden - Not ADMIN:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "timestamp": "2026-01-10T11:30:00"
}
```

### Postman Example
```
Method: POST
URL: http://localhost:8081/api/admin/users
Headers:
  Authorization: Bearer ADMIN_TOKEN_HERE
  Content-Type: application/json
Body (raw JSON):
{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER"
}
```

---

## 3. PUT /api/admin/users/{id}/status - Activate/Deactivate User (ADMIN Only)

### Description
ADMIN only endpoint to activate or deactivate users. **Deactivated users cannot login** - the `enabled` field is checked during authentication.

### Access
- ✅ ADMIN role only
- ❌ USER role
- ❌ Unauthenticated users

### Request
```http
PUT http://localhost:8081/api/admin/users/507f1f77bcf86cd799439011/status
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "active": false
}
```

### Request Body
- `active` (required, boolean) - `true` to activate, `false` to deactivate

### Response (200 OK) - User Deactivated
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "roles": ["USER"],
    "enabled": false,
    "createdAt": "2026-01-10T10:00:00",
    "updatedAt": "2026-01-10T11:35:00"
  },
  "timestamp": "2026-01-10T11:35:00"
}
```

### Response (200 OK) - User Activated
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "User",
    "roles": ["USER"],
    "enabled": true,
    "createdAt": "2026-01-10T10:00:00",
    "updatedAt": "2026-01-10T11:35:00"
  },
  "timestamp": "2026-01-10T11:35:00"
}
```

### Error Responses

**404 Not Found - User not found:**
```json
{
  "success": false,
  "message": "User not found with id: 507f1f77bcf86cd799439011",
  "timestamp": "2026-01-10T11:35:00"
}
```

**403 Forbidden - Not ADMIN:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "timestamp": "2026-01-10T11:35:00"
}
```

### Postman Example
```
Method: PUT
URL: http://localhost:8081/api/admin/users/507f1f77bcf86cd799439011/status
Headers:
  Authorization: Bearer ADMIN_TOKEN_HERE
  Content-Type: application/json
Body (raw JSON):
{
  "active": false
}
```

---

## Security Features

### ✅ Password Protection
- Passwords are **never returned** in any response
- Passwords are **BCrypt-hashed** before storage
- Password field is excluded from `UserProfileResponse` DTO

### ✅ User Activation/Deactivation
- Deactivated users (`enabled = false`) **cannot login**
- `UserDetailsServiceImpl` checks `user.isEnabled()` and sets `disabled(!user.isEnabled())`
- Spring Security will reject login attempts for disabled users

### ✅ Role-Based Access Control
- `/api/users/me` - Requires authentication (USER or ADMIN)
- `/api/admin/users` - Requires ADMIN role
- `/api/admin/users/{id}/status` - Requires ADMIN role

### ✅ Validation
- Username uniqueness validation
- Email uniqueness validation
- Email format validation
- Password minimum length (6 characters)
- Required field validation

---

## Complete Test Flow

### Step 1: Login as ADMIN
```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Step 2: Get Current User Profile
```http
GET http://localhost:8081/api/users/me
Authorization: Bearer ADMIN_TOKEN
```

### Step 3: Create New User
```http
POST http://localhost:8081/api/admin/users
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER"
}
```

### Step 4: Deactivate User
```http
PUT http://localhost:8081/api/admin/users/USER_ID/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "active": false
}
```

### Step 5: Verify Deactivated User Cannot Login
```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "newuser",
  "password": "password123"
}
```

**Expected:** 401 Unauthorized - User account is disabled

---

## Files Created/Modified

### New Files:
1. `UserProfileResponse.java` - DTO for user profile (no password)
2. `CreateUserRequest.java` - DTO for creating users
3. `UpdateUserStatusRequest.java` - DTO for updating user status
4. `UserService.java` - Business logic for user operations
5. `UserController.java` - Controller for `/api/users/me`
6. `AdminController.java` - Controller for admin endpoints

### Modified Files:
1. `SecurityConfig.java` - Added `/api/users/**` to authenticated endpoints

---

## Notes

- All passwords are BCrypt-hashed automatically
- Password field is never included in responses
- Deactivated users cannot login (checked in `UserDetailsServiceImpl`)
- All endpoints require proper authentication
- Admin endpoints require ADMIN role
- Validation ensures data integrity
