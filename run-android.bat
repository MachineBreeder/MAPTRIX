@echo off
echo Starting Korea Explorer Android App...
echo.

echo Checking if Metro is running...
tasklist /fi "imagename eq node.exe" | find "node.exe" > nul
if %errorlevel% == 0 (
    echo Metro bundler is already running
) else (
    echo Starting Metro bundler...
    start cmd /k "npm start"
    timeout /t 3
)

echo.
echo Running Android app...
npx react-native run-android

echo.
echo If build fails, try:
echo 1. cd android && ./gradlew clean
echo 2. npm run android
echo.
pause