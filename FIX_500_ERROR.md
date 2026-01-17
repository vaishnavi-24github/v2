# Fix: 500 Internal Server Error - "No static resource"

## 🔴 Problem
Getting `500 Internal Server Error` with message:
```
"No static resource api/admin/users/6961e86c55d8af06a512f241/status%20."
```

## ✅ Solution: Remove Trailing Space from URL

The `%20` at the end means there's a **trailing space** in your URL!

### Fix in Postman:

1. **Click on the URL field** in your PUT request
2. **Look at the end of the URL:**
   - ❌ Wrong: `http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241/status ` (has space at end)
   - ✅ Correct: `http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241/status` (no space)

3. **Delete any spaces** at the end of the URL
4. **Make sure the URL is exactly:**
   ```
   http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241/status
   ```
   (No space after "status")

5. **Click Send again**

---

## Complete Correct Setup

### Request:
```
Method: PUT
URL: http://localhost:8081/api/admin/users/6961e86c55d8af06a512f241/status
```
⚠️ **NO SPACE at the end!**

### Authorization Tab:
- Type: `Bearer Token`
- Token: Your ADMIN token

### Headers Tab:
```
Content-Type: application/json
```

### Body Tab (raw JSON):
```json
{
  "active": false
}
```

---

## How to Avoid This Issue

1. **Don't copy-paste URLs with spaces**
2. **Type the URL manually** or copy carefully
3. **Check the URL bar** - make sure there's no trailing space
4. **In Postman, the URL should end exactly with `/status`** - nothing after it

---

## Expected Response After Fix

### Success Response (200 OK):
```json
{
  "success": true,
  "message": "User deactivated successfully",
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "username": "admin",
    "email": "admin@example.com",
    "enabled": false,
    "roles": ["ADMIN"],
    "createdAt": "2026-01-10T05:49:31.330+00:00",
    "updatedAt": "2026-01-10T12:10:00.000+00:00"
  },
  "timestamp": "2026-01-10T12:10:00"
}
```

---

## Quick Checklist

✅ URL has no trailing space  
✅ Authorization header set with ADMIN token  
✅ Body is valid JSON: `{"active": false}`  
✅ Method is PUT  
✅ User ID is correct (from MongoDB)

That's it! Just remove the space and it will work! 🎉
