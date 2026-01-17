# Quick Start Guide

## Prerequisites
- ✅ Java 17 (already installed)
- ✅ MongoDB running on localhost:27017
- ✅ Maven Wrapper (already set up - no Maven installation needed!)

## Running the Application

### 1. Start MongoDB
Make sure MongoDB is running on `localhost:27017`

### 2. Run the Spring Boot Application
```powershell
.\mvnw.cmd spring-boot:run
```

The application will start on `http://localhost:8081`

### 3. Test the API

**Register a new user:**
```powershell
curl -X POST http://localhost:8081/api/auth/register -H "Content-Type: application/json" -d '{\"username\":\"admin\",\"email\":\"admin@example.com\",\"password\":\"password123\",\"firstName\":\"Admin\",\"lastName\":\"User\"}'
```

**Login:**
```powershell
curl -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" -d '{\"username\":\"admin\",\"password\":\"password123\"}'
```

Copy the `token` from the response and use it in subsequent requests.

**Create a deal (replace YOUR_TOKEN with the token from login):**
```powershell
curl -X POST http://localhost:8081/api/deals -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_TOKEN" -d '{\"dealName\":\"Acquisition of Company X\",\"dealType\":\"M&A\",\"clientName\":\"Client ABC\",\"dealValue\":100000000,\"currency\":\"USD\",\"sector\":\"Technology\"}'
```

## Common Commands

- **Run application:** `.\mvnw.cmd spring-boot:run`
- **Build project:** `.\mvnw.cmd clean package`
- **Run tests:** `.\mvnw.cmd test`
- **Check Maven version:** `.\mvnw.cmd --version`

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod` or check MongoDB service
- Verify connection string in `application.yml`

### Port Already in Use
- The application is configured to use port **8081** (changed from 8080)
- If 8081 is also in use, change port in `application.yml` (server.port)
- To find what's using a port: `netstat -ano | findstr :PORT_NUMBER`

### JWT Secret Error
- The JWT secret in `application.yml` must be at least 32 characters
- Current secret is set to: `mySuperSecretKey12345678901234567890`
