# Complete Docker Run Guide with Kafka

## Overview

This guide explains how to run the entire application stack using Docker Compose, including:
- MongoDB (Database)
- Zookeeper (Required for Kafka)
- Kafka (Message Broker)
- Spring Boot Backend (Your Application)

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)

## Step-by-Step Instructions

### Step 1: Stop Any Running Local Services

If you have the application running locally, stop it first:

```powershell
# Stop any processes on port 8081
netstat -ano | findstr :8081
# If any processes found, stop them:
# taskkill /PID <PID> /F
```

### Step 2: Navigate to Project Root

```powershell
cd "C:\Users\AVM\Desktop\New Project"
```

### Step 3: Start All Services with Docker Compose

**Single command to start everything:**

```powershell
docker-compose up --build
```

This command will:
1. ✅ Pull required Docker images (MongoDB, Zookeeper, Kafka)
2. ✅ Build your Spring Boot backend Docker image
3. ✅ Start MongoDB container
4. ✅ Start Zookeeper container (required for Kafka)
5. ✅ Start Kafka container
6. ✅ Wait for MongoDB to be healthy
7. ✅ Start Spring Boot backend container
8. ✅ Connect all services on the same Docker network

**To run in background (detached mode):**

```powershell
docker-compose up -d --build
```

### Step 4: Verify All Services Are Running

Check running containers:

```powershell
docker ps
```

You should see 4 containers:
- `deal-pipeline-mongo` (MongoDB)
- `deal-pipeline-zookeeper` (Zookeeper)
- `deal-pipeline-kafka` (Kafka)
- `deal-pipeline-backend` (Spring Boot)

### Step 5: Check Backend Logs

View backend startup logs:

```powershell
docker-compose logs -f backend
```

**Look for these success messages:**
- ✅ `Started DealPipelineApplication`
- ✅ `Monitor thread successfully connected to server` (MongoDB)
- ✅ `Starting KafkaMessageListenerContainer` (Kafka consumer)

### Step 6: Test the Application

**Test Login API in Postman:**

1. **URL:** `http://localhost:8081/api/auth/login`
2. **Method:** POST
3. **Headers:**
   - `Content-Type: application/json`
4. **Body:**
   ```json
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "username": "admin",
    "roles": ["ADMIN"]
  }
}
```

## Service Architecture

```
┌─────────────────┐
│   Postman/API   │
│  localhost:8081 │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Spring Boot    │
│    Backend      │◄──┐
│  (Port 8081)    │   │
└────────┬────────┘   │
         │            │
         │            │
    ┌────┴────┐  ┌───┴────┐
    │         │  │        │
    ▼         ▼  │        │
┌────────┐ ┌──────┐      │
│ MongoDB│ │ Kafka│       │
│ :27017 │ │ :9092│       │
└────────┘ └──┬───┘      │
              │           │
              ▼           │
         ┌─────────┐     │
         │Zookeeper│     │
         │  :2181  │     │
         └─────────┘     │
                        │
         ┌──────────────┘
         │
         │ (Publishes events)
         │
         ▼
    ┌──────────┐
    │  Kafka   │
    │ Consumer │
    │  (Logs)  │
    └──────────┘
```

## Useful Docker Commands

### View Logs

```powershell
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f kafka
docker-compose logs -f mongo

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Stop All Services

```powershell
docker-compose down
```

### Stop and Remove Volumes (Clean Start)

```powershell
docker-compose down -v
```

**⚠️ Warning:** This will delete all MongoDB data!

### Restart a Specific Service

```powershell
docker-compose restart backend
docker-compose restart kafka
```

### Rebuild and Restart

```powershell
docker-compose up --build -d
```

### Check Service Status

```powershell
docker-compose ps
```

## Verifying Kafka is Working

### Method 1: Check Backend Logs

After creating a deal or updating a deal stage, check logs:

```powershell
docker-compose logs backend | findstr "DEAL_CREATED\|DEAL_STAGE_CHANGED"
```

You should see:
```
INFO  DEAL_CREATED event published successfully. DealId: ..., Offset: ...
INFO  === DEAL_CREATED Event Received ===
```

### Method 2: Check Kafka Topics

```powershell
# List all topics
docker exec -it deal-pipeline-kafka kafka-topics.sh --list --bootstrap-server localhost:9092

# Consume messages from deal-created-topic
docker exec -it deal-pipeline-kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic deal-created-topic --from-beginning

# Consume messages from deal-stage-changed-topic
docker exec -it deal-pipeline-kafka kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic deal-stage-changed-topic --from-beginning
```

## Troubleshooting

### Issue: Backend won't start

**Check logs:**
```powershell
docker-compose logs backend
```

**Common issues:**
1. MongoDB not ready - wait a few seconds and restart backend
2. Kafka connection failed - check if Kafka container is running
3. Port 8081 already in use - stop local process or change port

### Issue: MongoDB connection failed

**Check MongoDB:**
```powershell
docker-compose logs mongo
docker ps | findstr mongo
```

**Restart MongoDB:**
```powershell
docker-compose restart mongo
```

### Issue: Kafka connection failed

**Check Kafka:**
```powershell
docker-compose logs kafka
docker ps | findstr kafka
```

**Check Zookeeper:**
```powershell
docker-compose logs zookeeper
docker ps | findstr zookeeper
```

**Restart Kafka:**
```powershell
docker-compose restart zookeeper kafka
```

### Issue: Port already in use

**Find and stop process:**
```powershell
# Find process
netstat -ano | findstr :8081
netstat -ano | findstr :27017
netstat -ano | findstr :9092

# Stop process (replace PID)
taskkill /PID <PID> /F
```

### Issue: Container keeps restarting

**Check logs:**
```powershell
docker-compose logs <service-name>
```

**Restart everything:**
```powershell
docker-compose down
docker-compose up --build
```

## Service URLs

When running in Docker, access services via:

- **Backend API:** `http://localhost:8081`
- **MongoDB:** `localhost:27017` (if connecting from host)
- **Kafka:** `localhost:9092` (if connecting from host)
- **Zookeeper:** `localhost:2181` (if connecting from host)

**Inside Docker network:**
- Backend → MongoDB: `mongo:27017`
- Backend → Kafka: `kafka:9092`
- Kafka → Zookeeper: `zookeeper:2181`

## Complete Startup Sequence

1. **MongoDB starts** → Waits for health check
2. **Zookeeper starts** → Required for Kafka
3. **Kafka starts** → Connects to Zookeeper
4. **Backend starts** → Waits for MongoDB to be healthy, then connects to MongoDB and Kafka

## Quick Reference

```powershell
# Start everything
docker-compose up --build

# Start in background
docker-compose up -d --build

# Stop everything
docker-compose down

# View logs
docker-compose logs -f backend

# Restart backend
docker-compose restart backend

# Clean restart (removes volumes)
docker-compose down -v
docker-compose up --build
```

## Summary

✅ **One command to start everything:** `docker-compose up --build`  
✅ **All services connected automatically**  
✅ **Kafka integrated and working**  
✅ **MongoDB data persisted in Docker volume**  
✅ **Backend accessible at:** `http://localhost:8081`
