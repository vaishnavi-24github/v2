# Complete Postman Testing Guide - All Endpoints

## 🔴 Problem: 401 Unauthorized Errors

You're getting 401 errors because the token is either:
- Missing
- Invalid/expired
- Not properly set in Postman

## ✅ Solution: Complete Step-by-Step Guide

---

## STEP 1: Login to Get a Token

### Request Setup:
```
Method: POST
URL: http://localhost:8081/api/auth/login
```

### Headers Tab:
```
Content-Type: application/json
```

### Body Tab:
1. Select **"raw"**
2. Select **"JSON"** from dropdown
3. Enter:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

### Click "Send"

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNzA0ODkyODAwLCJleHAiOjE3MDQ5NzkyMDB9.signature",
    "type": "Bearer",
    "id": "6961e86c55d8af06a512f241",
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ADMIN"]
  }
}
```

### ⚠️ IMPORTANT: Copy the ENTIRE Token
- The token is very long (200+ characters)
- Copy the COMPLETE token from `"token"` field
- It should look like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIs...` (very long)

---

## STEP 2: Set Up Token in Postman

### Method A: Using Authorization Tab (Recommended)

1. In your request (GET /api/users/me or PUT /api/admin/users/...)
2. Click the **"Authorization"** tab
3. Select **Type:** `Bearer Token` from dropdown
4. In the **Token** field, paste your COMPLETE token
5. Make sure there are NO spaces before or after the token

### Method B: Using Headers Tab

1. Click the **"Headers"** tab
2. Add a new header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN_HERE`
   - ⚠️ IMPORTANT: There MUST be a space after "Bearer"
   - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

---

## STEP 3: Test GET /api/users/me

### Request Setup:
```
Method: GET
URL: http://localhost:8081/api/users/me
```

### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token from Step 1

### Click "Send"

### Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "roles": ["ADMIN"],
    "enabled": true,
    "createdAt": "2026-01-10T05:49:31.330+00:00",
    "updatedAt": "2026-01-10T05:49:31.330+00:00"
  }
}
```

**Note:** Password is NOT included (as required)

---

## STEP 4: Test PUT /api/admin/users/{id}/status

### Step 4a: Get User ID

You need a user ID. Get it from:
- MongoDB Compass (copy `_id` field)
- Or from a previous API response
- Or use your own ID from `/api/users/me` response

Example ID: `6961ef6b2d2d9b4392b6eda5`

### Step 4b: Setup Request

### Request Setup:
```
Method: PUT
URL: http://localhost:8081/api/admin/users/6961ef6b2d2d9b4392b6eda5/status
```
(Replace `6961ef6b2d2d9b4392b6eda5` with actual user ID)

### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your ADMIN token

### Headers Tab:
```
Content-Type: application/json
```

### Body Tab:
1. Select **"raw"**
2. Select **"JSON"**
3. Enter:

**To Deactivate:**
```json
{
  "active": false
}
```

**To Activate:**
```json
{
  "active": true
}
```

### Click "Send"

### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "6961ef6b2d2d9b4392b6eda5",
    "username": "user1",
    "email": "user1@example.com",
    "enabled": false,
    "roles": ["USER"],
    ...
  }
}
```

---

## Complete Testing Checklist

### ✅ Test 1: Login
```
POST http://localhost:8081/api/auth/login
Body: {"username":"admin","password":"admin123"}
```
**Expected:** 200 OK with token

### ✅ Test 2: Get Current User
```
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_TOKEN
```
**Expected:** 200 OK with user profile (no password)

### ✅ Test 3: Verify Token
```
GET http://localhost:8081/api/token/verify
Authorization: Bearer YOUR_TOKEN
```
**Expected:** 200 OK with token info

### ✅ Test 4: Create User (Admin)
```
POST http://localhost:8081/api/admin/users
Authorization: Bearer ADMIN_TOKEN
Body: {"username":"user1","email":"user1@example.com","password":"user123","role":"USER"}
```
**Expected:** 201 Created with user data

### ✅ Test 5: Deactivate User (Admin)
```
PUT http://localhost:8081/api/admin/users/{USER_ID}/status
Authorization: Bearer ADMIN_TOKEN
Body: {"active": false}
```
**Expected:** 200 OK with enabled: false

### ✅ Test 6: Activate User (Admin)
```
PUT http://localhost:8081/api/admin/users/{USER_ID}/status
Authorization: Bearer ADMIN_TOKEN
Body: {"active": true}
```
**Expected:** 200 OK with enabled: true

---

## Common Issues & Fixes

### ❌ Issue 1: "Unauthorized: Invalid or missing token"

**Causes:**
- Token not set in Postman
- Token expired (24 hours)
- Token copied incorrectly

**Fix:**
1. Login again to get fresh token
2. Copy ENTIRE token (very long)
3. Paste in Authorization tab → Bearer Token
4. Make sure no spaces before/after token

### ❌ Issue 2: "Unauthorized: Full authentication is required"

**Cause:** Token not being sent properly

**Fix:**
- Check Authorization tab: Type should be "Bearer Token"
- Or check Headers tab: Should have `Authorization: Bearer TOKEN`
- Make sure there's a space after "Bearer"

### ❌ Issue 3: "Access denied. Insufficient permissions"

**Cause:** User doesn't have ADMIN role

**Fix:**
1. Check your role: `GET /api/users/me`
2. If role is "USER", update to "ADMIN" in MongoDB:
   ```javascript
   db.users.updateOne(
     {username: "admin"},
     {$set: {roles: ["ADMIN"]}}
   )
   ```
3. Login again to get new token with ADMIN role

### ❌ Issue 4: Token Works for Some Endpoints But Not Others

**Cause:** Role-based access control

**Fix:**
- `/api/users/me` - Needs USER or ADMIN role ✅
- `/api/admin/users` - Needs ADMIN role only ⚠️
- `/api/admin/users/{id}/status` - Needs ADMIN role only ⚠️

Make sure you have the correct role for each endpoint.

---

## Visual Guide: Postman Setup

### Correct Setup for GET /api/users/me:

```
┌─────────────────────────────────────────────┐
│ GET http://localhost:8081/api/users/me     │
├─────────────────────────────────────────────┤
│ [Authorization Tab - Selected]              │
│                                             │
│ Type: Bearer Token ▼                        │
│                                             │
│ Token: [eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9│
│        .eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJ│
│        PTEVfQURNSU4iXSwiaWF0IjoxNzA0ODkyOD│
│        AwLCJleHAiOjE3MDQ5NzkyMDB9.signature]│
│                                             │
│ ✅ Token is pasted here                     │
└─────────────────────────────────────────────┘
```

### Correct Setup for PUT /api/admin/users/{id}/status:

```
┌─────────────────────────────────────────────┐
│ PUT http://localhost:8081/api/admin/...    │
├─────────────────────────────────────────────┤
│ [Authorization Tab]                          │
│ Type: Bearer Token                          │
│ Token: [YOUR_ADMIN_TOKEN]                   │
│                                             │
│ [Body Tab]                                  │
│ raw ▼ JSON ▼                                │
│                                             │
│ {                                           │
│   "active": false                           │
│ }                                           │
└─────────────────────────────────────────────┘
```

---

## Quick Fix Steps

1. **Login First:**
   ```
   POST /api/auth/login
   Body: {"username":"admin","password":"admin123"}
   ```

2. **Copy Token:**
   - Copy the ENTIRE token from response
   - It's very long (200+ characters)

3. **Set Token in Postman:**
   - Authorization tab → Bearer Token → Paste token
   - OR Headers tab → `Authorization: Bearer TOKEN`

4. **Test Endpoint:**
   - Make sure URL is correct
   - Make sure method is correct (GET/PUT)
   - Make sure body is JSON (if needed)

5. **Check Response:**
   - If 401: Token issue - login again
   - If 403: Role issue - need ADMIN role
   - If 200: Success! ✅

---

## Using Postman Environment Variables (Advanced)

### Step 1: Create Environment
1. Click "Environments" in left sidebar
2. Click "+" to create new environment
3. Name it "Local Development"
4. Add variable: `token` (leave value empty)
5. Click "Save"

### Step 2: Set Token After Login
In your login request, go to **Tests** tab and add:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
    console.log("Token saved to environment");
}
```

### Step 3: Use Token in Other Requests
In Authorization tab:
- Type: Bearer Token
- Token: `{{token}}` (uses environment variable)

This way, you only need to login once, and all requests will use the token automatically!

---

## Complete Test Sequence

### 1. Register/Login
```
POST /api/auth/login
→ Get token
```

### 2. Verify Token
```
GET /api/token/verify
Authorization: Bearer {{token}}
→ Should return valid: true
```

### 3. Get Profile
```
GET /api/users/me
Authorization: Bearer {{token}}
→ Should return your profile
```

### 4. Create User (if ADMIN)
```
POST /api/admin/users
Authorization: Bearer {{token}}
Body: {"username":"user1","email":"user1@example.com","password":"user123","role":"USER"}
→ Should return 201 Created
```

### 5. Deactivate User (if ADMIN)
```
PUT /api/admin/users/{ID}/status
Authorization: Bearer {{token}}
Body: {"active": false}
→ Should return 200 OK with enabled: false
```

### 6. Activate User (if ADMIN)
```
PUT /api/admin/users/{ID}/status
Authorization: Bearer {{token}}
Body: {"active": true}
→ Should return 200 OK with enabled: true
```

---

## Summary

**The Key Steps:**
1. ✅ Login → Get token
2. ✅ Copy ENTIRE token
3. ✅ Set in Authorization tab (Bearer Token)
4. ✅ Test endpoint
5. ✅ If 401: Login again and get new token
6. ✅ If 403: Update role to ADMIN in MongoDB

**Most Common Mistake:**
- Not copying the complete token (it's very long!)
- Not setting Authorization header properly
- Using expired token

Follow these steps and all endpoints should work! 🎉
