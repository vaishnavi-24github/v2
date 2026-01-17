# Quick Fix: 401 Unauthorized Error

## 🔴 Your Problem
Getting `401 Unauthorized` for:
- GET /api/users/me
- PUT /api/admin/users/{id}/status

## ✅ Quick Fix (3 Steps)

### Step 1: Login and Get Token
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Copy the ENTIRE token** from response (it's very long!)

### Step 2: Set Token in Postman

**For GET /api/users/me:**
1. Click **Authorization** tab
2. Type: `Bearer Token`
3. Paste your token in Token field
4. Click **Send**

**For PUT /api/admin/users/{id}/status:**
1. Click **Authorization** tab
2. Type: `Bearer Token`
3. Paste your ADMIN token
4. Click **Body** tab
5. Select "raw" and "JSON"
6. Enter: `{"active": false}`
7. Click **Send**

### Step 3: Verify It Works

**Expected Response for GET /api/users/me:**
```json
{
  "success": true,
  "data": {
    "username": "admin",
    "roles": ["ADMIN"],
    ...
  }
}
```

**Expected Response for PUT /api/admin/users/{id}/status:**
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "enabled": false,
    ...
  }
}
```

---

## ⚠️ Common Mistakes

### Mistake 1: Token Not Set
- ❌ Authorization tab shows "No Auth"
- ✅ Should show "Bearer Token" with token pasted

### Mistake 2: Token Incomplete
- ❌ Token is too short
- ✅ Token should be 200+ characters long

### Mistake 3: Token Expired
- ❌ Using old token
- ✅ Login again to get fresh token

### Mistake 4: Wrong Role
- ❌ User has USER role, trying to access admin endpoints
- ✅ Update role to ADMIN in MongoDB, then login again

---

## Still Not Working?

1. **Check token is valid:**
   ```
   GET http://localhost:8081/api/token/verify
   Authorization: Bearer YOUR_TOKEN
   ```
   If this fails, token is invalid - login again!

2. **Check your role:**
   ```
   GET http://localhost:8081/api/users/me
   Authorization: Bearer YOUR_TOKEN
   ```
   Should show `"roles": ["ADMIN"]` for admin endpoints

3. **Restart application:**
   - Sometimes a restart fixes authentication issues

4. **Check MongoDB:**
   - User exists?
   - User enabled: true?
   - User has correct role?

---

## One More Time - Complete Flow

1. **Login:**
   ```
   POST /api/auth/login
   Body: {"username":"admin","password":"admin123"}
   ```
   → Copy token

2. **Set Token:**
   - Authorization tab → Bearer Token → Paste token

3. **Test:**
   ```
   GET /api/users/me
   ```
   → Should work! ✅

4. **Test Admin Endpoint:**
   ```
   PUT /api/admin/users/{ID}/status
   Body: {"active": false}
   ```
   → Should work if you have ADMIN role! ✅

That's it! 🎉
