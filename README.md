# Investment Banking Deal Pipeline Management Portal

A comprehensive backend application for managing investment banking deal pipelines with role-based access control.

## Tech Stack

- **Spring Boot 3.2.0** (Latest stable version, fully compatible with Spring Boot 3.x)
- **Java 17**
- **MongoDB** - NoSQL database
- **JWT Authentication** - Secure token-based authentication
- **Spring Security** - Role-based access control (USER and ADMIN)

## Architecture

The application follows a clean layered architecture:

```
src/main/java/com/investmentbanking/dealpipeline/
├── controller/     - REST API endpoints
├── service/        - Business logic layer
├── repository/     - Data access layer (MongoDB)
├── dto/           - Data Transfer Objects
├── model/         - Entity models
├── config/        - Configuration classes
├── exception/     - Exception handling
└── security/      - JWT and security components
```

## Features

- **User Authentication & Authorization**
  - User registration and login
  - JWT token-based authentication
  - Role-based access control (USER, ADMIN)

- **Deal Management**
  - Create, read, update, and delete deals
  - Deal status tracking (INITIATED, IN_PROGRESS, UNDER_REVIEW, APPROVED, CLOSED, CANCELLED)
  - Deal assignment to users
  - Filter deals by status
  - User-specific deal visibility (USERs see only their deals, ADMINs see all)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token

### Deals
- `GET /api/deals` - Get all deals (filtered by user role)
- `GET /api/deals?status={status}` - Get deals by status
- `GET /api/deals/{id}` - Get deal by ID
- `POST /api/deals` - Create a new deal
- `PUT /api/deals/{id}` - Update a deal
- `DELETE /api/deals/{id}` - Delete a deal

## Setup Instructions

1. **Prerequisites**
   - Java 17 or higher
   - Maven 3.6+
   - MongoDB running on localhost:27017

2. **Configuration**
   - Update `application.yml` with your MongoDB connection string
   - Set `JWT_SECRET` environment variable or update in `application.yml` (minimum 32 characters)

3. **Run the Application**
   
   **Option 1: Using Maven Wrapper (Recommended - No Maven installation needed)**
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   
   **Option 2: Using Maven (if installed)**
   ```bash
   mvn spring-boot:run
   ```

4. **Build the Application**
   
   **Using Maven Wrapper:**
   ```powershell
   .\mvnw.cmd clean package
   ```
   
   **Using Maven:**
   ```bash
   mvn clean package
   ```

**Note:** If you don't have Maven installed, use the Maven Wrapper (`mvnw.cmd`) which is already set up in the project. The wrapper will automatically download Maven when first used.

## Security

- JWT tokens expire after 24 hours (configurable)
- Passwords are encrypted using BCrypt
- CORS enabled for frontend integration
- Role-based authorization on endpoints

## Database

MongoDB collections:
- `users` - User accounts with roles
- `deals` - Deal pipeline data

## Testing

Use the following curl commands to test the API:

### Register User
```bash
curl -X POST http://localhost:8081/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### Login
```bash
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "password123"
  }'
```

### Create Deal (use token from login)
```bash
curl -X POST http://localhost:8081/api/deals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "dealName": "Acquisition of Company X",
    "dealType": "M&A",
    "clientName": "Client ABC",
    "dealValue": 100000000,
    "currency": "USD",
    "sector": "Technology"
  }'
```

## Project Structure

- **Models**: User, Deal, Role enum, DealStatus enum
- **DTOs**: Request/Response objects for API communication
- **Repositories**: MongoDB repositories with custom queries
- **Services**: Business logic with transaction management
- **Controllers**: RESTful API endpoints
- **Security**: JWT authentication and authorization
- **Exception Handling**: Global exception handler with proper HTTP status codes
