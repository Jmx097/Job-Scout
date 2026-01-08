<#
.SYNOPSIS
    Automated Deployment Script for Job Scout (API + Web)
.DESCRIPTION
    Deploys the API to Google Cloud Run and the Web App to Vercel.
    Handles dependency order (API first) and automatic CORS configuration.
#>

$ErrorActionPreference = "Stop"

# --- Configuration ---
$ApiDir = "apps/api"
$WebDir = "apps/web"
$GcpRegion = "us-central1"
$ServiceName = "job-scout-api"

# --- Helper Functions ---
function Check-Command($cmd) {
    if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
        Write-Error "Command '$cmd' not found. Please install it and add to PATH."
    }
}

function Read-EnvFile($path) {
    if (-not (Test-Path $path)) {
        return @()
    }
    return Get-Content $path | Where-Object { $_ -match '^\w+=' } | ForEach-Object { $_.Trim() }
}

# --- Pre-flight Checks ---
Write-Host "Checking prerequisites..." -ForegroundColor Cyan
Check-Command "gcloud"
Check-Command "vercel"

if (-not (Test-Path "$ApiDir/.env")) {
    Write-Warning "File '$ApiDir/.env' not found. Creating from example..."
    if (Test-Path "$ApiDir/.env.production.example") {
        Copy-Item "$ApiDir/.env.production.example" "$ApiDir/.env"
    }
    Write-Error "Please edit '$ApiDir/.env' with your real secrets (Clerk keys, Encryption key) and re-run this script."
}

if (-not (Test-Path "$WebDir/.env")) {
    Write-Warning "File '$WebDir/.env' not found. Creating from example..."
    if (Test-Path "$WebDir/.env.production.example") {
        Copy-Item "$WebDir/.env.production.example" "$WebDir/.env"
    }
    # Vercel will prompt for env vars usually, but we want to be safe
    Write-Warning "Please ensure '$WebDir/.env' has your Clerk Public Key."
    Write-Host "Continuing, assuming you might set vars in Vercel UI..."
}

# --- Step 1: Deploy API to Cloud Run ---
Write-Host "`n[1/3] Deploying API to Google Cloud Run..." -ForegroundColor Cyan

# Parse .env vars for gcloud
$envContent = Read-EnvFile "$ApiDir/.env"
$ApiEnvVars = $envContent -join ","

Push-Location $ApiDir
try {
    # Build and Deploy
    # Note: We assume the user is logged in (gcloud auth login)
    $deployArgs = @(
        "run", "deploy", $ServiceName,
        "--source", ".",
        "--region", $GcpRegion,
        "--allow-unauthenticated",
        "--format", "value(status.url)"
    )
    
    # Only add set-env-vars if we actually have any
    if ($ApiEnvVars) {
        $deployArgs += "--set-env-vars", $ApiEnvVars
    }

    Write-Host "Running: gcloud $($deployArgs -join ' ')"
    $ApiUrl = & gcloud $deployArgs
    
    if (-not $ApiUrl) { throw "Failed to get API URL." }
    Write-Host "API Deployed successfully at: $ApiUrl" -ForegroundColor Green
}
finally {
    Pop-Location
}

# --- Step 2: Deploy Web to Vercel ---
Write-Host "`n[2/3] Deploying Web to Vercel..." -ForegroundColor Cyan

Push-Location $WebDir
try {
    # We pass the API URL as a build arg and env var
    # Vercel CLI interactive entry for first run
    $VercelArgs = @("--prod", "--build-env", "NEXT_PUBLIC_API_URL=$ApiUrl", "--env", "NEXT_PUBLIC_API_URL=$ApiUrl")
    
    Write-Host "Running: vercel $($VercelArgs -join ' ')"
    # Note: This might prompt for project setup on first run
    & vercel $VercelArgs
}
finally {
    Pop-Location
}

# --- Step 3: Update API CORS ---
Write-Host "`n[3/3] Updating API CORS settings..." -ForegroundColor Cyan

# Get the Vercel Production URL
# This is tricky as 'vercel --prod' doesn't output just the URL easily in a script without json parsing
# We ask the user to verify, or we can fetch it if we had the project name.
# For auto-deploy, we'll try to get it from the deployment we just did.
# Actually, Vercel CLI outputs the URL as the last line usually?
# Let's simple ask gcloud to allow all origins temporarily or rely on user to update.
# Better: Set CORS_ORIGINS to "*" for the automated script to ensure it works, then warn user.

Push-Location $ApiDir
try {
    Write-Warning "Setting API CORS_ORIGINS to '*' to ensure the new Frontend works."
    Write-Warning "For strict security, update this to your Vercel domain later."
    
    & gcloud run services update $ServiceName --region $GcpRegion --set-env-vars "CORS_ORIGINS=['*']"
}
finally {
    Pop-Location
}

Write-Host "`nDone! Your Job Scout app is deployed." -ForegroundColor Green
Write-Host "API: $ApiUrl"
