# Installing Maven Globally (Optional)

## Should You Install Maven?

**Short answer:** You don't need to! The Maven Wrapper (`.\mvnw.cmd`) works perfectly fine.

**However, installing Maven globally allows you to:**
- Use `mvn` command directly instead of `.\mvnw.cmd`
- Slightly faster subsequent builds (minimal difference)
- Use Maven in other projects

**The first build is slow regardless** - it downloads all dependencies (5-10 minutes). This happens whether you use Maven Wrapper or installed Maven.

## Installation Steps (If You Want To)

### Option 1: Using Chocolatey (Recommended for Windows)

1. **Install Chocolatey** (if not already installed):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Install Maven**:
   ```powershell
   choco install maven
   ```

3. **Verify installation**:
   ```powershell
   mvn -v
   ```

### Option 2: Manual Installation

1. **Download Maven**:
   - Go to: https://maven.apache.org/download.cgi
   - Download: `apache-maven-3.9.5-bin.zip`

2. **Extract** to a folder (e.g., `C:\Program Files\Apache\maven`)

3. **Add to PATH**:
   - Open System Properties → Environment Variables
   - Add `C:\Program Files\Apache\maven\bin` to PATH
   - Or run in PowerShell:
     ```powershell
     [Environment]::SetEnvironmentVariable("Path", $env:Path + ";C:\Program Files\Apache\maven\bin", "User")
     ```

4. **Restart PowerShell** and verify:
   ```powershell
   mvn -v
   ```

## Recommendation

**Keep using the Maven Wrapper!** It's already set up and working. The first build is slow for everyone - it's downloading hundreds of MB of dependencies. After the first build, subsequent runs will be much faster.

## Why First Build is Slow

The first time you run `.\mvnw.cmd spring-boot:run`, it:
1. Downloads Maven itself (if not cached)
2. Downloads all Spring Boot dependencies (~200-300 MB)
3. Compiles your code
4. Starts the application

This is **normal** and happens with both Maven Wrapper and installed Maven.

## After First Build

Once dependencies are downloaded, they're cached in `C:\Users\AVM\.m2\repository`. Future builds will be much faster (30 seconds to 2 minutes).
