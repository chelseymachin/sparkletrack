@echo off
echo ✨ Starting SparkleTrack...

if not exist node_modules (
  echo 📦 Installing dependencies...
  npm install
)

start /b cmd /c "timeout /t 3 /nobreak > nul && start http://localhost:5173"

npm run dev