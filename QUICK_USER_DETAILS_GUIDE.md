# Quick Guide: How to View User Details in Postman

## 🎯 Three Ways to View User Details

### 1. View Your Own Profile (USER and ADMIN)

**Endpoint:** `GET /api/users/me`

**In Postman:**
```
Method: GET
URL: http://localhost:8081/api/users/me
Authorization: Bearer YOUR_TOKEN
```

**What you get:**
- Your user ID
- Username, email, name
- Your roles (USER/ADMIN)
- Account status (enabled/disabled)
- Created/updated dates

---

### 2. View All Users (ADMIN Only)

**Endpoint:** `GET /api/admin/users`

**In Postman:**
```
Method: GET
URL: http://localhost:8081/api/admin/users
Authorization: Bearer ADMIN_TOKEN
```

**What you get:**
- List of ALL users in the system
- Each user's profile (without passwords)

---

### 3. View Specific User by ID (ADMIN Only)

**Endpoint:** `GET /api/admin/users/{id}`

**In Postman:**
```
Method: GET
URL: http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241
Authorization: Bearer ADMIN_TOKEN
```

**What you get:**
- Specific user's profile by ID
- All user details (without password)

---

## 📋 Step-by-Step: View Your Profile

### Step 1: Login
```
POST http://localhost:8081/api/auth/login
Body: {"username":"admin","password":"admin123"}
```
→ Copy token

### Step 2: View Your Profile
```
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_TOKEN
```

### Step 3: See Response
```json
{
  "success": true,
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ADMIN"],
    "enabled": true,
    ...
  }
}
```

---

## 📋 Step-by-Step: View All Users (ADMIN)

### Step 1: Login as ADMIN
```
POST http://localhost:8081/api/auth/login
Body: {"username":"admin","password":"admin123"}
```
→ Copy ADMIN token

### Step 2: List All Users
```
GET http://localhost:8081/api/admin/users
Authorization: Bearer ADMIN_TOKEN
```

### Step 3: See Response
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "username": "admin",
      "roles": ["ADMIN"],
      ...
    },
    {
      "id": "...",
      "username": "user1",
      "roles": ["USER"],
      ...
    }
  ]
}
```

---

## 📋 Step-by-Step: View Specific User (ADMIN)

### Step 1: Get User ID
- From MongoDB Compass, or
- From GET /api/admin/users response, or
- From GET /api/users/me response

### Step 2: View User
```
GET http://localhost:8081/api/admin/users/{USER_ID}
Authorization: Bearer ADMIN_TOKEN
```

### Step 3: See Response
```json
{
  "success": true,
  "data": {
    "id": "...",
    "username": "user1",
    "email": "user1@example.com",
    "roles": ["USER"],
    "enabled": true,
    ...
  }
}
```

---

## ✅ Quick Checklist

**For Your Own Profile:**
- ✅ Use: `GET /api/users/me`
- ✅ Need: Any valid token (USER or ADMIN)
- ✅ Shows: Your own details

**For All Users:**
- ✅ Use: `GET /api/admin/users`
- ✅ Need: ADMIN token
- ✅ Shows: All users in system

**For Specific User:**
- ✅ Use: `GET /api/admin/users/{id}`
- ✅ Need: ADMIN token + User ID
- ✅ Shows: Specific user details

---

## 🔍 What Information is Returned?

✅ **Included:**
- User ID
- Username
- Email
- First name
- Last name
- Roles (USER/ADMIN)
- Enabled status (true/false)
- Created date
- Updated date

❌ **NOT Included:**
- Password (never returned for security)

---

## 🎯 Common Use Cases

1. **Check Your Role:**
   ```
   GET /api/users/me
   ```
   → See if you're USER or ADMIN

2. **Get Your User ID:**
   ```
   GET /api/users/me
   ```
   → Copy `id` from response

3. **List All Users (Admin):**
   ```
   GET /api/admin/users
   ```
   → See all users in system

4. **View Specific User (Admin):**
   ```
   GET /api/admin/users/{id}
   ```
   → View any user's details

---

## 📝 Postman Setup

### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

### That's it! No body needed for GET requests.

Try it now! 🚀
