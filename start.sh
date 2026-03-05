#!/bin/bash
echo "✨ Starting SparkleTrack..."

# Install dependencies if node_modules missing
if [ ! -d "node_modules" ]; then
  echo "📦 Installing dependencies..."
  npm install
fi

# Open browser after a short delay
(sleep 3 && open http://localhost:5173) &

# Start dev server
npm run dev