# Multi-stage Dockerfile for Spring Boot application
# Stage 1: Build stage
FROM eclipse-temurin:17-jdk-alpine AS build

# Set working directory
WORKDIR /app

# Install Maven
RUN apk add --no-cache maven

# Copy pom.xml first (for better layer caching)
COPY pom.xml .

# Copy Maven wrapper script (if it exists)
COPY mvnw* ./

# Generate Maven wrapper if .mvn doesn't exist (creates .mvn directory)
RUN if [ ! -d ".mvn" ]; then mvn wrapper:wrapper -B -Dmaven=3.9.0 || true; fi

# Make mvnw executable
RUN chmod +x ./mvnw || true

# Download dependencies (this layer will be cached if pom.xml doesn't change)
RUN ./mvnw dependency:go-offline -B || mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application (skip tests)
RUN ./mvnw clean package -DskipTests -B || mvn clean package -DskipTests -B

# Stage 2: Runtime stage
FROM eclipse-temurin:17-jre-alpine

# Set working directory
WORKDIR /app

# Copy the JAR from build stage
COPY --from=build /app/target/deal-pipeline-portal-1.0.0.jar app.jar

# Expose the application port
EXPOSE 8081

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
