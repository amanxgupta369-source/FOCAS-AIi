@echo off
title FOCAS AI Local Server
cd /d "%~dp0focas-ai369"
echo ========================================================
echo Starting FOCAS AI Local Server...
echo Once started, open: http://localhost:5173
echo ========================================================
echo.
npm run dev
pause
