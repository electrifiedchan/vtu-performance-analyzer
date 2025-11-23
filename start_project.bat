@echo off
ECHO ===================================
ECHO  SGPA CALCULATOR - PROJECT STARTUP
ECHO  Designed by CHAN and Team
@echo off
ECHO ===================================
ECHO  SGPA CALCULATOR - PROJECT STARTUP
ECHO  Designed by CHAN and Team
ECHO ===================================
ECHO.

ECHO [1/2] Starting Flask Backend Server...
ECHO       URL: http://localhost:5000
ECHO.
START "SGPA Backend - Flask" cmd /k "cd backend && call .\venv\Scripts\activate && python app.py"
ECHO Backend:  http://localhost:5000
ECHO Frontend: http://localhost:3000
timeout /t 2 > nul
START "SGPA Frontend - React" cmd /k "cd frontend && npm start"
ECHO Both servers are running in separate windows.
ECHO Close those windows to stop the servers.
ECHO.
ECHO This window will close in 5 seconds...
timeout /t 5 > nul