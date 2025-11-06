@echo off
ECHO ===================================
ECHO  STARTING PROJECT SERVERS
ECHO ===================================

ECHO Starting Flask Backend Server (http://127.0.0.1:5000)...
:: This command opens a new window, gives it a title,
:: changes directory (cd) to backend,
:: activates the venv (call ...),
:: AND (&&) runs the python server.
:: /k keeps the window open so we can see logs.
START "Flask Backend" cmd /k "cd backend && call .\venv\Scripts\activate && python app.py"

ECHO Starting React Frontend Server (http://localhost:3000)...
:: This does the same for the frontend:
:: opens a new window, cds to frontend, and runs npm start.
START "React Frontend" cmd /k "cd frontend && npm start"

ECHO Servers are starting in new windows.
ECHO This window will now close.
timeout /t 3 > nul