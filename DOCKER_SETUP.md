# Docker Setup Guide

This guide explains how to run both the backend and frontend using Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Run in detached mode (background):**
   ```bash
   docker-compose up -d --build
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Services

### Backend
- **Port:** 8081
- **URL:** http://localhost:8081
- **API Base:** http://localhost:8081/api
- **Container:** deal-pipeline-backend

### Frontend
- **Port:** 4200
- **URL:** http://localhost:4200
- **Container:** deal-pipeline-frontend

## Individual Service Commands

### Build only backend:
```bash
docker-compose build backend
```

### Build only frontend:
```bash
docker-compose build frontend
```

### Start only backend:
```bash
docker-compose up backend
```

### Start only frontend:
```bash
docker-compose up frontend
```

### View logs:
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Troubleshooting

### Port already in use
If port 8081 or 4200 is already in use:
1. Stop the service using the port
2. Or change the port mapping in `docker-compose.yml`

### Backend won't start
- Check MongoDB connection settings in `application.yml`
- Ensure MongoDB is running and accessible
- Check logs: `docker-compose logs backend`

### Frontend won't build
- Check Node.js version compatibility
- Clear build cache: `docker-compose build --no-cache frontend`

### Rebuild from scratch
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

## File Structure

```
.
├── Dockerfile                 # Backend Dockerfile
├── docker-compose.yml        # Docker Compose configuration
├── frontend/
│   ├── Dockerfile           # Frontend Dockerfile
│   └── nginx.conf           # Nginx configuration
└── src/                     # Backend source code
```

## Environment Configuration

The frontend is configured to call the backend at:
- **Development:** http://localhost:8081/api
- **Production:** http://localhost:8081/api

This is set in:
- `frontend/src/environments/environment.ts`
- `frontend/src/environments/environment.prod.ts`

## Network

Both services run on a bridge network (`app-network`) allowing them to communicate. The frontend depends on the backend and will wait for it to be ready.
