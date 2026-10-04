@echo off
cd /d "%~dp0"
title Dossier Moi prive
py -3 outils\ouvrir_prive.py
if errorlevel 1 (
    echo Verifie securite.local.json et le message ci-dessus. Python 3 et cryptography sont necessaires.
    pause
)
