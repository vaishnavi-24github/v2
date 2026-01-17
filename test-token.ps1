# PowerShell Script to Test JWT Token
# Usage: .\test-token.ps1 -Token "YOUR_TOKEN_HERE"

param(
    [Parameter(Mandatory=$false)]
    [string]$Token,
    
    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:8081"
)

Write-Host "=== JWT Token Verification Tool ===" -ForegroundColor Cyan
Write-Host ""

# If no token provided, try to login first
if ([string]::IsNullOrEmpty($Token)) {
    Write-Host "No token provided. Attempting to login..." -ForegroundColor Yellow
    Write-Host "Enter username: " -NoNewline
    $username = Read-Host
    Write-Host "Enter password: " -NoNewline -ForegroundColor Black -BackgroundColor Black
    $password = Read-Host -AsSecureString
    $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($plainPassword))
    
    $loginBody = @{
        username = $username
        password = $plainPassword
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "$BaseUrl/api/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $loginBody
        
        $Token = $loginResponse.data.token
        Write-Host "Login successful! Token obtained." -ForegroundColor Green
        Write-Host ""
    } catch {
        Write-Host "Login failed: $_" -ForegroundColor Red
        exit 1
    }
}

# Verify token
Write-Host "Verifying token..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $Token"
    "Content-Type" = "application/json"
}

try {
    $verifyResponse = Invoke-RestMethod -Uri "$BaseUrl/api/token/verify" `
        -Method Get `
        -Headers $headers
    
    Write-Host "`n=== Token Information ===" -ForegroundColor Green
    Write-Host "Valid: " -NoNewline
    if ($verifyResponse.data.valid) {
        Write-Host "YES" -ForegroundColor Green
    } else {
        Write-Host "NO" -ForegroundColor Red
    }
    
    Write-Host "Username: $($verifyResponse.data.username)" -ForegroundColor Cyan
    Write-Host "Roles: $($verifyResponse.data.roles -join ', ')" -ForegroundColor Cyan
    Write-Host "Expires At: $($verifyResponse.data.expiresAt)" -ForegroundColor Cyan
    Write-Host "Expires In: $($verifyResponse.data.expiresIn)" -ForegroundColor Cyan
    Write-Host "Is Expired: $($verifyResponse.data.isExpired)" -ForegroundColor $(if ($verifyResponse.data.isExpired) { "Red" } else { "Green" })
    
    Write-Host "`n=== Full Response ===" -ForegroundColor Green
    $verifyResponse | ConvertTo-Json -Depth 10
    
} catch {
    Write-Host "`nError verifying token: $_" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n=== Test Protected Endpoint ===" -ForegroundColor Yellow
try {
    $dealsResponse = Invoke-RestMethod -Uri "$BaseUrl/api/deals" `
        -Method Get `
        -Headers $headers
    
    Write-Host "Successfully accessed protected endpoint!" -ForegroundColor Green
    Write-Host "Deals count: $($dealsResponse.data.Count)" -ForegroundColor Cyan
} catch {
    Write-Host "Failed to access protected endpoint: $_" -ForegroundColor Red
}
