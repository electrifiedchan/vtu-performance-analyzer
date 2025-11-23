@echo off
ECHO ===================================
ECHO  SGPA CALCULATOR - MOBILE ACCESS
ECHO  Designed by CHAN and Team
ECHO ===================================
ECHO.

ECHO [1/3] Getting your local IP address...
ECHO.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4 Address"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP:~1%
ECHO Your Local IP: %IP%
ECHO.

ECHO [2/3] Starting Flask Backend Server...
ECHO       Local URL:   http://localhost:5000
ECHO       Network URL: http://%IP%:5000
ECHO.
START "SGPA Backend - Flask" cmd /k "cd backend && call .\venv\Scripts\activate && python app_mobile.py"

timeout /t 2 > nul

ECHO [3/3] Starting React Frontend Server...
ECHO       Local URL:   http://localhost:3000
ECHO       Network URL: http://%IP%:3000
ECHO.
START "SGPA Frontend - React" cmd /k "cd frontend && set HOST=0.0.0.0 && npm start"

ECHO.
ECHO ===================================
ECHO  SERVERS STARTED - MOBILE READY!
ECHO ===================================
ECHO.
ECHO Access from your computer:
ECHO   Backend:  http://localhost:5000
ECHO   Frontend: http://localhost:3000
ECHO.
ECHO Access from your mobile device (same WiFi):
ECHO   Frontend: http://%IP%:3000
ECHO   Backend:  http://%IP%:5000
ECHO.
ECHO IMPORTANT: Make sure your mobile device is on
ECHO            the same WiFi network as this computer!
ECHO.
ECHO Both servers are running in separate windows.
ECHO Close those windows to stop the servers.
ECHO.
PAUSE
