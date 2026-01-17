# Troubleshooting 401 Unauthorized Error

## You're Getting 401 Even With Token? Here's How to Fix It

### Step 1: Verify Your Token is Valid

First, test your token using the verify endpoint:

```
GET http://localhost:8081/api/token/verify
Authorization: Bearer YOUR_TOKEN_HERE
```

**If this fails**, your token is invalid. Get a new one by logging in again.

### Step 2: Check Common Issues

#### Issue 1: Token Expired
**Symptoms:** Token was working before, now getting 401  
**Solution:** 
- Tokens expire after 24 hours
- Login again to get a new token

#### Issue 2: Wrong Token Format
**Symptoms:** Getting 401 immediately after login  
**Check:**
- Make sure you copied the ENTIRE token (it's very long)
- Token should start with `eyJ` and have 3 parts separated by dots
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIs...`

#### Issue 3: Missing "Bearer " Prefix
**Symptoms:** Token looks correct but still 401  
**Check in Postman:**
- Authorization tab: Should say "Bearer Token" (not "No Auth")
- Headers tab: Should be `Authorization: Bearer YOUR_TOKEN` (with space after "Bearer")

#### Issue 4: User Doesn't Exist or is Disabled
**Symptoms:** Token validates but still 401  
**Check:**
- User might have been deleted
- User might be disabled (`enabled: false`)
- Check in MongoDB: `db.users.findOne({username: "your_username"})`

#### Issue 5: Wrong JWT Secret
**Symptoms:** Token from old session doesn't work  
**Solution:**
- If you changed `application.yml` JWT secret, old tokens won't work
- Login again to get a new token with the new secret

### Step 3: Complete Debugging Steps

#### A. Get a Fresh Token
```
POST http://localhost:8081/api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Copy the ENTIRE token** from response.

#### B. Verify Token Works
```
GET http://localhost:8081/api/token/verify
Authorization: Bearer YOUR_NEW_TOKEN
```

**Expected:** Should return token info with `"valid": true`

#### C. Check Your User Profile
```
GET http://localhost:8081/api/users/me
Authorization: Bearer YOUR_NEW_TOKEN
```

**Expected:** Should return your user profile

#### D. Check User Role (for Admin Endpoints)
If accessing `/api/admin/**`, verify you have ADMIN role:
- Response from `/api/users/me` should show `"roles": ["ADMIN"]`
- If only `["USER"]`, you need to update role in MongoDB

### Step 4: Postman Setup Checklist

✅ **Authorization Tab:**
- Type: `Bearer Token`
- Token: Paste your FULL token (no spaces before/after)

✅ **Headers Tab (Alternative):**
- Key: `Authorization`
- Value: `Bearer YOUR_TOKEN` (space after "Bearer" is important!)

✅ **Body Tab:**
- Content-Type: `application/json`
- Body: Valid JSON

### Step 5: Common Token Issues

#### Token Too Short
❌ Wrong: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`
✅ Correct: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsInJvbGVzIjpbIlJPTEVfQURNSU4iXSwiaWF0IjoxNzA0ODkyODAwLCJleHAiOjE3MDQ5NzkyMDB9.signature`

#### Missing Bearer Prefix
❌ Wrong: `Authorization: eyJhbGc...`
✅ Correct: `Authorization: Bearer eyJhbGc...`

#### Extra Spaces
❌ Wrong: `Authorization: Bearer  eyJhbGc...` (double space)
✅ Correct: `Authorization: Bearer eyJhbGc...` (single space)

#### Token from Wrong Environment
- Make sure you're using token from the correct server
- Token from `localhost:8080` won't work for `localhost:8081`

### Step 6: Test with curl (Alternative to Postman)

If Postman isn't working, try curl:

```bash
# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copy token from response, then:

# Verify token
curl -X GET http://localhost:8081/api/token/verify \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test admin endpoint
curl -X POST http://localhost:8081/api/admin/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@example.com","password":"user123","role":"USER"}'
```

### Step 7: Check Application Logs

Check your Spring Boot console for error messages:
- Look for: "JWT token is expired"
- Look for: "Invalid JWT signature"
- Look for: "Invalid JWT token format"
- Look for: "User not found"

These will tell you exactly what's wrong.

### Step 8: Verify JWT Secret in application.yml

Check that your JWT secret is at least 32 characters:

```yaml
spring:
  security:
    jwt:
      secret: mySuperSecretKey12345678901234567890  # Must be 32+ chars
```

If you changed this, all old tokens are invalid. Login again.

### Step 9: Quick Fix - Complete Flow

1. **Stop the application** (if running)

2. **Check MongoDB is running:**
   ```bash
   mongosh
   # Should connect successfully
   ```

3. **Verify user exists:**
   ```javascript
   use deal_pipeline_db
   db.users.find().pretty()
   ```

4. **Start application:**
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

5. **Login to get fresh token:**
   ```
   POST http://localhost:8081/api/auth/login
   ```

6. **Copy ENTIRE token** (it's long!)

7. **Use token in Postman:**
   - Authorization tab → Bearer Token → Paste token

8. **Try admin endpoint again**

### Still Not Working?

1. **Check token in JWT.io:**
   - Go to https://jwt.io
   - Paste your token
   - Check if it decodes correctly
   - Verify signature (if you know the secret)

2. **Check user in database:**
   ```javascript
   db.users.findOne({username: "admin"})
   ```
   - Should have `enabled: true`
   - Should have `roles: ["ADMIN"]` (for admin endpoints)

3. **Restart application:**
   - Sometimes a restart fixes authentication issues

4. **Check for typos:**
   - Token copied correctly?
   - No extra spaces?
   - "Bearer " (with space) included?

## Quick Test Script

Run these in order:

```bash
# 1. Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | jq '.data.token' > token.txt

# 2. Read token
TOKEN=$(cat token.txt | tr -d '"')

# 3. Verify token
curl -X GET http://localhost:8081/api/token/verify \
  -H "Authorization: Bearer $TOKEN"

# 4. Test admin endpoint
curl -X POST http://localhost:8081/api/admin/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"user1","email":"user1@example.com","password":"user123","role":"USER"}'
```

If all these work, the issue is with your Postman setup. If they fail, check the error message for specific issues.
