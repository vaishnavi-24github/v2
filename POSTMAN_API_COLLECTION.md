# Postman API Collection - Deal Pipeline Portal

**Base URL:** `http://localhost:8081/api`

---

## 🔐 Authentication APIs (Public)

### 1. Register User
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/auth/register`
- **Auth:** None (Public)
- **Body (JSON):**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```
- **Response:** Returns JWT token in `data.token`

### 2. Login
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/auth/login`
- **Auth:** None (Public)
- **Body (JSON):**
```json
{
  "username": "john_doe",
  "password": "password123"
}
```
- **Response:** Returns JWT token in `data.token`

---

## 🔑 Token Management APIs

### 3. Verify Token
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/token/verify`
- **Auth:** Bearer Token (Header: `Authorization: Bearer <token>`)
- **Response:** Token validation info

### 4. Get Current User Info
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/token/me`
- **Auth:** Bearer Token
- **Response:** Current authenticated user info

### 5. Decode Token
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/token/decode`
- **Auth:** None
- **Body (JSON):**
```json
{
  "token": "your_jwt_token_here"
}
```

---

## 👤 User APIs (Protected)

### 6. Get Current User Profile
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/users/me`
- **Auth:** Bearer Token (USER/ADMIN)
- **Response:** Current user profile

---

## 👥 Admin User Management APIs (ADMIN Only)

### 7. Create User (ADMIN)
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/admin/users`
- **Auth:** Bearer Token (ADMIN only)
- **Body (JSON):**
```json
{
  "username": "new_user",
  "email": "newuser@example.com",
  "password": "password123",
  "role": "USER"
}
```
- **Note:** `role` can be `USER` or `ADMIN`

### 8. Get All Users (ADMIN)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/admin/users`
- **Auth:** Bearer Token (ADMIN only)
- **Response:** List of all users

### 9. Get User by ID (ADMIN)
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/admin/users/{id}`
- **Auth:** Bearer Token (ADMIN only)
- **Example:** `http://localhost:8081/api/admin/users/507f1f77bcf86cd799439011`

### 10. Update User Status (ADMIN)
- **Method:** `PUT`
- **URL:** `http://localhost:8081/api/admin/users/{id}/status`
- **Auth:** Bearer Token (ADMIN only)
- **Body (JSON):**
```json
{
  "active": true
}
```
- **Note:** Set `active: false` to deactivate user

---

## 💼 Deal Management APIs

### 11. Create Deal
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/deals`
- **Auth:** Bearer Token (USER/ADMIN)
- **Body (JSON):**
```json
{
  "dealName": "Tech Corp Acquisition",
  "dealType": "M&A",
  "clientName": "Tech Corp Inc",
  "summary": "Acquisition of Tech Corp by Mega Corp",
  "sector": "Technology",
  "currentStage": "Prospect",
  "currency": "USD",
  "description": "Full acquisition deal",
  "dealValue": 1000000
}
```
- **Note:** `dealValue` is optional. USER cannot set it (ADMIN only)
- **DealStage values:** `Prospect`, `UnderEvaluation`, `TermSheetSubmitted`, `Closed`, `Lost`

### 12. Get All Deals
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/deals`
- **Auth:** Bearer Token (USER/ADMIN)
- **Query Parameters (all optional):**
  - `stage` - Filter by stage (e.g., `stage=Prospect`)
  - `sector` - Filter by sector (e.g., `sector=Technology`)
  - `dealType` - Filter by deal type (e.g., `dealType=M&A`)
- **Examples:**
  - `http://localhost:8081/api/deals`
  - `http://localhost:8081/api/deals?stage=Prospect`
  - `http://localhost:8081/api/deals?sector=Technology&dealType=M&A`

### 13. Get Deal by ID
- **Method:** `GET`
- **URL:** `http://localhost:8081/api/deals/{id}`
- **Auth:** Bearer Token (USER/ADMIN)
- **Example:** `http://localhost:8081/api/deals/507f1f77bcf86cd799439011`

### 14. Update Deal
- **Method:** `PUT`
- **URL:** `http://localhost:8081/api/deals/{id}`
- **Auth:** Bearer Token (USER/ADMIN)
- **Body (JSON) - All fields optional:**
```json
{
  "dealName": "Updated Deal Name",
  "dealType": "IPO",
  "summary": "Updated summary",
  "sector": "Finance",
  "currentStage": "UnderEvaluation",
  "description": "Updated description",
  "dealValue": 2000000
}
```
- **Note:** USER cannot update `dealValue` (ADMIN only)

### 15. Update Deal Stage
- **Method:** `PATCH`
- **URL:** `http://localhost:8081/api/deals/{id}/stage`
- **Auth:** Bearer Token (USER/ADMIN)
- **Body (JSON):**
```json
{
  "stage": "Closed"
}
```
- **Valid stages:** `Prospect`, `UnderEvaluation`, `TermSheetSubmitted`, `Closed`, `Lost`

### 16. Update Deal Value (ADMIN Only)
- **Method:** `PATCH`
- **URL:** `http://localhost:8081/api/deals/{id}/value`
- **Auth:** Bearer Token (ADMIN only)
- **Body (JSON):**
```json
{
  "dealValue": 5000000
}
```

### 17. Add Note to Deal
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/deals/{id}/notes`
- **Auth:** Bearer Token (USER/ADMIN)
- **Body (JSON):**
```json
{
  "noteText": "Client requested additional information about valuation"
}
```

### 18. Delete Deal (ADMIN Only)
- **Method:** `DELETE`
- **URL:** `http://localhost:8081/api/deals/{id}`
- **Auth:** Bearer Token (ADMIN only)
- **Response:** Success message

---

## 📋 Postman Setup Instructions

### Step 1: Set Base URL Variable
1. Create a new environment in Postman
2. Add variable: `baseUrl` = `http://localhost:8081/api`
3. Use `{{baseUrl}}` in requests

### Step 2: Get Authentication Token
1. Call **POST** `/api/auth/login` or `/api/auth/register`
2. Copy the `token` from response: `data.token`
3. Set as environment variable: `token`

### Step 3: Set Authorization Header
1. Go to **Authorization** tab
2. Type: **Bearer Token**
3. Token: `{{token}}`
4. Or manually: Header `Authorization` = `Bearer {{token}}`

### Step 4: Test Protected Endpoints
- All endpoints except `/api/auth/*` require Bearer token
- Admin endpoints require ADMIN role

---

## 🔒 Role-Based Access

| Endpoint | USER | ADMIN |
|----------|------|-------|
| `/api/auth/*` | ✅ | ✅ |
| `/api/token/*` | ✅ | ✅ |
| `/api/users/me` | ✅ | ✅ |
| `/api/admin/users/*` | ❌ | ✅ |
| `/api/deals` (GET) | ✅* | ✅ |
| `/api/deals` (POST) | ✅** | ✅ |
| `/api/deals/{id}` | ✅* | ✅ |
| `/api/deals/{id}` (PUT) | ✅* | ✅ |
| `/api/deals/{id}/stage` | ✅* | ✅ |
| `/api/deals/{id}/value` | ❌ | ✅ |
| `/api/deals/{id}/notes` | ✅* | ✅ |
| `/api/deals/{id}` (DELETE) | ❌ | ✅ |

*USER can only access their own deals
**USER cannot set dealValue

---

## 📝 Example Request Bodies

### Register Request
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "firstName": "Test",
  "lastName": "User"
}
```

### Login Request
```json
{
  "username": "testuser",
  "password": "password123"
}
```

### Create Deal Request
```json
{
  "dealName": "Acme Corp Acquisition",
  "dealType": "M&A",
  "clientName": "Acme Corporation",
  "summary": "Strategic acquisition of Acme Corp",
  "sector": "Technology",
  "currentStage": "Prospect",
  "currency": "USD",
  "description": "Full company acquisition",
  "dealValue": 5000000
}
```

### Update Deal Stage Request
```json
{
  "stage": "UnderEvaluation"
}
```

### Add Note Request
```json
{
  "noteText": "Meeting scheduled with client next week"
}
```

### Update User Status Request
```json
{
  "active": false
}
```

---

## 🚀 Quick Test Flow

1. **Register/Login** → Get token
2. **Verify Token** → Confirm token works
3. **Get Current User** → Check user profile
4. **Create Deal** → Add a new deal
5. **Get All Deals** → List deals
6. **Update Deal Stage** → Change stage
7. **Add Note** → Add note to deal

---

## ⚠️ Common Issues

### 401 Unauthorized
- Token missing or expired
- Solution: Re-login to get new token

### 403 Forbidden
- User doesn't have required role (ADMIN)
- Solution: Use ADMIN account

### 400 Bad Request
- Invalid request body
- Missing required fields
- Invalid enum values (e.g., wrong DealStage)

### 404 Not Found
- Invalid ID
- Resource doesn't exist

---

## 📌 Important Notes

1. **JWT Token Expiration:** 24 hours (86400000 ms)
2. **DealStage Values:** Must be exact: `Prospect`, `UnderEvaluation`, `TermSheetSubmitted`, `Closed`, `Lost`
3. **DealValue:** Only ADMIN can set/update
4. **User Ownership:** USER can only see/update their own deals
5. **Password:** Minimum 6 characters
6. **Username:** 3-50 characters

---

**Total APIs: 18 endpoints**
