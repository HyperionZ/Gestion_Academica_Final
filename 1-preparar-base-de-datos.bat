@echo off
title Preparar base de datos
cd /d "%~dp0mock-api"

if not exist .env (
  copy .env.example .env >nul
  echo Se creo el archivo mock-api\.env con la configuracion por defecto.
  echo.
  echo Se va a abrir en el Bloc de notas. Revisa las lineas DB_ADMIN_USER
  echo y DB_ADMIN_PASSWORD y ponles el usuario y la contrasena de tu MySQL.
  echo Guarda el archivo ^(Ctrl+S^), cierra el Bloc de notas, y vuelve a
  echo hacer doble clic en este mismo archivo .bat para continuar.
  echo.
  pause
  notepad .env
  exit /b
)

echo ============================================
echo  Instalando dependencias de la API...
echo ============================================
call npm install
if errorlevel 1 goto :error

echo.
echo ============================================
echo  Creando la base de datos y cargando los datos...
echo ============================================
call npm run db:init
if errorlevel 1 goto :error

echo.
echo Listo. La base de datos "gestion_academica" quedo creada y poblada.
echo Ahora puedes usar 2-iniciar-api.bat
echo.
pause
exit /b

:error
echo.
echo ============================================
echo  Algo fallo.
echo ============================================
echo Revisa que:
echo  1^) MySQL este encendido ^(ábrelo desde MySQL Workbench o los servicios de Windows^)
echo  2^) mock-api\.env tenga el usuario y la contrasena correctos
echo.
pause
