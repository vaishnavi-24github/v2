# Postman Testing Guide - Deal Endpoints

## 🚀 Quick Start

### Step 1: Login to Get Token

**Request:**
```
Method: POST
URL: http://localhost:8081/api/auth/login
```

**Headers Tab:**
```
Content-Type: application/json
```

**Body Tab (raw JSON):**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Click Send** → Copy the `token` from response

---

## 📋 Testing All Deal Endpoints

### 1. POST /api/deals - Create New Deal

#### Setup:
```
Method: POST
URL: http://localhost:8081/api/deals
```

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

#### Headers Tab:
```
Content-Type: application/json
```

#### Body Tab (raw JSON):
```json
{
  "dealName": "Acquisition of TechCorp",
  "dealType": "M&A",
  "clientName": "ABC Corporation",
  "sector": "Technology",
  "summary": "Strategic acquisition in technology sector",
  "currentStage": "Prospect",
  "description": "This is a strategic acquisition deal",
  "currency": "USD"
}
```

**Note for USER:** Don't include `dealValue` - it will be rejected!

**Note for ADMIN:** You can include `dealValue`:
```json
{
  "dealName": "Acquisition of TechCorp",
  "dealType": "M&A",
  "clientName": "ABC Corporation",
  "sector": "Technology",
  "summary": "Strategic acquisition",
  "currentStage": "Prospect",
  "dealValue": 100000000,
  "currency": "USD"
}
```

#### Expected Response (201 Created):
```json
{
  "success": true,
  "message": "Deal created successfully",
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "dealName": "Acquisition of TechCorp",
    "dealType": "M&A",
    "currentStage": "Prospect",
    "clientName": "ABC Corporation",
    "dealValue": null,  // Hidden for USER
    "summary": "Strategic acquisition in technology sector",
    "sector": "Technology",
    "notes": [],
    "createdBy": "user_id",
    "createdByUsername": "admin",
    "createdAt": "2026-01-10T12:00:00",
    "updatedAt": "2026-01-10T12:00:00"
  }
}
```

**✅ Save the `id` from response - you'll need it for other endpoints!**

---

### 2. GET /api/deals - List All Deals

#### Setup:
```
Method: GET
URL: http://localhost:8081/api/deals
```

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

#### No Body needed

#### Expected Response (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "6961e86c55d8af06a512f241",
      "dealName": "Acquisition of TechCorp",
      "currentStage": "Prospect",
      "dealValue": null,  // Hidden for USER
      ...
    }
  ]
}
```

---

### 3. GET /api/deals - With Filters

#### Filter by Stage:
```
Method: GET
URL: http://localhost:8081/api/deals?stage=Prospect
Authorization: Bearer YOUR_TOKEN
```

#### Filter by Sector:
```
Method: GET
URL: http://localhost:8081/api/deals?sector=Technology
Authorization: Bearer YOUR_TOKEN
```

#### Filter by DealType:
```
Method: GET
URL: http://localhost:8081/api/deals?dealType=M&A
Authorization: Bearer YOUR_TOKEN
```

#### Multiple Filters:
```
Method: GET
URL: http://localhost:8081/api/deals?stage=Prospect&sector=Technology&dealType=M&A
Authorization: Bearer YOUR_TOKEN
```

**Valid Stage Values:**
- `Prospect`
- `UnderEvaluation`
- `TermSheetSubmitted`
- `Closed`
- `Lost`

---

### 4. GET /api/deals/{id} - Get Deal Details

#### Setup:
```
Method: GET
URL: http://localhost:8081/api/deals/6961e86c55d8af06a512f241
```
(Replace `6961e86c55d8af06a512f241` with actual deal ID from Step 1)

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

#### Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "dealName": "Acquisition of TechCorp",
    "dealType": "M&A",
    "currentStage": "Prospect",
    "clientName": "ABC Corporation",
    "dealValue": null,  // Hidden for USER, visible for ADMIN
    "summary": "Strategic acquisition",
    "sector": "Technology",
    "notes": [],
    "createdBy": "user_id",
    "createdByUsername": "admin",
    "createdAt": "2026-01-10T12:00:00",
    "updatedAt": "2026-01-10T12:00:00"
  }
}
```

---

### 5. PUT /api/deals/{id} - Update Deal

#### Setup:
```
Method: PUT
URL: http://localhost:8081/api/deals/6961e86c55d8af06a512f241
```
(Replace with your deal ID)

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

#### Headers Tab:
```
Content-Type: application/json
```

#### Body Tab (raw JSON):
```json
{
  "summary": "Updated summary - client approved initial terms",
  "sector": "Finance",
  "dealType": "IPO",
  "description": "Updated description"
}
```

**Note:** USER cannot include `dealValue` in update request!

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Deal updated successfully",
  "data": {
    "id": "...",
    "summary": "Updated summary - client approved initial terms",
    "sector": "Finance",
    "dealType": "IPO",
    ...
  }
}
```

---

### 6. PATCH /api/deals/{id}/stage - Update Deal Stage

#### Setup:
```
Method: PATCH
URL: http://localhost:8081/api/deals/6961e86c55d8af06a512f241/stage
```
(Replace with your deal ID)

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

#### Headers Tab:
```
Content-Type: application/json
```

#### Body Tab (raw JSON):
```json
{
  "stage": "UnderEvaluation"
}
```

**Valid Stage Values:**
- `"Prospect"`
- `"UnderEvaluation"`
- `"TermSheetSubmitted"`
- `"Closed"`
- `"Lost"`

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Deal stage updated successfully",
  "data": {
    "id": "...",
    "currentStage": "UnderEvaluation",
    ...
  }
}
```

**Special Behavior:**
- When stage = `"Closed"`, `actualCloseDate` is automatically set
- When stage = `"Closed"`, `status` is automatically set to `CLOSED`

---

### 7. PATCH /api/deals/{id}/value - Update Deal Value (ADMIN Only)

#### Setup:
```
Method: PATCH
URL: http://localhost:8081/api/deals/6961e86c55d8af06a512f241/value
```
(Replace with your deal ID)

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your **ADMIN** token

#### Headers Tab:
```
Content-Type: application/json
```

#### Body Tab (raw JSON):
```json
{
  "dealValue": 150000000
}
```

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Deal value updated successfully",
  "data": {
    "id": "...",
    "dealValue": 150000000,
    ...
  }
}
```

**⚠️ Error if USER tries this:**
```json
{
  "success": false,
  "message": "Only ADMIN can update deal value"
}
```

---

### 8. POST /api/deals/{id}/notes - Add Note to Deal

#### Setup:
```
Method: POST
URL: http://localhost:8081/api/deals/6961e86c55d8af06a512f241/notes
```
(Replace with your deal ID)

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

#### Headers Tab:
```
Content-Type: application/json
```

#### Body Tab (raw JSON):
```json
{
  "noteText": "Client meeting scheduled for next week. Discussed valuation terms."
}
```

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "id": "...",
    "notes": [
      {
        "userId": "user_id",
        "username": "admin",
        "noteText": "Client meeting scheduled for next week. Discussed valuation terms.",
        "timestamp": "2026-01-10T12:30:00"
      }
    ],
    ...
  }
}
```

**Note:** `userId`, `username`, and `timestamp` are automatically set from logged-in user!

---

### 9. DELETE /api/deals/{id} - Delete Deal (ADMIN Only)

#### Setup:
```
Method: DELETE
URL: http://localhost:8081/api/deals/6961e86c55d8af06a512f241
```
(Replace with your deal ID)

#### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your **ADMIN** token

#### No Body needed

#### Expected Response (200 OK):
```json
{
  "success": true,
  "message": "Deal deleted successfully",
  "data": null
}
```

**⚠️ Error if USER tries this:**
```json
{
  "success": false,
  "message": "Only ADMIN can delete deals"
}
```

---

## 🎯 Complete Test Flow

### Test Sequence:

1. **Login** → Get token
   ```
   POST /api/auth/login
   ```

2. **Create Deal** → Get deal ID
   ```
   POST /api/deals
   ```
   → Copy `id` from response

3. **List All Deals**
   ```
   GET /api/deals
   ```

4. **Get Deal Details**
   ```
   GET /api/deals/{id}
   ```

5. **Update Deal**
   ```
   PUT /api/deals/{id}
   ```

6. **Update Deal Stage**
   ```
   PATCH /api/deals/{id}/stage
   ```

7. **Add Note**
   ```
   POST /api/deals/{id}/notes
   ```

8. **Update Deal Value (ADMIN only)**
   ```
   PATCH /api/deals/{id}/value
   ```

9. **Delete Deal (ADMIN only)**
   ```
   DELETE /api/deals/{id}
   ```

---

## 📝 Postman Collection Setup

### Create Environment Variables:

1. Go to **Environments** → **Add**
2. Create environment: "Local Development"
3. Add variables:
   - `baseUrl` = `http://localhost:8081`
   - `token` = (leave empty, will be set after login)
   - `dealId` = (leave empty, will be set after creating deal)

### Use Variables in Requests:

**URL:**
```
{{baseUrl}}/api/deals
```

**Authorization:**
```
Bearer {{token}}
```

### Auto-save Token After Login:

In your login request, go to **Tests** tab:
```javascript
if (pm.response.code === 200) {
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.data.token);
    console.log("Token saved to environment");
}
```

### Auto-save Deal ID After Creation:

In your create deal request, go to **Tests** tab:
```javascript
if (pm.response.code === 201) {
    var jsonData = pm.response.json();
    pm.environment.set("dealId", jsonData.data.id);
    console.log("Deal ID saved: " + jsonData.data.id);
}
```

---

## 🔍 Visual Guide: Postman Setup

### Example: Create Deal Request

```
┌─────────────────────────────────────────────┐
│ POST http://localhost:8081/api/deals        │
├─────────────────────────────────────────────┤
│ [Authorization Tab]                          │
│ Type: Bearer Token                           │
│ Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...│
│                                             │
│ [Headers Tab]                               │
│ Content-Type: application/json              │
│                                             │
│ [Body Tab]                                  │
│ raw ▼ JSON ▼                                │
│                                             │
│ {                                           │
│   "dealName": "Acquisition of TechCorp",   │
│   "dealType": "M&A",                        │
│   "clientName": "ABC Corporation",          │
│   "sector": "Technology",                   │
│   "summary": "Strategic acquisition",       │
│   "currentStage": "Prospect"                │
│ }                                           │
└─────────────────────────────────────────────┘
```

---

## ⚠️ Common Issues

### Issue 1: 401 Unauthorized
**Solution:** 
- Make sure Authorization header is set
- Token might be expired - login again
- Check token is complete (very long string)

### Issue 2: USER Trying to Set dealValue
**Error:** "Users cannot set dealValue. Only ADMIN can set deal value."
**Solution:** Remove `dealValue` from request body

### Issue 3: USER Trying to View Other User's Deal
**Error:** "You don't have permission to view this deal"
**Solution:** USER can only see their own deals. Use ADMIN token to see all deals.

### Issue 4: Invalid Stage Value
**Error:** "Invalid stage value..."
**Solution:** Use one of: `Prospect`, `UnderEvaluation`, `TermSheetSubmitted`, `Closed`, `Lost`

### Issue 5: 403 Forbidden for Admin Endpoints
**Error:** "Only ADMIN can..."
**Solution:** Make sure you're using ADMIN token, not USER token

---

## ✅ Quick Checklist

Before testing:
- ✅ Logged in and have token
- ✅ Token is set in Authorization tab
- ✅ Content-Type header is set to `application/json`
- ✅ Body is valid JSON
- ✅ For ADMIN endpoints, using ADMIN token
- ✅ Deal ID is correct (from create response)

---

## 🎬 Sample Test Data

### Create Deal Request:
```json
{
  "dealName": "TechCorp Acquisition",
  "dealType": "M&A",
  "clientName": "ABC Corporation",
  "sector": "Technology",
  "summary": "Strategic acquisition in tech sector",
  "currentStage": "Prospect",
  "description": "This deal involves acquiring TechCorp to expand market presence",
  "currency": "USD"
}
```

### Update Stage Request:
```json
{
  "stage": "UnderEvaluation"
}
```

### Add Note Request:
```json
{
  "noteText": "Initial client meeting completed. Terms discussed."
}
```

### Update Value Request (ADMIN):
```json
{
  "dealValue": 100000000
}
```

---

## 📊 Testing Tips

1. **Save Responses:** Use Postman's "Save Response" to keep deal IDs
2. **Use Collections:** Organize all deal endpoints in a collection
3. **Use Variables:** Set `{{dealId}}` to reuse deal ID across requests
4. **Test Both Roles:** Test with USER token and ADMIN token separately
5. **Check Filters:** Test all filter combinations (stage, sector, dealType)

All endpoints are ready to test! Follow the steps above and you'll be able to test everything! 🚀
