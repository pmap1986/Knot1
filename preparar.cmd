@echo off
rem Doble clic: deja una terminal lista para correr las pruebas. No pide administrador.
set "PS1=%~dp0scripts\preparar-playwright.ps1"
powershell -NoProfile -NoExit -ExecutionPolicy Bypass -Command ". $env:PS1"
