@echo off
title API - Gestion Academica (puerto 3000)
cd /d "%~dp0mock-api"

if not exist .env (
  echo Falta el archivo mock-api\.env
  echo Ejecuta primero 1-preparar-base-de-datos.bat
  echo.
  pause
  exit /b
)

if not exist node_modules (
  echo Instalando dependencias por primera vez...
  call npm install
)

echo ============================================
echo  Iniciando la API en http://localhost:3000/api
echo  No cierres esta ventana mientras uses el proyecto.
echo ============================================
call npm start
pause
