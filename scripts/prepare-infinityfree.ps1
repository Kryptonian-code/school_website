$ErrorActionPreference = "Stop"


$repoRoot = Split-Path -Parent $PSScriptRoot
$distDir = Join-Path $repoRoot "dist"
$deployRoot = Join-Path $repoRoot "deploy\infinityfree"
$backendSource = Join-Path $repoRoot "backend"
$uploadsSource = Join-Path $repoRoot "uploads"
$deployHtaccess = Join-Path $repoRoot "scripts\templates\infinityfree-root.htaccess"


Write-Host "Building frontend..."
Push-Location $repoRoot
try {
    $env:VITE_APP_BASE_PATH = "/"
    $env:VITE_API_BASE_URL = "/backend"
    npm.cmd run build
} finally {
    Remove-Item Env:VITE_APP_BASE_PATH -ErrorAction SilentlyContinue
    Remove-Item Env:VITE_API_BASE_URL -ErrorAction SilentlyContinue
    Pop-Location
}


Write-Host "Preparing deployment folder..."
New-Item -ItemType Directory -Force -Path $deployRoot | Out-Null

# Clean previous deploy
if (Test-Path (Join-Path $deployRoot "*")) {
    Get-ChildItem -Force $deployRoot | Remove-Item -Recurse -Force
}

# Copy built frontend
Copy-Item (Join-Path $distDir "*") $deployRoot -Recurse -Force

# Copy backend (PHP)
Copy-Item $backendSource (Join-Path $deployRoot "backend") -Recurse -Force

# Copy uploads folder
Copy-Item $uploadsSource (Join-Path $deployRoot "uploads") -Recurse -Force

# Copy root .htaccess template
Copy-Item $deployHtaccess (Join-Path $deployRoot ".htaccess") -Force

# Copy robots.txt if exists
if (Test-Path (Join-Path $distDir "robots.txt")) {
    Copy-Item (Join-Path $distDir "robots.txt") (Join-Path $deployRoot "robots.txt") -Force
}

# Ensure SPA fallback exists for shared hosting rewrites
Copy-Item (Join-Path $distDir "index.html") (Join-Path $deployRoot "404.html") -Force

Write-Host ""
Write-Host "InfinityFree bundle ready:"
Write-Host "  $deployRoot"
Write-Host ""
Write-Host "Upload the contents of that folder to your InfinityFree public_html directory."

