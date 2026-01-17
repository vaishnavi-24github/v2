# Postman Security & Validation Testing Checklist

## 🚀 Quick Start Testing Guide

### Step 1: Test Public Endpoints (No Token Required)

#### ✅ 1. Register a New User
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```
**Expected**: 201 Created with JWT token  
**Save the token** from `data.token` for next steps!

---

#### ✅ 2. Login
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```
**Expected**: 200 OK with JWT token  
**Save this token** too!

---

#### ✅ 3. Verify Token (Public Endpoint)
```
GET http://localhost:8081/api/token/verify
Authorization: Bearer YOUR_TOKEN_HERE
```
**Expected**: 200 OK with token details (username, roles, expiration)

---

### Step 2: Test Protected Endpoints (Token Required)

#### ✅ 4. Get Current User Profile
```
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_TOKEN_HERE
```
**Expected**: 200 OK with user profile (NO password in response)

---

#### ❌ 5. Access Without Token (Should Fail)
```
GET http://localhost:8081/api/users/me
(No Authorization header)
```
**Expected**: 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized: Invalid or missing token",
  "timestamp": "..."
}
```

---

#### ❌ 6. Access With Invalid Token (Should Fail)
```
GET http://localhost:8081/api/users/me
Authorization: Bearer invalid_token_12345
```
**Expected**: 401 Unauthorized

---

### Step 3: Test Validation

#### ❌ 7. Register with Invalid Data
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "username": "ab",  // Too short (min 3)
  "email": "invalid-email",  // Invalid email
  "password": "123"  // Too short (min 6)
}
```
**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "username": "Username must be between 3 and 50 characters",
    "email": "Email should be valid",
    "password": "Password must be at least 6 characters"
  },
  "timestamp": "..."
}
```

---

#### ❌ 8. Create Deal with Missing Required Fields
```
POST http://localhost:8081/api/deals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "dealName": "",
  "dealType": "",
  "clientName": "",
  "sector": "",
  "summary": ""
}
```
**Expected**: 400 Bad Request with field-level errors

---

#### ✅ 9. Create Deal with Valid Data
```
POST http://localhost:8081/api/deals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "dealName": "Tech Acquisition Deal",
  "dealType": "M&A",
  "clientName": "Tech Corp",
  "sector": "Technology",
  "summary": "Acquisition of Tech Corp by Big Corp",
  "currentStage": "PROSPECT"
}
```
**Expected**: 201 Created  
**Save the deal ID** from response!

---

#### ❌ 10. Create Deal with Invalid Stage
```
POST http://localhost:8081/api/deals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "dealName": "Test Deal",
  "dealType": "M&A",
  "clientName": "Test Client",
  "sector": "Technology",
  "summary": "Test summary",
  "currentStage": "INVALID_STAGE"  // Invalid enum value
}
```
**Expected**: 400 Bad Request

---

#### ❌ 11. Add Note with Empty Text
```
POST http://localhost:8081/api/deals/{dealId}/notes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "noteText": ""
}
```
**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "noteText": "Note text is required"
  }
}
```

---

### Step 4: Test Role-Based Access Control (RBAC)

#### ⚠️ First: Create ADMIN User

**Option A: Update existing user in MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017/deal_pipeline_db`
3. Go to `users` collection
4. Find your user document
5. Update `roles` field: Change `["USER"]` to `["ADMIN"]`
6. Save the document

**Option B: Use existing admin user (if you have one)**

---

#### ✅ 12. Login as ADMIN
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin_user",
  "password": "password123"
}
```
**Save the ADMIN token!**

---

#### ✅ 13. ADMIN Can Create User
```
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
**Expected**: 201 Created

---

#### ❌ 14. USER Cannot Access Admin Endpoints (Should Fail)
```
POST http://localhost:8081/api/admin/users
Authorization: Bearer USER_TOKEN_HERE  // Regular user token
Content-Type: application/json

{
  "username": "testuser2",
  "email": "test2@example.com",
  "password": "password123",
  "role": "USER"
}
```
**Expected**: 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions.",
  "timestamp": "..."
}
```

---

#### ✅ 15. ADMIN Can Update Deal Value
```
PATCH http://localhost:8081/api/deals/{dealId}/value
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "dealValue": 1000000.00
}
```
**Expected**: 200 OK

---

#### ❌ 16. USER Cannot Update Deal Value (Should Fail)
```
PATCH http://localhost:8081/api/deals/{dealId}/value
Authorization: Bearer USER_TOKEN_HERE
Content-Type: application/json

{
  "dealValue": 1000000.00
}
```
**Expected**: 403 Forbidden

---

#### ✅ 17. ADMIN Can Delete Deal
```
DELETE http://localhost:8081/api/deals/{dealId}
Authorization: Bearer ADMIN_TOKEN_HERE
```
**Expected**: 200 OK

---

#### ❌ 18. USER Cannot Delete Deal (Should Fail)
```
DELETE http://localhost:8081/api/deals/{dealId}
Authorization: Bearer USER_TOKEN_HERE
```
**Expected**: 403 Forbidden

---

### Step 5: Test User Account Disabling

#### ✅ 19. ADMIN Deactivates User
```
PUT http://localhost:8081/api/admin/users/{userId}/status
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "active": false
}
```
**Expected**: 200 OK

---

#### ❌ 20. Deactivated User Cannot Login
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "deactivated_user",
  "password": "password123"
}
```
**Expected**: 400 Bad Request or 401 Unauthorized
```json
{
  "success": false,
  "message": "User account is disabled. Please contact administrator.",
  "timestamp": "..."
}
```

---

#### ✅ 21. ADMIN Reactivates User
```
PUT http://localhost:8081/api/admin/users/{userId}/status
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "active": true
}
```
**Expected**: 200 OK

---

#### ✅ 22. User Can Login Again
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "reactivated_user",
  "password": "password123"
}
```
**Expected**: 200 OK with token

---

### Step 6: Test Response Format

#### ✅ 23. Check All Responses Use ApiResponse Format

**Success Response Example:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00"
}
```

**Error Response Example:**
```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2024-01-15T10:30:00"
}
```

**Validation Error Response Example:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "field1": "Error message 1",
    "field2": "Error message 2"
  },
  "timestamp": "2024-01-15T10:30:00"
}
```

---

## 📋 Quick Checklist

### Security Tests
- [ ] Public endpoints work without token
- [ ] Protected endpoints require token (401 without token)
- [ ] Invalid token returns 401
- [ ] USER cannot access admin endpoints (403)
- [ ] ADMIN can access admin endpoints (200)
- [ ] Deactivated user cannot login
- [ ] Reactivated user can login

### Validation Tests
- [ ] Registration validation works (field errors)
- [ ] Login validation works
- [ ] Deal creation validation works
- [ ] Deal update validation works
- [ ] Note validation works (max 500 chars)
- [ ] Enum validation works (invalid stage rejected)
- [ ] Size constraints work (username min 3, etc.)

### Response Format Tests
- [ ] All success responses have `success: true`
- [ ] All error responses have `success: false`
- [ ] All responses have `timestamp`
- [ ] Validation errors have `data` with field errors
- [ ] No stack traces in error responses

---

## 🎯 Postman Environment Variables

Create these variables in Postman:
- `baseUrl`: `http://localhost:8081`
- `userToken`: (set after login)
- `adminToken`: (set after admin login)
- `dealId`: (set after creating deal)
- `userId`: (set after creating user)

### Auto-Save Token Script (Postman Tests Tab)

After login requests, add this in the **Tests** tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.success && jsonData.data && jsonData.data.token) {
        pm.environment.set("userToken", jsonData.data.token);
        console.log("Token saved to environment");
    }
}
```

---

## 🔧 Troubleshooting

### Issue: 401 Unauthorized on all requests
**Fix**: Check token is valid. Re-login to get new token.

### Issue: 403 Forbidden on admin endpoints
**Fix**: Verify user has ADMIN role in MongoDB. Re-login after role change.

### Issue: Validation errors not showing field names
**Fix**: Check request has `Content-Type: application/json` header.

### Issue: Can't login after deactivation
**Fix**: This is correct behavior! Reactivate user via admin endpoint.

---

## ✅ Success Criteria

Your backend is working correctly if:
1. ✅ All public endpoints work without token
2. ✅ All protected endpoints require valid token
3. ✅ Invalid/missing tokens return 401
4. ✅ USER role gets 403 on admin endpoints
5. ✅ ADMIN role can access all endpoints
6. ✅ Deactivated users cannot login
7. ✅ Validation errors show field-level messages
8. ✅ All responses use ApiResponse format
9. ✅ No stack traces in error responses

**If all tests pass, your security and validation are production-ready! 🚀**
