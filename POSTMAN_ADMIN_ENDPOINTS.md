# How to Use Admin Endpoints in Postman

## Problem: 401 Unauthorized Error

You're getting `401 Unauthorized` because:
1. ❌ Missing `Authorization` header with JWT token
2. ❌ Or token is invalid/expired
3. ❌ Or user doesn't have ADMIN role

## Solution: Step-by-Step Guide

### Step 1: Login to Get a Token

First, you need to login (or register) to get a JWT token.

#### Option A: Login (if user exists)
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### Option B: Register (if user doesn't exist)
```
POST http://localhost:8081/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "firstName": "Admin",
  "lastName": "User"
}
```

**Important:** To create users via `/api/admin/users`, you need a user with **ADMIN role**. By default, registered users get USER role. You'll need to either:
- Manually update a user's role in MongoDB to ADMIN, OR
- Create an admin user directly in the database

### Step 2: Copy the Token

From the login/register response, copy the `token` value:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",  ← COPY THIS
    ...
  }
}
```

### Step 3: Add Authorization Header in Postman

1. In your `POST /api/admin/users` request
2. Go to the **"Headers"** tab
3. Add a new header:
   - **Key:** `Authorization`
   - **Value:** `Bearer YOUR_TOKEN_HERE`
   - (Replace `YOUR_TOKEN_HERE` with the actual token from Step 2)

**OR** use the Authorization tab:

1. Click the **"Authorization"** tab
2. Select **Type:** `Bearer Token`
3. Paste your token in the **Token** field

### Step 4: Send the Request

Now your request should work! Make sure:
- ✅ Authorization header is set: `Bearer YOUR_TOKEN`
- ✅ User has ADMIN role
- ✅ Token is not expired

## Complete Example in Postman

### Request Setup:
```
Method: POST
URL: http://localhost:8081/api/admin/users
```

### Headers Tab:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

### Body Tab (raw JSON):
```json
{
  "username": "user1",
  "email": "user1@example.com",
  "password": "user123",
  "role": "USER"
}
```

## Common Issues

### ❌ Issue 1: "Unauthorized: Invalid or missing token"
**Solution:** 
- Add `Authorization: Bearer YOUR_TOKEN` header
- Make sure there's a space after "Bearer"
- Verify token is not expired

### ❌ Issue 2: "Access denied. Insufficient permissions"
**Solution:** 
- Your user needs ADMIN role
- Check user roles: `GET /api/users/me` (with your token)
- If you only have USER role, you need to get ADMIN access

### ❌ Issue 3: Token Expired
**Solution:**
- Login again to get a new token
- Tokens expire after 24 hours

## How to Create an ADMIN User

Since `/api/admin/users` requires ADMIN role, you need to create an admin user first. Here are options:

### Option 1: Update User Role in MongoDB (Recommended)

1. Connect to MongoDB
2. Find your user:
   ```javascript
   db.users.find({username: "admin"})
   ```
3. Update role to ADMIN:
   ```javascript
   db.users.updateOne(
     {username: "admin"},
     {$set: {roles: ["ADMIN"]}}
   )
   ```

### Option 2: Create Admin User Directly in MongoDB

```javascript
db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10$...", // BCrypt hash of "admin123"
  firstName: "Admin",
  lastName: "User",
  roles: ["ADMIN"],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**To generate BCrypt hash:**
- Use online tool: https://bcrypt-generator.com/
- Or use Spring's BCryptPasswordEncoder in a test

### Option 3: Use a Test Script

Create a simple Java test to create an admin user with BCrypt password.

## Quick Test Flow

1. **Login/Register** → Get token
2. **Check your role:** `GET /api/users/me` (with token)
3. **If not ADMIN:** Update role in MongoDB
4. **Login again** → Get new token (with ADMIN role)
5. **Create user:** `POST /api/admin/users` (with ADMIN token)

## Postman Collection Setup

### Create Environment Variables:
1. Go to **Environments** → **Add**
2. Add:
   - `baseUrl` = `http://localhost:8081`
   - `token` = (leave empty, will be set after login)

### Auto-save Token After Login:
In the **Tests** tab of your login request:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
}
```

Then use `{{token}}` in your Authorization header!

## Visual Guide

### Correct Setup:
```
┌─────────────────────────────────────┐
│ POST http://localhost:8081/api/...   │
├─────────────────────────────────────┤
│ Headers:                             │
│   Authorization: Bearer eyJhbGc...  │ ← REQUIRED!
│   Content-Type: application/json     │
├─────────────────────────────────────┤
│ Body (raw JSON):                    │
│   {                                 │
│     "username": "user1",            │
│     "email": "user1@example.com",   │
│     "password": "user123",          │
│     "role": "USER"                  │
│   }                                 │
└─────────────────────────────────────┘
```

### Missing Authorization:
```
┌─────────────────────────────────────┐
│ POST http://localhost:8081/api/...   │
├─────────────────────────────────────┤
│ Headers:                             │
│   Content-Type: application/json     │ ← Missing Authorization!
├─────────────────────────────────────┤
│ Body: ...                            │
└─────────────────────────────────────┘
❌ Result: 401 Unauthorized
```
