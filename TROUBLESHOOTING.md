# Troubleshooting Guide

## Application Taking Too Long to Start

### First Time Running? (Normal)
- **First build takes 5-10 minutes** - This is normal!
- Maven is downloading all dependencies (Spring Boot, MongoDB driver, JWT, etc.)
- You'll see output like "Downloading..." messages
- **Just wait** - it will complete!

### Check if It's Actually Running

Look for these signs that it's working:
- Console shows "Downloading..." messages
- No error messages
- Eventually you'll see: "Started DealPipelineApplication"

### If It's Stuck (No Output for 15+ Minutes)

1. **Check MongoDB is running:**
   ```powershell
   Test-NetConnection -ComputerName localhost -Port 27017
   ```
   If it fails, start MongoDB first.

2. **Check Java process:**
   ```powershell
   Get-Process -Name java
   ```
   If you see a Java process, it's still working.

3. **Try with verbose output:**
   ```powershell
   .\mvnw.cmd spring-boot:run -X
   ```
   This shows detailed Maven output.

### Common Issues

#### Issue: "Port already in use"
- **Solution:** Already fixed - using port 8081 now
- Or change port in `application.yml`

#### Issue: "MongoDB connection failed"
- **Solution:** Start MongoDB service
- Or change MongoDB URI in `application.yml`

#### Issue: "Maven not found"
- **Solution:** Use `.\mvnw.cmd` instead of `mvn`
- Maven Wrapper is already set up

#### Issue: Build fails with errors
- Check Java version: `java -version` (should be 17+)
- Check if all files are saved
- Try: `.\mvnw.cmd clean install`

## Speed Up Subsequent Builds

After first build, dependencies are cached. To make it even faster:

1. **Skip tests during development:**
   ```powershell
   .\mvnw.cmd spring-boot:run -DskipTests
   ```

2. **Use Spring Boot DevTools** (already included):
   - Automatically restarts on code changes
   - Faster development cycle

## Expected Build Times

- **First build:** 5-10 minutes (downloading dependencies)
- **Subsequent builds:** 30 seconds - 2 minutes
- **With code changes only:** 10-30 seconds (DevTools hot reload)

## Still Having Issues?

1. Check the console output for specific error messages
2. Verify MongoDB is running
3. Check Java version (must be 17+)
4. Try: `.\mvnw.cmd clean spring-boot:run`
