# Complete API Testing Guide - All Endpoints

**Base URL:** `http://localhost:8081`

---

## 🔑 Authentication (No Token Required)

### 1. Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** Returns JWT token (automatically logs in after registration)

---

### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response:** Returns JWT token
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin",
    "roles": ["ADMIN"]
  }
}
```

**⚠️ IMPORTANT:** Copy the `token` from response and use it in all subsequent requests!

---

## 👤 User Profile (Requires Token)

### 3. Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Access:** USER, ADMIN  
**Response:** Returns current logged-in user profile (password NOT included)

---

## 🎯 Deal Management (Requires Token)

### 4. Create New Deal
```http
POST /api/deals
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "dealName": "TechCorp Acquisition",
  "dealType": "M&A",
  "clientName": "ABC Corp",
  "sector": "Technology",
  "summary": "Strategic acquisition",
  "description": "Detailed description here",
  "currentStage": "Prospect",
  "currency": "USD",
  "expectedCloseDate": "2024-12-31T00:00:00"
}
```

**Access:** USER, ADMIN  
**Note:** USER cannot set `dealValue` (ADMIN only)  
**Response:** Returns created deal with ID (save this ID for other requests!)

---

### 5. List All Deals
```http
GET /api/deals
Authorization: Bearer YOUR_TOKEN_HERE
```

**Access:** 
- USER: sees only their deals
- ADMIN: sees all deals

**With Filters (Optional):**
```http
GET /api/deals?stage=Prospect&sector=Technology&dealType=M&A
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters:**
- `stage` - Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost
- `sector` - Any sector name
- `dealType` - M&A, IPO, Debt, etc.

---

### 6. Get Deal by ID
```http
GET /api/deals/{DEAL_ID}
Authorization: Bearer YOUR_TOKEN_HERE
```

**Access:** USER (own deals only), ADMIN (all deals)  
**Example:** `GET /api/deals/507f1f77bcf86cd799439011`

---

### 7. Update Deal
```http
PUT /api/deals/{DEAL_ID}
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "summary": "Updated summary",
  "sector": "Finance",
  "dealType": "IPO",
  "description": "Updated description",
  "dealName": "Updated Deal Name"
}
```

**Access:** USER (own deals), ADMIN (all deals)  
**Note:** USER cannot update `dealValue` (ADMIN only)

---

### 8. Update Deal Stage
```http
PATCH /api/deals/{DEAL_ID}/stage
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "stage": "UnderEvaluation"
}
```

**Access:** USER (own deals), ADMIN (all deals)  
**Valid Stages:** `Prospect`, `UnderEvaluation`, `TermSheetSubmitted`, `Closed`, `Lost`

---

### 9. Update Deal Value (ADMIN ONLY)
```http
PATCH /api/deals/{DEAL_ID}/value
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "dealValue": 150000000
}
```

**Access:** ADMIN only  
**Note:** USER role will get 403 Forbidden

---

### 10. Add Note to Deal
```http
POST /api/deals/{DEAL_ID}/notes
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "noteText": "Client meeting scheduled for next week"
}
```

**Access:** USER (own deals), ADMIN (all deals)

---

### 11. Delete Deal (ADMIN ONLY)
```http
DELETE /api/deals/{DEAL_ID}
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Access:** ADMIN only  
**Note:** USER role will get 403 Forbidden

---

## 👥 Admin User Management (ADMIN ONLY - Requires Token)

### 12. Create New User (ADMIN)
```http
POST /api/admin/users
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "username": "newuser",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER"
}
```

**Access:** ADMIN only  
**Roles:** `USER` or `ADMIN`  
**Note:** Password is automatically BCrypt-hashed

---

### 13. List All Users (ADMIN)
```http
GET /api/admin/users
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Access:** ADMIN only  
**Response:** Returns all users (passwords NOT included)

---

### 14. Get User by ID (ADMIN)
```http
GET /api/admin/users/{USER_ID}
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Access:** ADMIN only  
**Example:** `GET /api/admin/users/507f1f77bcf86cd799439011`  
**Response:** Returns user profile (password NOT included)

---

### 15. Activate/Deactivate User (ADMIN)
```http
PUT /api/admin/users/{USER_ID}/status
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "active": false
}
```

**Access:** ADMIN only  
**Note:** Deactivated users cannot login

---

## 🔐 Token Management (Optional - For Testing)

### 16. Verify Token
```http
GET /api/token/verify
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:** Returns token information (username, roles, expiration, etc.)

---

### 17. Get Current User from Token
```http
GET /api/token/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:** Returns authenticated user info from SecurityContext

---

### 18. Decode Token (Without Validation)
```http
POST /api/token/decode
Content-Type: application/json

{
  "token": "YOUR_TOKEN_HERE"
}
```

**Response:** Returns decoded token info (for testing only)

---

## 📋 Quick Testing Checklist

### Setup:
1. ✅ Start MongoDB: `docker run -d -p 27017:27017 --name mongodb-local mongo:7`
2. ✅ Start backend: `.\mvnw.cmd spring-boot:run`
3. ✅ Wait for: `Started DealPipelineApplication`

### Test Flow:
1. ✅ **Register** → Get token (or use existing admin: `admin`/`admin123`)
2. ✅ **Login** → Get token (if not registered)
3. ✅ **Get Current User** (`/api/users/me`) → Verify authentication
4. ✅ **Create Deal** → Save the deal ID
5. ✅ **List Deals** → Verify deal appears
6. ✅ **Get Deal by ID** → Verify deal details
7. ✅ **Update Deal Stage** → Change stage
8. ✅ **Add Note** → Add a note to deal
9. ✅ **Update Deal** → Modify deal fields
10. ✅ **List All Users (ADMIN)** → Verify admin access
11. ✅ **Create User (ADMIN)** → Create new user
12. ✅ **Update Deal Value (ADMIN)** → Set deal value
13. ✅ **Delete Deal (ADMIN)** → Delete deal

---

## 🎯 Postman Collection Setup

### Environment Variables:
1. Create new Environment in Postman
2. Add variables:
   - `baseUrl` = `http://localhost:8081`
   - `token` = (will be set after login)
   - `dealId` = (will be set after creating deal)
   - `userId` = (will be set after getting user)

### Example Request:
```
GET {{baseUrl}}/api/deals
Authorization: Bearer {{token}}
```

---

## ⚠️ Important Notes

1. **Authentication Required:** Most endpoints require `Authorization: Bearer <token>` header
2. **Token Expiration:** Default 24 hours (can be changed in `application.yml`)
3. **Role-Based Access:**
   - `USER`: Can only see/modify their own deals
   - `ADMIN`: Can see/modify all deals, manage users, set deal values
4. **Deal Value:** Only ADMIN can view/set `dealValue` field
5. **Password Security:** Passwords are never returned in responses
6. **Error Handling:** All errors return JSON with `success: false` and `message`

---

## 🚨 Common Errors

### 401 Unauthorized
- Token missing or invalid
- Token expired
- Solution: Login again to get new token

### 403 Forbidden
- Insufficient permissions (e.g., USER trying to access ADMIN endpoint)
- Solution: Use ADMIN token

### 404 Not Found
- Resource doesn't exist (wrong ID)
- Solution: Check the ID is correct

### 400 Bad Request
- Validation errors (missing required fields, invalid format)
- Solution: Check request body matches schema

---

## 📝 Default Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`
- Role: `ADMIN`

**Note:** If these don't work, you may need to register first or check your database.

---

**All APIs are ready to test!** 🎉
