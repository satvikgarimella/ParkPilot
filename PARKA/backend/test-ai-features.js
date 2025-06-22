const axios = require('axios');

const BASE_URL = 'http://localhost:10000';

// Test the AI Parking Assistant
async function testAIAssistant() {
  console.log('🤖 Testing AI Parking Assistant...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/ai-assistant`, {
      userQuery: "I need parking near the CN Tower for 2 hours this afternoon",
      userLocation: { lat: 43.6426, lng: -79.3871 },
      radius: 1000
    });
    
    console.log('✅ AI Response:', response.data.message);
    console.log('📍 Available spots:', response.data.parkingData.length);
  } catch (error) {
    console.error('❌ AI Assistant test failed:', error.response?.data || error.message);
  }
}

// Test the Smart Parking Predictor
async function testParkingPredictor() {
  console.log('\n🔮 Testing Smart Parking Predictor...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/predict-availability`, {
      spotId: 'downtown-001',
      timeOfDay: '14:00',
      dayOfWeek: 'Friday',
      weather: 'Sunny'
    });
    
    console.log('✅ Prediction:', response.data);
  } catch (error) {
    console.error('❌ Predictor test failed:', error.response?.data || error.message);
  }
}

// Test the Parking Quality Analyzer
async function testQualityAnalyzer() {
  console.log('\n⭐ Testing Parking Quality Analyzer...');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/analyze-quality`, {
      spotData: {
        address: "123 King Street West",
        price: 3.50,
        isAvailable: true,
        totalCapacity: 50,
        occupiedSpots: 30,
        spotType: "lot"
      },
      userPreferences: {
        maxPrice: 5.00,
        preferCovered: false,
        needAccessibility: false,
        safetyPriority: "high"
      }
    });
    
    console.log('✅ Quality Analysis:', response.data);
  } catch (error) {
    console.error('❌ Quality Analyzer test failed:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Testing Parka AI Features...\n');
  
  await testAIAssistant();
  await testParkingPredictor();
  await testQualityAnalyzer();
  
  console.log('\n✨ All AI feature tests completed!');
}

// Check if server is running first
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/api/health`);
    console.log('✅ Server is running, starting tests...\n');
    await runAllTests();
  } catch (error) {
    console.error('❌ Server is not running. Please start the server first:');
    console.log('   cd backend && npm start');
  }
}

checkServer(); 