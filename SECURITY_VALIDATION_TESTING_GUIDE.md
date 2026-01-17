# Security & Validation Testing Guide

This guide explains how to test the security hardening and validation improvements using Postman.

## Prerequisites

1. **Application Running**: Ensure your Spring Boot application is running on `http://localhost:8081`
2. **MongoDB Running**: Ensure MongoDB is running on `localhost:27017`
3. **Postman Installed**: Have Postman or similar API testing tool ready

---

## 1. SECURITY TESTING

### 1.1 Test Public Endpoints (No Token Required)

#### ✅ Test: Register User
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

---

#### ✅ Test: Login
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "password123"
}
```

**Expected**: 200 OK with JWT token

**Save the token** from the response for subsequent requests.

---

#### ✅ Test: Verify Token (Public)
```
GET http://localhost:8081/api/token/verify
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected**: 200 OK with token details

---

### 1.2 Test Protected Endpoints (Token Required)

#### ✅ Test: Get Current User Profile
```
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected**: 200 OK with user profile (no password)

---

#### ❌ Test: Access Without Token (Should Fail)
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

#### ❌ Test: Access With Invalid Token (Should Fail)
```
GET http://localhost:8081/api/users/me
Authorization: Bearer invalid_token_12345
```

**Expected**: 401 Unauthorized

---

### 1.3 Test Role-Based Access Control (RBAC)

#### Step 1: Create ADMIN User (via MongoDB or existing admin)

If you don't have an admin user, update a user's role in MongoDB:
```javascript
// In MongoDB Compass or mongo shell
db.users.updateOne(
  { username: "testuser" },
  { $set: { roles: ["ADMIN"] } }
)
```

#### Step 2: Login as ADMIN and get token

#### ✅ Test: ADMIN Access to Admin Endpoints
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

#### ❌ Test: USER Access to Admin Endpoints (Should Fail)
```
POST http://localhost:8081/api/admin/users
Authorization: Bearer USER_TOKEN_HERE
Content-Type: application/json

{
  "username": "newuser2",
  "email": "newuser2@example.com",
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

#### ✅ Test: ADMIN Can Delete Deal
```
DELETE http://localhost:8081/api/deals/{dealId}
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Expected**: 200 OK

---

#### ❌ Test: USER Cannot Delete Deal (Should Fail)
```
DELETE http://localhost:8081/api/deals/{dealId}
Authorization: Bearer USER_TOKEN_HERE
```

**Expected**: 403 Forbidden

---

#### ✅ Test: ADMIN Can Update Deal Value
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

#### ❌ Test: USER Cannot Update Deal Value (Should Fail)
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

### 1.4 Test User Account Disabling

#### Step 1: Deactivate User (as ADMIN)
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

#### Step 2: Try to Login with Deactivated User
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

## 2. VALIDATION TESTING

### 2.1 Test Registration Validation

#### ❌ Test: Missing Required Fields
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "username": "",
  "email": "invalid-email",
  "password": "123"
}
```

**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "username": "Username is required",
    "email": "Email should be valid",
    "password": "Password must be at least 6 characters"
  },
  "timestamp": "..."
}
```

---

#### ❌ Test: Username Too Short
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "username": "ab",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "username": "Username must be between 3 and 50 characters"
  }
}
```

---

### 2.2 Test Deal Creation Validation

#### ❌ Test: Missing Required Fields
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

#### ❌ Test: Invalid Deal Stage
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
  "currentStage": "INVALID_STAGE"
}
```

**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "currentStage": "Invalid deal stage. Valid values: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost"
  }
}
```

---

#### ❌ Test: Negative Deal Value
```
POST http://localhost:8081/api/deals
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "dealName": "Test Deal",
  "dealType": "M&A",
  "clientName": "Test Client",
  "sector": "Technology",
  "summary": "Test summary",
  "currentStage": "PROSPECT",
  "dealValue": -1000
}
```

**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "dealValue": "Deal value must be positive"
  }
}
```

---

### 2.3 Test Note Validation

#### ❌ Test: Empty Note Text
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

#### ❌ Test: Note Text Too Long
```
POST http://localhost:8081/api/deals/{dealId}/notes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "noteText": "A".repeat(501)  // 501 characters
}
```

**Expected**: 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "noteText": "Note text must not exceed 500 characters"
  }
}
```

---

### 2.4 Test Update Validation

#### ✅ Test: Partial Update (Valid)
```
PUT http://localhost:8081/api/deals/{dealId}
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "summary": "Updated summary",
  "sector": "Finance"
}
```

**Expected**: 200 OK (only updates provided fields)

---

#### ❌ Test: Invalid Field Values in Update
```
PUT http://localhost:8081/api/deals/{dealId}
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "dealName": "",  // Empty string
  "dealValue": -1000  // Negative value
}
```

**Expected**: 400 Bad Request with field-level errors

---

## 3. COMPREHENSIVE TEST SCENARIOS

### Scenario 1: Complete User Flow

1. **Register** → Get token
2. **Login** → Get new token
3. **Get Profile** → Verify user data (no password)
4. **Create Deal** → Verify deal created
5. **Get Deal** → Verify deal details
6. **Update Deal** → Verify update works
7. **Add Note** → Verify note added

---

### Scenario 2: Admin Privileges Test

1. **Login as ADMIN** → Get admin token
2. **Create User** → Verify user created
3. **List All Users** → Verify all users returned
4. **Deactivate User** → Verify user disabled
5. **Try Login as Deactivated User** → Should fail
6. **Activate User** → Verify user enabled
7. **Try Login Again** → Should succeed

---

### Scenario 3: Security Boundary Tests

1. **Access Protected Endpoint Without Token** → 401
2. **Access Protected Endpoint With Invalid Token** → 401
3. **Access Admin Endpoint as USER** → 403
4. **Access Admin Endpoint as ADMIN** → 200
5. **Update Deal Value as USER** → 403
6. **Update Deal Value as ADMIN** → 200
7. **Delete Deal as USER** → 403
8. **Delete Deal as ADMIN** → 200

---

## 4. POSTMAN COLLECTION SETUP

### Environment Variables

Create a Postman environment with:
- `baseUrl`: `http://localhost:8081`
- `userToken`: (set after login)
- `adminToken`: (set after admin login)
- `dealId`: (set after creating a deal)
- `userId`: (set after creating a user)

### Pre-request Scripts

For protected endpoints, add:
```javascript
pm.request.headers.add({
    key: 'Authorization',
    value: 'Bearer ' + pm.environment.get('userToken')
});
```

### Tests Scripts

After login, save token:
```javascript
var jsonData = pm.response.json();
if (jsonData.success && jsonData.data.token) {
    pm.environment.set("userToken", jsonData.data.token);
}
```

---

## 5. EXPECTED RESPONSE FORMATS

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2024-01-15T10:30:00"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "timestamp": "2024-01-15T10:30:00"
}
```

### Validation Error Response
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

## 6. QUICK TEST CHECKLIST

- [ ] Public endpoints work without token
- [ ] Protected endpoints require token
- [ ] Invalid token returns 401
- [ ] Missing token returns 401
- [ ] USER cannot access admin endpoints (403)
- [ ] ADMIN can access admin endpoints (200)
- [ ] Deactivated user cannot login
- [ ] Registration validation works
- [ ] Login validation works
- [ ] Deal creation validation works
- [ ] Deal update validation works
- [ ] Note validation works
- [ ] All responses use ApiResponse format
- [ ] Field-level validation errors are clear
- [ ] Enum validation works
- [ ] Size constraints work
- [ ] Positive number validation works

---

## 7. TROUBLESHOOTING

### Issue: 401 Unauthorized on all requests
**Solution**: Check token is valid and not expired. Re-login to get new token.

### Issue: 403 Forbidden on admin endpoints
**Solution**: Verify user has ADMIN role in MongoDB. Re-login after role change.

### Issue: Validation errors not showing field names
**Solution**: Check GlobalExceptionHandler is handling MethodArgumentNotValidException correctly.

### Issue: Stack traces in error responses
**Solution**: Verify GenericExceptionHandler doesn't expose stack traces (should only log internally).

---

## Summary

All security and validation improvements have been implemented:

✅ **Security**:
- Public endpoints properly configured
- Protected endpoints require authentication
- Role-based access control enforced
- User account disabling prevents login
- Stateless session management
- CSRF disabled for REST API

✅ **Validation**:
- All DTOs have proper validation annotations
- Field-level error messages
- Enum validation
- Size constraints
- Positive number validation

✅ **Error Handling**:
- Consistent ApiResponse format
- Clear error messages
- No stack trace exposure
- Proper HTTP status codes

Your backend is now production-ready for frontend integration! 🚀
