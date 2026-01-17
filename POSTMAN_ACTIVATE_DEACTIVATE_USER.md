# How to Activate/Deactivate User in Postman

## Endpoint: PUT /api/admin/users/{id}/status

### Overview
- **Method:** PUT
- **URL:** `http://localhost:8081/api/admin/users/{id}/status`
- **Access:** ADMIN role only
- **Purpose:** Activate or deactivate a user account
- **Effect:** Deactivated users cannot login

---

## Step-by-Step Guide

### Step 1: Get a User ID

First, you need the user's ID. You can get it in several ways:

#### Option A: From MongoDB Compass
1. Open MongoDB Compass
2. Go to `deal_pipeline_db` → `users` collection
3. Find the user document
4. Copy the `_id` field (e.g., `6961e86c55d8af06a512f241`)

#### Option B: From API Response
If you created a user via `/api/admin/users`, the response includes the ID:
```json
{
  "data": {
    "id": "6961e86c55d8af06a512f241",  ← Copy this
    "username": "user1",
    ...
  }
}
```

#### Option C: Get Current User ID
```
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_ADMIN_TOKEN
```
Response includes your ID.

#### Option D: List All Users (if you have a GET endpoint)
Or check MongoDB directly.

### Step 2: Login as ADMIN

You need an ADMIN token to access this endpoint:

```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Copy the token** from the response.

### Step 3: Setup Request in Postman

#### Request Configuration:
- **Method:** `PUT`
- **URL:** `http://localhost:8081/api/admin/users/{USER_ID}/status`
  - Replace `{USER_ID}` with the actual user ID
  - Example: `http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241/status`

#### Headers Tab:
Add these headers:
```
Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
Content-Type: application/json
```

**OR** use Authorization tab:
- Type: `Bearer Token`
- Token: Paste your ADMIN token

#### Body Tab:
1. Select **"raw"**
2. Select **"JSON"** from dropdown
3. Enter the JSON body:

**To Deactivate User:**
```json
{
  "active": false
}
```

**To Activate User:**
```json
{
  "active": true
}
```

### Step 4: Send Request

Click the **"Send"** button.

---

## Expected Responses

### Success - User Deactivated (200 OK)
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "username": "user1",
    "email": "user1@example.com",
    "firstName": "User",
    "lastName": "One",
    "roles": ["USER"],
    "enabled": false,  ← Changed to false
    "createdAt": "2026-01-10T05:49:31.330+00:00",
    "updatedAt": "2026-01-10T11:50:00.000+00:00"  ← Updated timestamp
  },
  "timestamp": "2026-01-10T11:50:00"
}
```

### Success - User Activated (200 OK)
```json
{
  "success": true,
  "message": "User activated successfully",
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "username": "user1",
    "email": "user1@example.com",
    "firstName": "User",
    "lastName": "One",
    "roles": ["USER"],
    "enabled": true,  ← Changed to true
    "createdAt": "2026-01-10T05:49:31.330+00:00",
    "updatedAt": "2026-01-10T11:50:00.000+00:00"
  },
  "timestamp": "2026-01-10T11:50:00"
}
```

### Error - User Not Found (404 Not Found)
```json
{
  "success": false,
  "message": "User not found with id: invalid_id",
  "timestamp": "2026-01-10T11:50:00"
}
```

### Error - Not ADMIN (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "timestamp": "2026-01-10T11:50:00"
}
```

### Error - Missing Token (401 Unauthorized)
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing token",
  "timestamp": "2026-01-10T11:50:00"
}
```

---

## Complete Example

### Example 1: Deactivate a User

**Request:**
```
PUT http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241/status
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body:**
```json
{
  "active": false
}
```

**Result:** User is deactivated and cannot login.

### Example 2: Activate a User

**Request:**
```
PUT http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241/status
```

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Body:**
```json
{
  "active": true
}
```

**Result:** User is activated and can login again.

---

## Testing the Effect

### Test 1: Verify User is Deactivated

After deactivating a user, try to login with that user's credentials:

```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "user123"
}
```

**Expected Result:** `401 Unauthorized` - User account is disabled

### Test 2: Verify User is Activated

After activating a user, try to login:

```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "user123"
}
```

**Expected Result:** `200 OK` - Login successful with token

---

## Visual Guide for Postman

### Request Setup:
```
┌─────────────────────────────────────────────────────┐
│ PUT http://localhost:8081/api/admin/users/.../status│
├─────────────────────────────────────────────────────┤
│ [Authorization] [Headers] [Body] [Scripts]          │
│                                                      │
│ Headers Tab:                                         │
│   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...    │
│   Content-Type: application/json                    │
│                                                      │
│ Body Tab (raw JSON):                                │
│   {                                                 │
│     "active": false                                 │
│   }                                                 │
└─────────────────────────────────────────────────────┘
```

---

## Quick Test Flow

### Complete Workflow:

1. **Login as ADMIN:**
   ```
   POST /api/auth/login
   Body: {"username":"admin","password":"admin123"}
   ```
   → Copy token

2. **Get User ID:**
   - From MongoDB Compass, or
   - From previous API response, or
   - From `/api/users/me` endpoint

3. **Deactivate User:**
   ```
   PUT /api/admin/users/{USER_ID}/status
   Authorization: Bearer ADMIN_TOKEN
   Body: {"active": false}
   ```

4. **Verify Deactivation:**
   ```
   POST /api/auth/login
   Body: {"username":"deactivated_user","password":"password"}
   ```
   → Should fail with 401

5. **Activate User Again:**
   ```
   PUT /api/admin/users/{USER_ID}/status
   Authorization: Bearer ADMIN_TOKEN
   Body: {"active": true}
   ```

6. **Verify Activation:**
   ```
   POST /api/auth/login
   Body: {"username":"user","password":"password"}
   ```
   → Should succeed with 200

---

## Common Issues

### ❌ Issue: 404 Not Found
**Cause:** Invalid user ID  
**Solution:** 
- Verify user ID in MongoDB Compass
- Make sure you're using the correct `_id` field
- ID should be a valid MongoDB ObjectId

### ❌ Issue: 403 Forbidden
**Cause:** User doesn't have ADMIN role  
**Solution:**
- Check your token has ADMIN role: `GET /api/users/me`
- Update user role to ADMIN in MongoDB
- Login again to get new token

### ❌ Issue: 401 Unauthorized
**Cause:** Missing or invalid token  
**Solution:**
- Add `Authorization: Bearer YOUR_TOKEN` header
- Make sure token is not expired
- Login again to get fresh token

### ❌ Issue: User Still Can Login After Deactivation
**Cause:** Old token still valid  
**Solution:**
- Deactivation prevents NEW logins
- Existing tokens remain valid until expiration
- User needs to login again to get rejected

---

## Notes

- **Deactivated users** (`enabled: false`) cannot login
- **Activated users** (`enabled: true`) can login
- The `enabled` field is checked in `UserDetailsServiceImpl`
- Deactivation takes effect on next login attempt
- Existing tokens remain valid until expiration (24 hours)

---

## Using MongoDB Compass to Verify

After making the API call, you can verify in MongoDB Compass:

1. Open `deal_pipeline_db` → `users` collection
2. Find the user document
3. Check the `enabled` field:
   - `enabled: false` = User is deactivated
   - `enabled: true` = User is activated
4. Check `updatedAt` field - should be updated to current time
