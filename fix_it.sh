#!/bin/bash

# A script to forcefully reset and correctly restart the Parka development environment.

echo "🚀 Starting the Parka Fix-It Script..."
echo "This will stop all related processes, start new ones, and configure them automatically."

# --- Step 1: Forcefully kill all old processes ---
echo "🛑 Terminating any running backend, frontend, or ngrok processes..."
lsof -t -i:10000 | xargs -r kill -9
pkill -9 -f "node server.js"
pkill -9 -f "ngrok http 10000"
pkill -9 -f "expo start"
echo "✅ Process cleanup complete."
echo ""

# --- Step 2: Clear all caches ---
echo "🗑️  Performing deep cache cleanup..."
# Clear Metro bundler cache
rm -rf $TMPDIR/metro-cache
# Clear Expo cache
rm -rf PARKA/frontend/.expo
echo "✅ Cache cleanup complete."
echo ""

# --- Step 3: Nuke and Reinstall Frontend Dependencies ---
echo "💣 Deleting frontend node_modules and package-lock.json to ensure a clean slate..."
rm -rf PARKA/frontend/node_modules
rm -f PARKA/frontend/package-lock.json
echo "✅ Deletion complete."
echo ""
echo "📦 Reinstalling all frontend dependencies from scratch. This might take a minute..."
npm install --prefix PARKA/frontend
echo "✅ Frontend dependencies reinstalled."
echo ""

# --- Step 4: Start Backend Server & ngrok in the background ---
echo "🚀 Starting backend server and ngrok tunnel..."
# We will use the 'dev' script which runs them concurrently
# and pipe the output to a log file so it runs in the background.
npm run dev --prefix PARKA/backend > parka_dev.log 2>&1 &
echo "✅ Backend and ngrok are starting in the background."
echo ""

# --- Step 5: Wait and get the new ngrok URL ---
echo "⏳ Waiting for ngrok to provide a new public URL... (This can take up to 15 seconds)"
sleep 15 # Give ngrok plenty of time to start and establish a tunnel

# Extract the URL from ngrok's local API
NGROK_URL=$(curl --silent http://127.0.0.1:4040/api/tunnels | grep -o 'https://[0-9a-zA-Z-]*\.ngrok-free\.app')

if [ -z "$NGROK_URL" ]; then
    echo "❌ CRITICAL ERROR: Could not get the ngrok URL."
    echo "Please check the 'parka_dev.log' file for errors and try running this script again."
    exit 1
fi

echo "✅ Success! New URL is: $NGROK_URL"
echo ""

# --- Step 6: Update the frontend's .env file ---
echo "✍️ Writing the new URL to the frontend's .env file..."
echo "EXPO_PUBLIC_BACKEND_URL=$NGROK_URL" > PARKA/frontend/.env
echo "✅ .env file is now configured."
echo ""

# --- Step 7: Start Frontend with a clean cache ---
echo "🚀 Starting the frontend Expo server..."
echo "This will open a new process. Your app should reload in the simulator shortly."
npm start --prefix PARKA/frontend -- --clear

echo ""
echo "🎉 All done! If the app doesn't reload, press 'r' in the terminal where Expo is running." 