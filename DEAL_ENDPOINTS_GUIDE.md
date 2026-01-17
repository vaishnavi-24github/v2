# Deal Management Endpoints - Complete Guide

## Overview

All deal endpoints require authentication. `dealValue` is a sensitive field that only ADMIN can view/update.

---

## 1. POST /api/deals - Create New Deal

### Access
- ✅ USER role
- ✅ ADMIN role

### Restrictions
- ❌ USER **cannot** set `dealValue` (will be rejected)
- ✅ ADMIN can set `dealValue`
- `createdBy` is automatically set from logged-in user

### Request
```http
POST http://localhost:8081/api/deals
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "dealName": "Acquisition of Company X",
  "dealType": "M&A",
  "clientName": "Client ABC",
  "sector": "Technology",
  "summary": "Strategic acquisition in tech sector",
  "currentStage": "Prospect",
  "description": "Detailed description here",
  "dealValue": 100000000,  // USER cannot set this - will be rejected
  "currency": "USD",
  "expectedCloseDate": "2024-12-31T00:00:00"
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Deal created successfully",
  "data": {
    "id": "...",
    "dealName": "Acquisition of Company X",
    "dealType": "M&A",
    "currentStage": "Prospect",
    "clientName": "Client ABC",
    "dealValue": null,  // Hidden for USER, visible for ADMIN
    "summary": "Strategic acquisition in tech sector",
    "sector": "Technology",
    "notes": [],
    "createdBy": "user_id",
    "createdByUsername": "username",
    "createdAt": "2026-01-10T12:00:00",
    "updatedAt": "2026-01-10T12:00:00"
  }
}
```

### Error - USER Trying to Set dealValue
```json
{
  "success": false,
  "message": "Users cannot set dealValue. Only ADMIN can set deal value."
}
```

---

## 2. GET /api/deals - List All Deals

### Access
- ✅ USER role (sees only their deals)
- ✅ ADMIN role (sees all deals)

### Optional Query Parameters
- `stage` - Filter by DealStage (Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost)
- `sector` - Filter by sector
- `dealType` - Filter by deal type

### Request Examples

**Get all deals:**
```http
GET http://localhost:8081/api/deals
Authorization: Bearer YOUR_TOKEN
```

**Filter by stage:**
```http
GET http://localhost:8081/api/deals?stage=Prospect
Authorization: Bearer YOUR_TOKEN
```

**Filter by sector:**
```http
GET http://localhost:8081/api/deals?sector=Technology
Authorization: Bearer YOUR_TOKEN
```

**Filter by dealType:**
```http
GET http://localhost:8081/api/deals?dealType=M&A
Authorization: Bearer YOUR_TOKEN
```

**Multiple filters:**
```http
GET http://localhost:8081/api/deals?stage=UnderEvaluation&sector=Technology&dealType=M&A
Authorization: Bearer YOUR_TOKEN
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "dealName": "Acquisition of Company X",
      "currentStage": "Prospect",
      "dealValue": null,  // Hidden for USER
      ...
    }
  ]
}
```

---

## 3. GET /api/deals/{id} - Get Deal Details

### Access
- ✅ USER role (can see only their own deals)
- ✅ ADMIN role (can see all deals)

### Request
```http
GET http://localhost:8081/api/deals/6961e86c55d8af06a512f241
Authorization: Bearer YOUR_TOKEN
```

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "id": "6961e86c55d8af06a512f241",
    "dealName": "Acquisition of Company X",
    "dealType": "M&A",
    "currentStage": "Prospect",
    "clientName": "Client ABC",
    "dealValue": null,  // Hidden for USER, visible for ADMIN
    "summary": "Strategic acquisition",
    "sector": "Technology",
    "notes": [
      {
        "userId": "user_id",
        "username": "username",
        "noteText": "Initial discussion completed",
        "timestamp": "2026-01-10T12:00:00"
      }
    ],
    "createdBy": "user_id",
    "createdByUsername": "username",
    "createdAt": "2026-01-10T12:00:00",
    "updatedAt": "2026-01-10T12:00:00"
  }
}
```

### Error - USER Trying to View Other User's Deal
```json
{
  "success": false,
  "message": "You don't have permission to view this deal"
}
```

---

## 4. PUT /api/deals/{id} - Update Deal

### Access
- ✅ USER role (can update only their own deals)
- ✅ ADMIN role (can update any deal)

### Restrictions
- ❌ USER **cannot** update `dealValue`
- ✅ Can update: `summary`, `sector`, `dealType`, `description`, `dealName`
- ✅ ADMIN can also update `dealValue`

### Request
```http
PUT http://localhost:8081/api/deals/6961e86c55d8af06a512f241
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "summary": "Updated summary",
  "sector": "Finance",
  "dealType": "IPO",
  "description": "Updated description"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Deal updated successfully",
  "data": {
    ...
  }
}
```

### Error - USER Trying to Update dealValue
```json
{
  "success": false,
  "message": "Users cannot update dealValue. Only ADMIN can update deal value."
}
```

---

## 5. PATCH /api/deals/{id}/stage - Update Deal Stage

### Access
- ✅ USER role (can update only their own deals)
- ✅ ADMIN role (can update any deal)

### Valid Stage Values
- `Prospect`
- `UnderEvaluation`
- `TermSheetSubmitted`
- `Closed`
- `Lost`

### Request
```http
PATCH http://localhost:8081/api/deals/6961e86c55d8af06a512f241/stage
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "stage": "UnderEvaluation"
}
```

### Response (200 OK)
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

### Special Behavior
- When stage is set to `Closed`, `actualCloseDate` is automatically set
- When stage is set to `Closed`, `status` is automatically set to `CLOSED`

### Error - Invalid Stage
```json
{
  "success": false,
  "message": "Invalid stage value. Valid values: Prospect, UnderEvaluation, TermSheetSubmitted, Closed, Lost"
}
```

---

## 6. PATCH /api/deals/{id}/value - Update Deal Value

### Access
- ✅ ADMIN role only
- ❌ USER role (will be rejected)

### Request
```http
PATCH http://localhost:8081/api/deals/6961e86c55d8af06a512f241/value
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "dealValue": 150000000
}
```

### Response (200 OK)
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

### Error - USER Trying to Update Value
```json
{
  "success": false,
  "message": "Only ADMIN can update deal value"
}
```

---

## 7. POST /api/deals/{id}/notes - Add Note to Deal

### Access
- ✅ USER role (can add notes to their own deals)
- ✅ ADMIN role (can add notes to any deal)

### Request
```http
POST http://localhost:8081/api/deals/6961e86c55d8af06a512f241/notes
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

### Request Body
```json
{
  "noteText": "Client requested additional information about valuation"
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Note added successfully",
  "data": {
    "id": "...",
    "notes": [
      {
        "userId": "user_id",
        "username": "username",
        "noteText": "Client requested additional information about valuation",
        "timestamp": "2026-01-10T12:30:00"
      }
    ],
    ...
  }
}
```

**Note:** `userId` and `username` are automatically set from logged-in user. `timestamp` is automatically set.

---

## 8. DELETE /api/deals/{id} - Delete Deal

### Access
- ✅ ADMIN role only
- ❌ USER role (will be rejected)

### Request
```http
DELETE http://localhost:8081/api/deals/6961e86c55d8af06a512f241
Authorization: Bearer ADMIN_TOKEN
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Deal deleted successfully",
  "data": null
}
```

### Error - USER Trying to Delete
```json
{
  "success": false,
  "message": "Only ADMIN can delete deals"
}
```

---

## DealStage Enum Values

| Value | Description |
|-------|-------------|
| `Prospect` | Initial prospect stage |
| `UnderEvaluation` | Deal is being evaluated |
| `TermSheetSubmitted` | Term sheet has been submitted |
| `Closed` | Deal is closed successfully |
| `Lost` | Deal was lost |

---

## Security Features

### ✅ dealValue Protection
- `dealValue` is **hidden** in responses for USER role
- `dealValue` is **visible** in responses for ADMIN role
- USER **cannot** set or update `dealValue`
- Only ADMIN can set/update `dealValue`

### ✅ Deal Ownership
- USER can only see/update their own deals
- ADMIN can see/update all deals
- `createdBy` is automatically set from logged-in user

### ✅ Notes
- Notes include `userId`, `username`, and `timestamp`
- Automatically populated from logged-in user
- USER can add notes to their own deals
- ADMIN can add notes to any deal

---

## Complete Testing Flow

### 1. Create Deal (as USER)
```http
POST /api/deals
Body: {
  "dealName": "Test Deal",
  "dealType": "M&A",
  "clientName": "Test Client",
  "sector": "Technology",
  "summary": "Test summary"
  // Note: No dealValue - USER cannot set it
}
```

### 2. Get All Deals
```http
GET /api/deals?stage=Prospect&sector=Technology
```

### 3. Update Deal Stage
```http
PATCH /api/deals/{id}/stage
Body: {"stage": "UnderEvaluation"}
```

### 4. Add Note
```http
POST /api/deals/{id}/notes
Body: {"noteText": "Client meeting scheduled"}
```

### 5. Update Deal Value (ADMIN only)
```http
PATCH /api/deals/{id}/value
Body: {"dealValue": 100000000}
```

### 6. Delete Deal (ADMIN only)
```http
DELETE /api/deals/{id}
```

---

## Postman Collection Setup

### Environment Variables:
- `baseUrl` = `http://localhost:8081`
- `token` = (your JWT token)
- `dealId` = (deal ID for testing)

### Example Requests:
1. Create Deal: `POST {{baseUrl}}/api/deals`
2. List Deals: `GET {{baseUrl}}/api/deals?stage=Prospect`
3. Get Deal: `GET {{baseUrl}}/api/deals/{{dealId}}`
4. Update Stage: `PATCH {{baseUrl}}/api/deals/{{dealId}}/stage`
5. Add Note: `POST {{baseUrl}}/api/deals/{{dealId}}/notes`
6. Update Value: `PATCH {{baseUrl}}/api/deals/{{dealId}}/value`
7. Delete Deal: `DELETE {{baseUrl}}/api/deals/{{dealId}}`

All endpoints are ready to use! 🎉
