// Script to seed the database with sample parking spots
const mongoose = require("mongoose")

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://satvikgarimella2:2L8vcDL88XW5eUHp@parkpilot-cluster.ndxtde6.mongodb.net/parkadb?retryWrites=true&w=majority&appName=parkpilot-cluster",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
)

mongoose.connection.on("connected", () => {
  console.log("✅ Connected to MongoDB Atlas for seeding")
})

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err)
  process.exit(1)
})

const ParkingSpotSchema = new mongoose.Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  isAvailable: { type: Boolean, default: true },
  lastUpdated: { type: Date, default: Date.now },
  address: String,
  spotType: { type: String, enum: ["street", "lot", "garage"], default: "street" },
  price: { type: Number, default: 0 },
})

const ParkingSpot = mongoose.model("ParkingSpot", ParkingSpotSchema)

async function seedDatabase() {
  try {
    // Clear existing spots
    await ParkingSpot.deleteMany({})

    // Toronto parking spots
    const torontoSpots = [
      {
        lat: 43.6532,
        lng: -79.3832,
        isAvailable: true,
        address: "Downtown Toronto - King St",
        spotType: "street",
        price: 4,
      },
      { lat: 43.6426, lng: -79.3871, isAvailable: false, address: "King Street West", spotType: "lot", price: 6 },
      { lat: 43.6629, lng: -79.3957, isAvailable: true, address: "University Avenue", spotType: "garage", price: 8 },
      { lat: 43.6481, lng: -79.3708, isAvailable: true, address: "Distillery District", spotType: "street", price: 3 },
      { lat: 43.6677, lng: -79.4163, isAvailable: false, address: "Kensington Market", spotType: "street", price: 2 },
      { lat: 43.651, lng: -79.347, isAvailable: true, address: "St. Lawrence Market", spotType: "lot", price: 5 },
      { lat: 43.6634, lng: -79.389, isAvailable: true, address: "Queen Street West", spotType: "street", price: 4 },
      { lat: 43.6555, lng: -79.3626, isAvailable: false, address: "Financial District", spotType: "garage", price: 10 },
      { lat: 43.6708, lng: -79.3899, isAvailable: true, address: "Chinatown", spotType: "street", price: 3 },
      { lat: 43.6596, lng: -79.3977, isAvailable: true, address: "Entertainment District", spotType: "lot", price: 7 },
      { lat: 43.6465, lng: -79.389, isAvailable: false, address: "Liberty Village", spotType: "street", price: 4 },
      { lat: 43.6618, lng: -79.4107, isAvailable: true, address: "Trinity Bellwoods", spotType: "street", price: 2 },
      { lat: 43.657, lng: -79.3756, isAvailable: true, address: "Church-Wellesley", spotType: "garage", price: 6 },
      { lat: 43.665, lng: -79.3805, isAvailable: false, address: "Ryerson University", spotType: "lot", price: 5 },
      { lat: 43.659, lng: -79.3912, isAvailable: true, address: "Fashion District", spotType: "street", price: 4 },
    ]

    const sfSpots = [
      // Downtown / SoMa
      { lat: 37.7749, lng: -122.4194, isAvailable: true, address: "Civic Center Plaza Garage", spotType: "garage", price: 5, },
      { lat: 37.788, lng: -122.4074, isAvailable: false, address: "Union Square - Stockton St", spotType: "garage", price: 12, },
      { lat: 37.7858, lng: -122.4064, isAvailable: true, address: "Powell Street Station Garage", spotType: "garage", price: 10, },
      { lat: 37.791, lng: -122.408, isAvailable: true, address: "Financial District - Pine St", spotType: "garage", price: 14, },
      { lat: 37.782, lng: -122.39, isAvailable: true, address: "Oracle Park Lot A", spotType: "lot", price: 20, },
      { lat: 37.779, lng: -122.39, isAvailable: false, address: "Chase Center Lot", spotType: "lot", price: 25, },

      // Northern Waterfront
      { lat: 37.7954, lng: -122.3934, isAvailable: true, address: "Ferry Building Lot", spotType: "lot", price: 8, },
      { lat: 37.8078, lng: -122.4177, isAvailable: false, address: "Fisherman's Wharf - Pier 39", spotType: "lot", price: 15, },
      { lat: 37.805, lng: -122.42, isAvailable: true, address: "Ghirardelli Square Garage", spotType: "garage", price: 18, },
      { lat: 37.808, lng: -122.41, isAvailable: true, address: "North Beach - Columbus Ave", spotType: "street", price: 4, },

      // Western Neighborhoods
      { lat: 37.7786, lng: -122.439, isAvailable: true, address: "Alamo Square - Hayes St", spotType: "street", price: 3, },
      { lat: 37.783, lng: -122.443, isAvailable: true, address: "Japantown - Post St", spotType: "garage", price: 6, },
      { lat: 37.7694, lng: -122.4862, isAvailable: true, address: "Golden Gate Park - Fulton St", spotType: "street", price: 1.5, },
      { lat: 37.787, lng: -122.457, isAvailable: true, address: "Presidio - Lincoln Blvd", spotType: "lot", price: 5, },
      
      // Central/Southern Neighborhoods
      { lat: 37.7599, lng: -122.4352, isAvailable: true, address: "The Castro - 18th St", spotType: "street", price: 2.5, },
      { lat: 37.7614, lng: -122.4243, isAvailable: false, address: "Mission Dolores Park", spotType: "street", price: 2, },
      { lat: 37.751, lng: -122.419, isAvailable: true, address: "24th Street Mission", spotType: "street", price: 2.5, },
      { lat: 37.774, lng: -122.45, isAvailable: false, address: "Haight-Ashbury", spotType: "street", price: 2, },
      { lat: 37.795, lng: -122.422, isAvailable: false, address: "Polk Street", spotType: "street", price: 3, },
      
      // Far South/West
      { lat: 37.733, lng: -122.479, isAvailable: false, address: "SFSU - Holloway Ave", spotType: "garage", price: 8, },
      { lat: 37.721, lng: -122.478, isAvailable: true, address: "Stonestown Galleria", spotType: "lot", price: 0, }
    ]

    // Insert spots
    await ParkingSpot.insertMany([...torontoSpots, ...sfSpots])

    console.log(`✅ Successfully seeded ${torontoSpots.length + sfSpots.length} parking spots!`)
    console.log("Sample spots created in Toronto and San Francisco areas")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error seeding database:", error)
    process.exit(1)
  }
}

seedDatabase()
