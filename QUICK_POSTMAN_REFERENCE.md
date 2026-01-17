# Quick Postman Reference - Deal Endpoints

## 🔑 Step 1: Login First

```
POST http://localhost:8081/api/auth/login
Body: {"username":"admin","password":"admin123"}
```
→ Copy the `token` from response

---

## 📋 All Deal Endpoints

### 1. Create Deal
```
POST http://localhost:8081/api/deals
Authorization: Bearer YOUR_TOKEN
Body: {
  "dealName": "TechCorp Acquisition",
  "dealType": "M&A",
  "clientName": "ABC Corp",
  "sector": "Technology",
  "summary": "Strategic acquisition",
  "currentStage": "Prospect"
}
```
→ Save the `id` from response!

---

### 2. List All Deals
```
GET http://localhost:8081/api/deals
Authorization: Bearer YOUR_TOKEN
```

**With Filters:**
```
GET http://localhost:8081/api/deals?stage=Prospect&sector=Technology
Authorization: Bearer YOUR_TOKEN
```

---

### 3. Get Deal Details
```
GET http://localhost:8081/api/deals/{DEAL_ID}
Authorization: Bearer YOUR_TOKEN
```

---

### 4. Update Deal
```
PUT http://localhost:8081/api/deals/{DEAL_ID}
Authorization: Bearer YOUR_TOKEN
Body: {
  "summary": "Updated summary",
  "sector": "Finance",
  "dealType": "IPO"
}
```

---

### 5. Update Deal Stage
```
PATCH http://localhost:8081/api/deals/{DEAL_ID}/stage
Authorization: Bearer YOUR_TOKEN
Body: {
  "stage": "UnderEvaluation"
}
```

**Valid stages:** `Prospect`, `UnderEvaluation`, `TermSheetSubmitted`, `Closed`, `Lost`

---

### 6. Update Deal Value (ADMIN Only)
```
PATCH http://localhost:8081/api/deals/{DEAL_ID}/value
Authorization: Bearer ADMIN_TOKEN
Body: {
  "dealValue": 150000000
}
```

---

### 7. Add Note
```
POST http://localhost:8081/api/deals/{DEAL_ID}/notes
Authorization: Bearer YOUR_TOKEN
Body: {
  "noteText": "Client meeting scheduled"
}
```

---

### 8. Delete Deal (ADMIN Only)
```
DELETE http://localhost:8081/api/deals/{DEAL_ID}
Authorization: Bearer ADMIN_TOKEN
```

---

## ⚡ Quick Test Sequence

1. **Login** → Get token
2. **Create Deal** → Get deal ID
3. **List Deals** → See all deals
4. **Get Deal** → See deal details
5. **Update Stage** → Change to "UnderEvaluation"
6. **Add Note** → Add a note
7. **Update Value** (ADMIN) → Set deal value
8. **Delete Deal** (ADMIN) → Remove deal

---

## ⚠️ Important Notes

- **USER cannot set/see `dealValue`** - Only ADMIN
- **USER can only see their own deals** - ADMIN sees all
- **Replace `{DEAL_ID}`** with actual ID from create response
- **Set Authorization header** in every request
- **Use ADMIN token** for admin-only endpoints

---

## 🎯 Postman Setup

### Authorization Tab:
- Type: `Bearer Token`
- Token: Paste your token

### Headers Tab:
- `Content-Type: application/json`

### Body Tab:
- Select: `raw`
- Select: `JSON`
- Paste JSON body

That's it! 🚀
