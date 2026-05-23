@echo off
title yuanjiaxiang-dev

echo.
echo  ===================================
echo   yuanjiaxiang 2050  dev launcher
echo  ===================================
echo.

:: check node
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org
  pause & exit /b 1
)

:: kill old processes on 3001 / 5173
echo [1/3] Clearing old processes...
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":3001 " ^| findstr LISTENING') do (
  taskkill /PID %%p /F >nul 2>&1
)
for /f "tokens=5" %%p in ('netstat -ano 2^>nul ^| findstr ":5173 " ^| findstr LISTENING') do (
  taskkill /PID %%p /F >nul 2>&1
)

:: start backend
echo [2/3] Starting backend  (port 3001)...
start "backend-3001" cmd /k "cd /d %~dp0backend && npm run dev"

:: wait for backend
set retries=0
:wait_backend
timeout /t 1 /nobreak >nul
curl -s http://localhost:3001/api/spaces >nul 2>&1
if errorlevel 1 (
  set /a retries+=1
  if %retries% lss 15 goto wait_backend
  echo [WARN] Backend timeout, continuing anyway...
) else (
  echo [OK]   Backend ready
)

:: start frontend
echo [3/3] Starting frontend (port 5173)...
start "frontend-5173" cmd /k "cd /d %~dp0frontend && npm run dev"

:: wait for frontend
set retries=0
:wait_frontend
timeout /t 1 /nobreak >nul
curl -s http://localhost:5173 >nul 2>&1
if errorlevel 1 (
  set /a retries+=1
  if %retries% lss 20 goto wait_frontend
  echo [WARN] Frontend timeout - open browser manually
  goto done
)

echo [OK]   Frontend ready
echo.
echo  -----------------------------------
echo   Map     http://localhost:5173/
echo   Space   http://localhost:5173/space/xiaomeizhuang
echo   Debug   http://localhost:5173/chat?slug=xiaomei
echo   API     http://localhost:3001/api/spaces
echo  -----------------------------------
echo.

:: open browser
start http://localhost:5173/

:done
echo  Close the two cmd windows to stop services.
echo.
pause
