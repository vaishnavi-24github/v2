# Command Reference

## ⚠️ Important: Use Maven Wrapper, NOT `mvn`

Since Maven is not installed globally, you **must** use the Maven Wrapper commands:

### ❌ DON'T USE:
```powershell
mvn spring-boot:run    # This will fail!
mvn clean package      # This will fail!
mvn -v                 # This will fail!
```

### ✅ USE INSTEAD:
```powershell
.\mvnw.cmd spring-boot:run    # ✅ Correct!
.\mvnw.cmd clean package      # ✅ Correct!
.\mvnw.cmd --version          # ✅ Correct!
```

## Common Commands

### Run the Application
```powershell
.\mvnw.cmd spring-boot:run
```

### Build the Project
```powershell
.\mvnw.cmd clean package
```

### Run Tests
```powershell
.\mvnw.cmd test
```

### Check Maven Version
```powershell
.\mvnw.cmd --version
```

### Clean Build (remove target directory)
```powershell
.\mvnw.cmd clean
```

### Install Dependencies
```powershell
.\mvnw.cmd install
```

## Quick Test

To verify the Maven Wrapper is working, run:
```powershell
.\mvnw.cmd --version
```

You should see output like:
```
Apache Maven 3.9.5 (...)
Maven home: C:\Users\AVM\.m2\wrapper\dists\...
Java version: 17.0.12, vendor: Oracle Corporation
```

## Troubleshooting

**Error: "mvn is not recognized"**
- ✅ Solution: Use `.\mvnw.cmd` instead of `mvn`
- The Maven Wrapper (`mvnw.cmd`) is already set up in this project
- No need to install Maven globally

**Error: "Cannot find mvnw.cmd"**
- Make sure you're in the project root directory
- The file should be at: `C:\Users\AVM\Desktop\New Project\mvnw.cmd`
