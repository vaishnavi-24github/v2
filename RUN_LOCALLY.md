# Run Backend Locally (Without Docker)

## Quick Start

### Step 1: Start MongoDB

**Option A: MongoDB installed locally**
```powershell
# Start MongoDB service
net start MongoDB
# OR if running as process:
mongod
```

**Option B: MongoDB via Docker (just MongoDB, not full stack)**
```powershell
docker run -d -p 27017:27017 --name mongodb-local mongo:7
```

### Step 2: (Optional) Start Kafka via Docker

If you want to test Kafka events:
```powershell
# Start Zookeeper
docker run -d -p 2181:2181 --name zookeeper-local confluentinc/cp-zookeeper:7.5.0

# Start Kafka
docker run -d -p 9092:9092 --name kafka-local --link zookeeper-local -e KAFKA_ZOOKEEPER_CONNECT=zookeeper-local:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka:7.5.0
```

**OR skip Kafka** - Application will start without it (you'll see warnings but it works).

### Step 3: Verify Port 8081 is Free

```powershell
netstat -ano | findstr :8081
```

If port is in use, stop the process:
```powershell
taskkill /PID <PID> /F
```

### Step 4: Run Spring Boot Application

```powershell
cd "C:\Users\AVM\Desktop\New Project"
.\mvnw.cmd spring-boot:run
```

### Step 5: Wait for Startup

Look for this message in the console:
```
Started DealPipelineApplication
```

### Step 6: Test in Postman

**Login:**
- URL: `http://localhost:8081/api/auth/login`
- Method: POST
- Body:
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

## Verify Services are Running

**Check MongoDB:**
```powershell
Test-NetConnection -ComputerName localhost -Port 27017
```

**Check Kafka (if started):**
```powershell
docker ps | findstr kafka
```

## Configuration

Your `application.yml` is now configured for local development:
- MongoDB: `mongodb://localhost:27017/deal_pipeline_db`
- Kafka: `localhost:9092` (optional - app works without it)

## Troubleshooting

**Issue: "Port 8081 already in use"**
```powershell
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

**Issue: "MongoDB connection failed"**
- Make sure MongoDB is running on port 27017
- Check: `Test-NetConnection -ComputerName localhost -Port 27017`

**Issue: "Kafka connection failed"**
- This is OK - app will continue without Kafka
- Events just won't be published (you'll see warnings)

## Complete Command Sequence

```powershell
# 1. Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb-local mongo:7

# 2. (Optional) Start Kafka
docker run -d -p 2181:2181 --name zookeeper-local confluentinc/cp-zookeeper:7.5.0
docker run -d -p 9092:9092 --name kafka-local --link zookeeper-local -e KAFKA_ZOOKEEPER_CONNECT=zookeeper-local:2181 -e KAFKA_ADVERTISED_LISTENERS=PLAINTEXT://localhost:9092 -e KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR=1 confluentinc/cp-kafka:7.5.0

# 3. Make sure port 8081 is free
netstat -ano | findstr :8081

# 4. Run the application
cd "C:\Users\AVM\Desktop\New Project"
.\mvnw.cmd spring-boot:run
```
