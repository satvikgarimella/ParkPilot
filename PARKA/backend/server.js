const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const bcrypt = require("bcrypt")
const axios = require("axios")
const NodeCache = require("node-cache")
const { GoogleGenerativeAI } = require("@google/generative-ai")
const fs = require("fs")
const path = require("path")

// Initialize Cache
// Cache results for 5 minutes
const cache = new NodeCache({ stdTTL: 300 })
cache.flushAll()
console.log("✅ Cache cleared on server startup")

const app = express()
const PORT = process.env.PORT || 10000

// Middleware
app.use(cors())
app.use(express.json())

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI ||
    "mongodb+srv://satvikgarimella2:2L8vcDL88XW5eUHp@parkpilot-cluster.ndxtde6.mongodb.net/parkadb?retryWrites=true&w=majority&appName=parkpilot-cluster",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)

// Add connection event listeners
mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB Atlas")
})

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err)
})

// Schemas
const ParkingSpotSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  isAvailable: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  address: String,
  spotType: { type: String, enum: ["street", "lot", "garage"], default: "street" },
  price: { type: Number, default: 0 },
  totalCapacity: { type: Number, default: 0 },
  occupiedSpots: { type: Number, default: 0 },
  city: { type: String, required: true },
  country: { type: String, required: true },
})

// Add a 2dsphere index for geospatial queries
ParkingSpotSchema.index({ location: '2dsphere' });

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: String,
  password: { type: String },
  picture: String,
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "ParkingSpot" }],
  createdAt: { type: Date, default: Date.now },
})

const ParkingSpot = mongoose.model("ParkingSpot", ParkingSpotSchema)
const User = mongoose.model("User", UserSchema)

// Function to convert file to generative part
function fileToGenerativePart(filePath, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType
    },
  };
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function runGeminiAnalysis(imagePath) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = `
    Analyze the provided image of a parking lot. Identify every parking space and categorize it as either 'empty' or 'car'.
    For each space, provide a bounding box as an array of four numbers [x_min, y_min, width, height].
    Additionally, provide a brief, one-sentence recommendation for the best area to park.
    Return ONLY a single, valid JSON object with the following structure:
    {
      "totalSpots": <number>,
      "openSpots": <number>,
      "spotDetails": [ { "box": [x, y, w, h], "label": "empty" | "car" } ],
      "aiExplanation": "<string>"
    }
  `;

  const imageParts = [
    fileToGenerativePart(imagePath, "image/png"),
  ];

  const result = await model.generateContent([prompt, ...imageParts]);
  const response = await result.response;
  const text = response.text();
  
  // Clean up the response to get only the JSON part
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
    return JSON.parse(jsonMatch[1]);
  }
  throw new Error("Failed to parse Gemini response.");
}

// Routes
// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Parka Backend is running!",
    mongodb: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
  })
})

// Get nearby parking spots
app.get("/api/parking", async (req, res) => {
  const { lat, lng, radius } = req.query;
  
  if (!lat || !lng) {
    return res.status(400).json({ error: "lat and lng are required" });
  }
  
  const cacheKey = `parking-${lat}-${lng}-${radius}`;
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    return res.json(cachedData);
  }

  try {
    // Return mock parking data instead of making external API calls
    const mockParkingData = [
      {
        id: 1,
        name: "Downtown Parking Garage",
        lat: parseFloat(lat) + 0.001,
        lng: parseFloat(lng) + 0.001,
        available: true,
        price: 5.00,
        distance: 0.1
      },
      {
        id: 2,
        name: "Street Parking - Market St",
        lat: parseFloat(lat) - 0.001,
        lng: parseFloat(lng) - 0.001,
        available: true,
        price: 2.50,
        distance: 0.2
      },
      {
        id: 3,
        name: "Public Lot A",
        lat: parseFloat(lat) + 0.002,
        lng: parseFloat(lng) - 0.002,
        available: false,
        price: 3.00,
        distance: 0.3
      },
      {
        id: 4,
        name: "Shopping Center Parking",
        lat: parseFloat(lat) - 0.002,
        lng: parseFloat(lng) + 0.002,
        available: true,
        price: 4.00,
        distance: 0.4
      }
    ];

    cache.set(cacheKey, mockParkingData);
    res.json({
      success: true,
      data: mockParkingData,
      count: mockParkingData.length
    });
  } catch (error) {
    console.error('Parking API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch parking data',
      details: error.message 
    });
  }
});

// Geocode endpoint for search
app.get("/api/geocode", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Address is required." });
  }

  const cacheKey = `geocode-address-${address}`;
  const cachedCoords = cache.get(cacheKey);
  if (cachedCoords) {
    return res.json(cachedCoords);
  }

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      const coords = { lat, lng };
      cache.set(cacheKey, coords);
      return res.json(coords);
    } else {
      return res.status(404).json({ error: "Location not found." });
    }
  } catch (error) {
    console.error("Error with Google Geocoding API:", error);
    return res.status(500).json({ error: "Failed to fetch coordinates." });
  }
});

// Reverse geocode endpoint
app.get("/api/reverse-geocode", async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: "Latitude and longitude are required." });
  }

  const cacheKey = `geocode-${lat}-${lng}`;
  const cachedAddress = cache.get(cacheKey);
  if (cachedAddress) {
    return res.json({ address: cachedAddress });
  }

  try {
    const response = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", {
      params: {
        latlng: `${lat},${lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.results && response.data.results.length > 0) {
      const address = response.data.results[0].formatted_address;
      cache.set(cacheKey, address);
      return res.json({ address });
    } else {
      return res.status(404).json({ error: "Address not found." });
    }
  } catch (error) {
    console.error("Error with Google Geocoding API:", error);
    return res.status(500).json({ error: "Failed to fetch address." });
  }
});

// Add parking spot to favorites
app.post("/api/favorite", async (req, res) => {
  try {
    const { userId, spotId } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    if (!user.favorites.includes(spotId)) {
      user.favorites.push(spotId)
      await user.save()
    }

    res.json({ message: "Spot added to favorites", user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Remove from favorites
app.delete("/api/favorite", async (req, res) => {
  try {
    const { userId, spotId } = req.body

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    user.favorites = user.favorites.filter((fav) => fav && fav.toString() !== spotId)
    await user.save()

    res.json({ message: "Spot removed from favorites", user })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get user favorites
app.get("/api/favorites/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).populate("favorites")
    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user.favorites)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create or get user (for OAuth)
app.post("/api/auth/google", async (req, res) => {
  try {
    const { googleId, email, name, picture } = req.body

    let user = await User.findOne({ googleId })

    if (!user) {
      user = new User({ googleId, email, name, picture })
      await user.save()
    } else {
      // Update user info
      user.name = name
      user.picture = picture
      await user.save()
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Register a new user with email and password
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const newUser = new User({ email, name, password: hashedPassword })
    await newUser.save()

    res.status(201).json({
      _id: newUser._id,
      email: newUser.email,
      name: newUser.name,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Login a user with email and password
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user || !user.password) {
      return res.status(401).json({ error: "Invalid credentials or user does not have a password." })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" })
    }

    res.json({
      _id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      favorites: user.favorites,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Seed some sample parking spots for Toronto
app.post("/api/seed", async (req, res) => {
  try {
    const sampleSpots = [
      { lat: 43.6532, lng: -79.3832, isAvailable: true, address: "Downtown Toronto", spotType: "street" },
      { lat: 43.6426, lng: -79.3871, isAvailable: false, address: "King Street West", spotType: "lot" },
      { lat: 43.6629, lng: -79.3957, isAvailable: true, address: "University Avenue", spotType: "garage" },
      { lat: 43.6481, lng: -79.3708, isAvailable: true, address: "Distillery District", spotType: "street" },
      { lat: 43.6677, lng: -79.4163, isAvailable: false, address: "Kensington Market", spotType: "street" },
    ]

    await ParkingSpot.deleteMany({})
    await ParkingSpot.insertMany(sampleSpots)

    res.json({ message: "Sample parking spots created", count: sampleSpots.length })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.get("/api/analyze-lot/:imageName", async (req, res) => {
  const { imageName } = req.params;
  const imagePath = path.join(__dirname, `../frontend/assets/lots/sf_lots/images/${imageName}`);
  
  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Image not found." });
  }

  try {
    const cachedData = cache.get(imageName);
    if (cachedData) {
      console.log(`Returning cached data for ${imageName}`);
      return res.status(200).json(cachedData);
    }

    console.log(`Analyzing ${imageName} with Gemini...`);
    const analysisResult = await runGeminiAnalysis(imagePath);
    cache.set(imageName, analysisResult);
    
    res.status(200).json(analysisResult);
  } catch (error) {
    console.error("Error analyzing image with Gemini:", error);
    res.status(500).json({ error: "Failed to analyze image." });
  }
});

// AI Parking Assistant - Conversational AI for parking help
app.post("/api/ai-assistant", async (req, res) => {
  try {
    const { userQuery, userLocation, radius = 1000 } = req.body;
    
    if (!userQuery || !userLocation) {
      return res.status(400).json({ error: "User query and location are required" });
    }

    // Get nearby parking data first
    const parkingResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/parking`, {
      params: {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: radius
      }
    });

    // Handle the new response format with nested data
    const parkingData = parkingResponse.data.data || parkingResponse.data;
    const parkingSpots = Array.isArray(parkingData) ? parkingData : [];
    
    // Create context for Gemini
    const parkingContext = parkingSpots.map(spot => ({
      name: spot.name || spot.address || 'Unknown Location',
      isAvailable: spot.available || spot.isAvailable || false,
      price: spot.price || 0,
      distance: spot.distance || "unknown",
      lat: spot.lat,
      lng: spot.lng
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const prompt = `
    You are a helpful parking assistant for the Parka app in San Francisco. 
    
    Current parking situation near the user (${userLocation.lat}, ${userLocation.lng}):
    ${JSON.stringify(parkingContext, null, 2)}
    
    User query: "${userQuery}"
    
    Please provide a helpful, conversational response that:
    1. Directly answers their parking question
    2. Mentions specific available spots if relevant
    3. Gives practical advice (price, distance, availability)
    4. Keeps it friendly and concise (max 2-3 sentences)
    5. If no spots are available, suggest alternatives or timing
    
    Respond naturally as if you're a helpful local parking expert.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    res.json({
      message: aiResponse,
      parkingData: parkingSpots,
      query: userQuery
    });

  } catch (error) {
    console.error("Error with AI Parking Assistant:", error);
    res.status(500).json({ error: "Failed to get AI assistance" });
  }
});

// Smart Parking Predictor - Predict availability based on patterns
app.post("/api/predict-availability", async (req, res) => {
  try {
    const { spotId, timeOfDay, dayOfWeek, weather } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const prompt = `
    As a parking prediction expert, analyze the following factors to predict parking availability:
    
    - Time of day: ${timeOfDay}
    - Day of week: ${dayOfWeek}
    - Weather conditions: ${weather || 'unknown'}
    - Location: San Francisco Bay Area
    
    Based on typical parking patterns in San Francisco, provide:
    1. Availability probability (0-100%)
    2. Best time to arrive
    3. Alternative suggestions
    4. Confidence level in prediction
    
    Return as JSON:
    {
      "availabilityProbability": number,
      "bestTimeToArrive": "string",
      "alternatives": ["string"],
      "confidence": "high|medium|low",
      "reasoning": "string"
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const prediction = JSON.parse(jsonMatch[0]);
      res.json(prediction);
    } else {
      throw new Error("Failed to parse prediction response");
    }

  } catch (error) {
    console.error("Error with parking prediction:", error);
    res.status(500).json({ error: "Failed to predict availability" });
  }
});

// Visual Parking Validation - Analyze user-uploaded parking photos
app.post("/api/validate-parking", async (req, res) => {
  try {
    const { imageBase64, userLocation, spotDescription } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });
    
    const prompt = `
    Analyze this parking spot image and provide detailed information about:
    
    1. **Availability**: Is this parking spot currently available/empty?
    2. **Restrictions**: Any signs, meters, time limits, or restrictions visible?
    3. **Spot Type**: Street parking, lot, garage, handicap, etc.
    4. **Safety**: Well-lit, visible, safe area?
    5. **Accessibility**: Easy to access, good for different vehicle types?
    
    User location context: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : 'Unknown'}
    Spot description: ${spotDescription || 'Not provided'}
    
    Return ONLY a valid JSON object:
    {
      "isAvailable": boolean,
      "restrictions": ["string"],
      "spotType": "string",
      "safetyScore": number (1-10),
      "accessibilityScore": number (1-10),
      "confidence": "high|medium|low",
      "recommendation": "string",
      "warnings": ["string"]
    }
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg"
      }
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const validation = JSON.parse(jsonMatch[0]);
      
      // Cache the validation result
      const cacheKey = `validation-${Date.now()}`;
      cache.set(cacheKey, validation, 300); // Cache for 5 minutes
      
      res.json({
        ...validation,
        cacheKey,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error("Failed to parse validation response");
    }

  } catch (error) {
    console.error("Error with parking validation:", error);
    res.status(500).json({ error: "Failed to validate parking spot" });
  }
});

// Parking Spot Quality Analyzer - Rate parking spots based on multiple factors
app.post("/api/analyze-quality", async (req, res) => {
  try {
    const { spotData, userPreferences } = req.body;
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
    
    const prompt = `
    As a parking quality expert, analyze this parking spot and rate it based on user preferences:
    
    Spot Data: ${JSON.stringify(spotData, null, 2)}
    User Preferences: ${JSON.stringify(userPreferences, null, 2)}
    
    Provide a comprehensive quality analysis including:
    1. Overall rating (1-10)
    2. Price value rating
    3. Convenience rating
    4. Safety rating
    5. Accessibility rating
    6. Specific pros and cons
    7. Recommendations for this user
    
    Return as JSON:
    {
      "overallRating": number,
      "priceValue": number,
      "convenience": number,
      "safety": number,
      "accessibility": number,
      "pros": ["string"],
      "cons": ["string"],
      "recommendation": "string",
      "matchScore": number (0-100)
    }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      res.json(analysis);
    } else {
      throw new Error("Failed to parse quality analysis");
    }

  } catch (error) {
    console.error("Error with quality analysis:", error);
    res.status(500).json({ error: "Failed to analyze parking quality" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
