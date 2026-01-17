# How to Create an ADMIN User

Since `/api/admin/users` requires ADMIN role, you need an admin user first. Here's how:

## Method 1: Update Existing User to ADMIN (Easiest)

### Step 1: Register a User
```http
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

### Step 2: Connect to MongoDB
Open MongoDB Compass or MongoDB shell:
```bash
mongosh
# or
mongo
```

### Step 3: Update User Role
```javascript
use deal_pipeline_db

db.users.updateOne(
  {username: "admin"},
  {$set: {roles: ["ADMIN"]}}
)
```

### Step 4: Verify
```javascript
db.users.findOne({username: "admin"})
```

You should see:
```json
{
  "username": "admin",
  "roles": ["ADMIN"],  ← Should be ADMIN
  ...
}
```

### Step 5: Login Again
Now login with the same credentials - you'll get a token with ADMIN role:
```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Step 6: Use Admin Endpoints
Now you can use `/api/admin/users` with the token from login!

---

## Method 2: Create Admin User Directly in MongoDB

### Step 1: Generate BCrypt Hash
Go to: https://bcrypt-generator.com/
- Enter password: `admin123`
- Rounds: `10`
- Copy the hash (starts with `$2a$10$...`)

### Step 2: Connect to MongoDB
```bash
mongosh
# or
mongo
```

### Step 3: Create Admin User
```javascript
use deal_pipeline_db

db.users.insertOne({
  username: "admin",
  email: "admin@example.com",
  password: "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy", // Replace with your hash
  firstName: "Admin",
  lastName: "User",
  roles: ["ADMIN"],
  enabled: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Step 4: Login
```http
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

---

## Method 3: Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Select database: `deal_pipeline_db`
4. Select collection: `users`
5. Find your user document
6. Click "Edit Document"
7. Change `roles` from `["USER"]` to `["ADMIN"]`
8. Click "Update"

---

## Quick Verification

After creating/updating admin user, verify:

### 1. Check User in MongoDB:
```javascript
db.users.findOne({username: "admin"})
```

### 2. Login and Check Token:
```http
POST http://localhost:8081/api/auth/login
```

Response should include:
```json
{
  "data": {
    "roles": ["ADMIN"]  ← Should be ADMIN
  }
}
```

### 3. Test Admin Endpoint:
```http
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Should return your profile with ADMIN role.

### 4. Create User via Admin Endpoint:
```http
POST http://localhost:8081/api/admin/users
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "username": "user1",
  "email": "user1@example.com",
  "password": "user123",
  "role": "USER"
}
```

Should return `201 Created` ✅

---

## Troubleshooting

### Issue: Still getting 403 Forbidden
- Make sure you logged in again after updating role
- Old tokens don't have the new role
- Get a fresh token by logging in again

### Issue: Can't connect to MongoDB
- Make sure MongoDB is running: `mongod` or check MongoDB service
- Default connection: `mongodb://localhost:27017`

### Issue: User not found in MongoDB
- Check database name: `deal_pipeline_db`
- Check collection name: `users`
- List all users: `db.users.find().pretty()`
