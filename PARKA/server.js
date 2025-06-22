const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://USERNAME:PASSWORD@yourcluster.mongodb.net/parkadb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schemas
const ParkingSpotSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  address: String,
  spotType: { type: String, enum: ['street', 'lot', 'garage'], default: 'street' }
});

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSpot' }],
  createdAt: { type: Date, default: Date.now }
});

const ParkingSpot = mongoose.model('ParkingSpot', ParkingSpotSchema);
const User = mongoose.model('User', UserSchema);

// Routes
// Get nearby parking spots
app.get('/api/parking', async (req, res) => {
  try {
    const { lat, lng, radius = 0.01 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const spots = await ParkingSpot.find({
      lat: { $gte: parseFloat(lat) - radius, $lte: parseFloat(lat) + radius },
      lng: { $gte: parseFloat(lng) - radius, $lte: parseFloat(lng) + radius }
    });

    res.json(spots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add parking spot to favorites
app.post('/api/favorite', async (req, res) => {
  try {
    const { userId, spotId } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.favorites.includes(spotId)) {
      user.favorites.push(spotId);
      await user.save();
    }

    res.json({ message: 'Spot added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user favorites
app.get('/api/favorites/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or get user (for OAuth)
app.post('/api/auth/google', async (req, res) => {
  try {
    const { googleId, email, name } = req.body;
    
    let user = await User.findOne({ googleId });
    
    if (!user) {
      user = new User({ googleId, email, name });
      await user.save();
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
