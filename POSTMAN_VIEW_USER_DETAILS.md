# How to View User Details in Postman

## Option 1: View Your Own Profile (USER and ADMIN)

### Endpoint: GET /api/users/me

This endpoint returns **your own** user profile (the logged-in user).

#### Setup in Postman:

**Request:**
```
Method: GET
URL: http://localhost:8081/api/users/me
```

**Authorization Tab:**
- Type: `Bearer Token`
- Token: Paste your token

**OR Headers Tab:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

#### Expected Response (200 OK):
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
  },
  "timestamp": "2026-01-10T12:40:00"
}
```

**Note:** Password is **NOT** included in the response (for security).

---

## Option 2: View All Users (ADMIN Only)

### Endpoint: GET /api/admin/users

This endpoint returns **all users** in the system (ADMIN only).

#### Setup in Postman:

**Request:**
```
Method: GET
URL: http://localhost:8081/api/admin/users
```

**Authorization Tab:**
- Type: `Bearer Token`
- Token: Paste your **ADMIN** token

#### Expected Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "6961e86c55d8af06a512f241",
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "roles": ["ADMIN"],
      "enabled": true,
      "createdAt": "2026-01-10T05:49:31.330+00:00",
      "updatedAt": "2026-01-10T05:49:31.330+00:00"
    },
    {
      "id": "6961f86dbae5b5270438c700",
      "username": "user1",
      "email": "user1@example.com",
      "firstName": "User",
      "lastName": "One",
      "roles": ["USER"],
      "enabled": true,
      "createdAt": "2026-01-10T12:00:00",
      "updatedAt": "2026-01-10T12:00:00"
    }
  ],
  "timestamp": "2026-01-10T12:40:00"
}
```

---

## Option 3: View Specific User by ID (ADMIN Only)

### Endpoint: GET /api/admin/users/{id}

This endpoint returns a **specific user** by their ID (ADMIN only).

#### Setup in Postman:

**Request:**
```
Method: GET
URL: http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241
```
(Replace with actual user ID)

**Authorization Tab:**
- Type: `Bearer Token`
- Token: Paste your **ADMIN** token

#### Expected Response (200 OK):
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
  },
  "timestamp": "2026-01-10T12:40:00"
}
```

---

## Quick Steps:

1. **Login** to get token:
   ```
   POST http://localhost:8081/api/auth/login
   Body: {"username":"admin","password":"admin123"}
   ```
   → Copy token

2. **View Your Profile:**
   ```
   GET http://localhost:8081/api/users/me
   Authorization: Bearer YOUR_TOKEN
   ```

3. **Response shows:**
   - Your user ID
   - Username
   - Email
   - First name, Last name
   - Roles (USER or ADMIN)
   - Enabled status
   - Created/Updated timestamps

---

## What Information You'll See:

✅ **Included:**
- User ID
- Username
- Email
- First name
- Last name
- Roles
- Enabled status (active/inactive)
- Created date
- Updated date

❌ **NOT Included:**
- Password (never returned for security)

---

## Use Cases:

1. **Check Your Role:** See if you're USER or ADMIN
2. **Get Your User ID:** Use it for other operations
3. **Verify Account Status:** Check if account is enabled
4. **View Profile Info:** See your account details

Try it now in Postman! 🚀
