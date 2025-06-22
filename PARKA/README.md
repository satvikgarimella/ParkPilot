# 🅿️ Parka - Toronto Parking Finder (React Native + Expo)

A complete mobile app to find and save parking spots in Toronto using Google Maps, Google OAuth, and MongoDB.

## 🚀 Quick Start

### Option 1: Automated Setup
\`\`\`bash
chmod +x setup.sh
./setup.sh
\`\`\`

### Option 2: Manual Setup

#### 1. Backend Setup
\`\`\`bash
cd backend
npm install
npm start
\`\`\`

#### 2. Seed Database
\`\`\`bash
node scripts/seed-database.js
\`\`\`

#### 3. Frontend Setup
\`\`\`bash
cd frontend
npm install
npx expo start --clear
\`\`\`

## 🔧 Environment Variables

### Frontend (.env)
\`\`\`env
EXPO_PUBLIC_BACKEND_URL=http://localhost:10000
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=223470665556-t3f8vltu3uvm7eog933jgrsnrlk30vml.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyApwIcecBvGRknwTVKK55yFjf-0W5fzb40
\`\`\`

### Backend (.env)
\`\`\`env
PORT=10000
MONGODB_URI=mongodb+srv://satvikgarimella2:2L8vcDL88XW5eUHp@parkpilot-cluster.ndxtde6.mongodb.net/parkadb?retryWrites=true&w=majority&appName=parkpilot-cluster
\`\`\`

## 📱 Features

✅ **Google OAuth Login** - Secure authentication  
✅ **Interactive Google Maps** - Real-time parking spots  
✅ **Dark/Light Theme** - Beautiful UI themes  
✅ **Favorites System** - Save parking spots  
✅ **Location Services** - GPS location tracking  
✅ **Bottom Tab Navigation** - Intuitive navigation  

## 🛠️ Tech Stack

- **Frontend**: React Native + Expo
- **Backend**: Node.js + Express + MongoDB
- **Maps**: Google Maps SDK
- **Auth**: Google OAuth 2.0
- **Database**: MongoDB Atlas

## 📂 Project Structure

\`\`\`
├── frontend/           # React Native Expo app
│   ├── App.js         # Main app entry
│   ├── screens/       # App screens
│   ├── contexts/      # React contexts
│   └── components/    # Reusable components
├── backend/           # Express.js API
│   └── server.js      # API server
├── scripts/           # Database scripts
└── setup.sh          # Automated setup
\`\`\`

## 🚨 Troubleshooting

### Environment Variables Not Loading
\`\`\`bash
# Make sure file is named exactly .env (not .env.local)
# Restart Expo with cache clear
cd frontend
npx expo start --clear
\`\`\`

### Backend Connection Issues
\`\`\`bash
# Check if backend is running
curl http://localhost:10000/api/health

# Restart backend
cd backend
npm start
\`\`\`

### Google Maps Not Loading
- Verify Google Maps API key is correct
- Check API key has Maps SDK enabled
- Ensure billing is enabled in Google Cloud Console

## 📞 API Endpoints

- `GET /api/health` - Health check
- `GET /api/parking` - Get nearby parking spots
- `POST /api/favorite` - Add to favorites
- `DELETE /api/favorite` - Remove from favorites
- `GET /api/favorites/:userId` - Get user favorites
- `POST /api/auth/google` - Google OAuth

## 🎯 Next Steps

1. **Test the app**: Follow setup instructions
2. **Add features**: Push notifications, payments
3. **Deploy**: Prepare for app store submission
4. **Scale**: Add more cities and features

## 📄 License

MIT License - Free to use for learning and development!
