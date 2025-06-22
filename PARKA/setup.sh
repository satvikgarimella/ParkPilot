#!/bin/bash

echo "🚀 Setting up Parka App..."

# Backend setup
echo "📦 Setting up backend..."
cd backend
npm install
echo "✅ Backend dependencies installed"

# Start backend in background
echo "🔄 Starting backend server..."
npm start &
BACKEND_PID=$!
echo "✅ Backend started on PID $BACKEND_PID"

# Wait for backend to start
sleep 3

# Seed database
echo "🌱 Seeding database..."
node ../scripts/seed-database.js
echo "✅ Database seeded"

# Frontend setup
echo "📱 Setting up frontend..."
cd ../frontend
npm install
echo "✅ Frontend dependencies installed"

# Install Expo CLI if not installed
if ! command -v expo &> /dev/null; then
    echo "📲 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "🎉 Setup complete!"
echo ""
echo "🔧 To start the app:"
echo "1. Backend is already running on http://localhost:10000"
echo "2. Start frontend: cd frontend && npm run start:clear"
echo "3. Scan QR code with Expo Go app"
echo ""
echo "🛑 To stop backend: kill $BACKEND_PID"
