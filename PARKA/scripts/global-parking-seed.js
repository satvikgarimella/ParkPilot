const mongoose = require("mongoose")
require("dotenv").config()

// MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI ||
    "mongodb+srv://satvikgarimella2:2L8vcDL88XW5eUHp@parkpilot-cluster.ndxtde6.mongodb.net/parkadb?retryWrites=true&w=majority&appName=parkpilot-cluster",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)

// Parking Spot Schema
const ParkingSpotSchema = new mongoose.Schema({
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
  isAvailable: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  address: String,
  spotType: { type: String, enum: ["street", "lot", "garage"], default: "street" },
  price: { type: Number, default: 0 },
  city: { type: String, required: true },
  country: { type: String, required: true },
})

const ParkingSpot = mongoose.model("ParkingSpot", ParkingSpotSchema)

// Major cities in the USA and Canada
const cities = [
  // USA
  { name: "New York", country: "USA", lat: 40.7128, lng: -74.0060 },
  { name: "Los Angeles", country: "USA", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago", country: "USA", lat: 41.8781, lng: -87.6298 },
  { name: "Houston", country: "USA", lat: 29.7604, lng: -95.3698 },
  { name: "Phoenix", country: "USA", lat: 33.4484, lng: -112.0740 },
  { name: "Philadelphia", country: "USA", lat: 39.9526, lng: -75.1652 },
  { name: "San Antonio", country: "USA", lat: 29.4241, lng: -98.4936 },
  { name: "San Diego", country: "USA", lat: 32.7157, lng: -117.1611 },
  { name: "Dallas", country: "USA", lat: 32.7767, lng: -96.7970 },
  { name: "San Jose", country: "USA", lat: 37.3382, lng: -121.8863 },
  { name: "Austin", country: "USA", lat: 30.2672, lng: -97.7431 },
  { name: "Jacksonville", country: "USA", lat: 30.3322, lng: -81.6557 },
  { name: "Fort Worth", country: "USA", lat: 32.7555, lng: -97.3308 },
  { name: "Columbus", country: "USA", lat: 39.9612, lng: -82.9988 },
  { name: "Charlotte", country: "USA", lat: 35.2271, lng: -80.8431 },
  { name: "San Francisco", country: "USA", lat: 37.7749, lng: -122.4194 },
  { name: "Indianapolis", country: "USA", lat: 39.7684, lng: -86.1581 },
  { name: "Seattle", country: "USA", lat: 47.6062, lng: -122.3321 },
  { name: "Denver", country: "USA", lat: 39.7392, lng: -104.9903 },
  { name: "Washington, D.C.", country: "USA", lat: 38.9072, lng: -77.0369 },
  { name: "Boston", country: "USA", lat: 42.3601, lng: -71.0589 },
  { name: "El Paso", country: "USA", lat: 31.7619, lng: -106.4850 },
  { name: "Nashville", country: "USA", lat: 36.1627, lng: -86.7816 },
  { name: "Detroit", country: "USA", lat: 42.3314, lng: -83.0458 },
  { name: "Oklahoma City", country: "USA", lat: 35.4676, lng: -97.5164 },
  { name: "Portland", country: "USA", lat: 45.5051, lng: -122.6750 },
  { name: "Las Vegas", country: "USA", lat: 36.1699, lng: -115.1398 },
  { name: "Memphis", country: "USA", lat: 35.1495, lng: -90.0490 },
  { name: "Louisville", country: "USA", lat: 38.2527, lng: -85.7585 },
  { name: "Baltimore", country: "USA", lat: 39.2904, lng: -76.6122 },
  { name: "Milwaukee", country: "USA", lat: 43.0389, lng: -87.9065 },
  { name: "Albuquerque", country: "USA", lat: 35.0844, lng: -106.6504 },
  { name: "Tucson", country: "USA", lat: 32.2226, lng: -110.9747 },
  { name: "Fresno", country: "USA", lat: 36.7468, lng: -119.7726 },
  { name: "Sacramento", country: "USA", lat: 38.5816, lng: -121.4944 },
  { name: "Kansas City", country: "USA", lat: 39.0997, lng: -94.5786 },
  { name: "Mesa", country: "USA", lat: 33.4152, lng: -111.8315 },
  { name: "Atlanta", country: "USA", lat: 33.7490, lng: -84.3880 },
  { name: "Omaha", country: "USA", lat: 41.2565, lng: -95.9345 },
  { name: "Colorado Springs", country: "USA", lat: 38.8339, lng: -104.8214 },
  { name: "Raleigh", country: "USA", lat: 35.7796, lng: -78.6382 },
  { name: "Miami", country: "USA", lat: 25.7617, lng: -80.1918 },
  { name: "Long Beach", country: "USA", lat: 33.7701, lng: -118.1937 },
  { name: "Virginia Beach", country: "USA", lat: 36.8529, lng: -75.9780 },
  { name: "Oakland", country: "USA", lat: 37.8044, lng: -122.2712 },
  { name: "Minneapolis", country: "USA", lat: 44.9778, lng: -93.2650 },
  { name: "Tulsa", country: "USA", lat: 36.1540, lng: -95.9928 },
  { name: "Arlington", country: "USA", lat: 32.7357, lng: -97.1081 },
  { name: "Tampa", country: "USA", lat: 27.9506, lng: -82.4572 },
  { name: "New Orleans", country: "USA", lat: 29.9511, lng: -90.0715 },
  // Canada
  { name: "Toronto", country: "Canada", lat: 43.6532, lng: -79.3832 },
  { name: "Montreal", country: "Canada", lat: 45.5017, lng: -73.5673 },
  { name: "Vancouver", country: "Canada", lat: 49.2827, lng: -123.1207 },
  { name: "Calgary", country: "Canada", lat: 51.0447, lng: -114.0719 },
  { name: "Edmonton", country: "Canada", lat: 53.5461, lng: -113.4938 },
  { name: "Ottawa", country: "Canada", lat: 45.4215, lng: -75.6972 },
  { name: "Mississauga", country: "Canada", lat: 43.5890, lng: -79.6441 },
  { name: "Winnipeg", country: "Canada", lat: 49.8951, lng: -97.1384 },
  { name: "Quebec City", country: "Canada", lat: 46.8139, lng: -71.2080 },
  { name: "Hamilton", country: "Canada", lat: 43.2557, lng: -79.8711 },
  { name: "Brampton", country: "Canada", lat: 43.6833, lng: -79.7667 },
  { name: "Surrey", country: "Canada", lat: 49.1913, lng: -122.8490 },
  { name: "Halifax", country: "Canada", lat: 44.6488, lng: -63.5752 },
  { name: "Laval", country: "Canada", lat: 45.5762, lng: -73.7125 },
  { name: "London", country: "Canada", lat: 42.9849, lng: -81.2453 },
]

// Function to generate random availability
const getRandomAvailability = () => Math.random() > 0.3 // 70% chance of being available

// Function to add some random variation to coordinates
const addRandomOffset = (coord, maxOffset = 0.005) => {
  return coord + (Math.random() - 0.5) * maxOffset
}

// Function to seed parking data for all cities
const seedGlobalParkingData = async () => {
  try {
    console.log("🏙️ Starting parking data seeding for North America...")
    
    // Clear existing data
    await ParkingSpot.deleteMany({})
    console.log("🗑️ Cleared existing parking data")
    
    let totalSpots = 0
    
    for (const city of cities) {
      const citySpots = []
      
      // Generate random spots around the city center
      for (let i = 0; i < 50; i++) { // Generate 50 spots per city
        const randomLat = addRandomOffset(city.lat, 0.05) // Wider radius
        const randomLng = addRandomOffset(city.lng, 0.05) // Wider radius
        
        const spotTypes = ["street", "lot", "garage"]
        const randomType = spotTypes[Math.floor(Math.random() * spotTypes.length)]
        
        let basePrice = 2
        if (randomType === "garage") basePrice = 12
        else if (randomType === "lot") basePrice = 6
        
        const newSpot = new ParkingSpot({
          location: {
            type: 'Point',
            coordinates: [randomLng, randomLat] // IMPORTANT: GeoJSON is [longitude, latitude]
          },
          isAvailable: getRandomAvailability(),
          address: `${city.name} ${randomType} #${i + 1}`,
          spotType: randomType,
          price: basePrice + Math.floor(Math.random() * 8),
          city: city.name,
          country: city.country,
        });
        
        citySpots.push(newSpot)
      }
      
      // Insert all spots for this city
      await ParkingSpot.insertMany(citySpots)
      totalSpots += citySpots.length
      console.log(`✅ Added ${citySpots.length} parking spots for ${city.name}, ${city.country}`)
    }
    
    console.log(`🎉 Successfully seeded ${totalSpots} parking spots across ${cities.length} cities!`)
    
  } catch (error) {
    console.error("❌ Error seeding global parking data:", error)
  } finally {
    mongoose.connection.close()
    console.log("🔌 Database connection closed")
  }
}

// Run the seeding
seedGlobalParkingData() 