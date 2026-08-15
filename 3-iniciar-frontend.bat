@echo off
title Angular - Gestion Academica (puerto 4200)
cd /d "%~dp0frontend"

if not exist node_modules (
  echo Instalando dependencias por primera vez, esto puede tardar varios minutos...
  call npm install
)

echo ============================================
echo  Iniciando Angular. Se abrira el navegador en
echo  http://localhost:4200
echo  No cierres esta ventana mientras uses el proyecto.
echo ============================================
call npm start
pause
