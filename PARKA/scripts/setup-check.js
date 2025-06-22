const fs = require("fs")
const path = require("path")

console.log("🔍 Parka Setup Verification\n")

// Check if required files exist
const requiredFiles = [
  "app/page.tsx",
  "app/layout.tsx",
  "contexts/auth-context.tsx",
  "contexts/theme-context.tsx",
  "components/parking-map.tsx",
  "components/google-login.tsx",
  "components/app-layout.tsx",
  "components/onboarding.tsx",
  "components/favorites-list.tsx",
  "backend/server.js",
  "backend/package.json",
]

console.log("📁 Checking required files:")
requiredFiles.forEach((file) => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - MISSING`)
  }
})

// Check environment variables
console.log("\n🔑 Environment Variables Check:")
const requiredEnvVars = [
  "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
  "NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID",
  "NEXT_PUBLIC_BACKEND_URL",
]

requiredEnvVars.forEach((envVar) => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar} - Set`)
  } else {
    console.log(`❌ ${envVar} - NOT SET`)
  }
})

console.log("\n📋 Setup Instructions:")
console.log("1. Set environment variables in .env.local:")
console.log("   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key")
console.log(
  "   NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID=874705016664-v8t674hhm2gulj3m45d1q1ggf32cn1dn.apps.googleusercontent.com",
)
console.log("   NEXT_PUBLIC_BACKEND_URL=http://localhost:10000")
console.log("")
console.log("2. Start the backend:")
console.log("   cd backend && npm install && npm start")
console.log("")
console.log("3. Seed the database:")
console.log("   node scripts/seed-database.js")
console.log("")
console.log("4. Start the frontend:")
console.log("   npm run dev")
