@echo off
title CareerAI - Desktop App (Gemini 3.8 Flash)
cd /d "%~dp0"

echo ==========================================================
echo      Starting CareerAI Platform (Gemini 3.8 Flash)
echo ==========================================================
echo.

:: Check if Vite server is running on port 5174
netstat -ano | findstr :5174 | findstr LISTENING >nul
if %errorlevel% neq 0 (
  echo Launching local application engine on port 5174...
  start /min cmd /c "npm run dev"
  timeout /t 3 /nobreak >nul
)

:: Launch in native Standalone Window
echo Opening CareerAI in standalone window...
if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" (
  start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --app=http://localhost:5174/interview-ai
) else if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
  start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app=http://localhost:5174/interview-ai
) else (
  start http://localhost:5174/interview-ai
)
