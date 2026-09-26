@echo off
cd /d "%~dp0"
py -3 outils\serveur-local.py
if errorlevel 1 (
    echo Le serveur n'a pas pu demarrer. Python 3 est necessaire.
    pause
)
