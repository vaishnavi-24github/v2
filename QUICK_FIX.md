# Quick Fix: "Invalid username or password" Error

## The Problem
You're trying to login with username "admin" and password "admin123", but this user doesn't exist in the database yet.

## Solution: Register First!

### In Postman:

1. **Create a NEW request** (or change your existing one)

2. **Register the user:**
   - **Method:** `POST`
   - **URL:** `http://localhost:8081/api/auth/register`
   - **Headers:** 
     ```
     Content-Type: application/json
     ```
   - **Body (select "raw" and "JSON"):**
     ```json
     {
       "username": "admin",
       "email": "admin@example.com",
       "password": "admin123",
       "firstName": "Admin",
       "lastName": "User"
     }
     ```

3. **Click "Send"**

4. **You'll get a response with a token** - Save it!

5. **Now you can login** with the same credentials, OR use the token directly for protected endpoints.

## After Registration

You can either:

### Option A: Use the token from registration
The register endpoint returns a token immediately - you can use it right away!

### Option B: Login with the credentials
Now that the user exists, your login request will work:
- **Method:** `POST`
- **URL:** `http://localhost:8081/api/auth/login`
- **Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

## Test It Works

After registering, try accessing a protected endpoint:

- **Method:** `GET`
- **URL:** `http://localhost:8081/api/deals`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

Replace `YOUR_TOKEN_HERE` with the token from the register/login response.

## Summary

**The issue:** User doesn't exist → Register first  
**The fix:** Use `/api/auth/register` before `/api/auth/login`  
**Result:** User created → Can login → Get token → Access protected endpoints ✅
