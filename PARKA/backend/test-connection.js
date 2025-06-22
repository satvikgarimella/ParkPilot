const mongoose = require("mongoose")

// Test MongoDB connection
async function testConnection() {
  try {
    console.log("🔄 Testing MongoDB connection...")

    await mongoose.connect(
      "mongodb+srv://satvikgarimella2:2L8vcDL88XW5eUHp@parkpilot-cluster.ndxtde6.mongodb.net/parkadb?retryWrites=true&w=majority&appName=parkpilot-cluster",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      },
    )

    console.log("✅ Successfully connected to MongoDB Atlas!")
    console.log("Database:", mongoose.connection.name)
    console.log("Host:", mongoose.connection.host)

    // Test creating a simple document
    const TestSchema = new mongoose.Schema({
      message: String,
      timestamp: { type: Date, default: Date.now },
    })

    const Test = mongoose.model("Test", TestSchema)

    const testDoc = new Test({ message: "Parka backend test successful!" })
    await testDoc.save()

    console.log("✅ Test document created successfully!")

    // Clean up
    await Test.deleteOne({ _id: testDoc._id })
    console.log("✅ Test document cleaned up!")

    await mongoose.connection.close()
    console.log("✅ Connection closed successfully!")
  } catch (error) {
    console.error("❌ Connection test failed:", error.message)
    process.exit(1)
  }
}

testConnection()
