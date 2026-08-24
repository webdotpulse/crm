@echo off
REM ==============================================================================
REM PulseWork CRM & Peppol Work Management Suite - Windows Installer
REM ==============================================================================

echo ==============================================================================
echo   PulseWork Work Management, CRM & Peppol E-Invoicing Suite - Windows Installer
echo ==============================================================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed on this machine!
    echo Please download and install Node.js (v18 or higher) from https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js detected:
node -v
echo [INFO] npm detected:
npm -v
echo.

echo [INFO] Step 1: Installing npm dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)
echo [SUCCESS] Dependencies installed!
echo.

echo [INFO] Step 2: Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Production build failed!
    pause
    exit /b 1
)
echo [SUCCESS] Production assets built in ./dist/
echo.

echo ==============================================================================
echo   PulseWork Installation Complete!
echo ==============================================================================
echo.
echo To start development server:
echo   npm run dev
echo.
echo To start production server:
echo   npm run preview
echo.
pause
