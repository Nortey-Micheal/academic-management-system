import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function seedAdmin() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("[v0] Connected to MongoDB")

    const db = client.db("academic_management")

    // Check if admin already exists
    const existingAdmin = await db.collection("users").findOne({ email: "admin@school.edu" })

    if (existingAdmin) {
      console.log("[v0] Admin user already exists")
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 12)

    await db.collection("users").insertOne({
      email: "admin@school.edu",
      password: hashedPassword,
      name: "System Administrator",
      role: "admin",
      createdAt: new Date(),
    })

    console.log("[v0] Admin user created successfully")
    console.log("[v0] Email: admin@school.edu")
    console.log("[v0] Password: admin123")
  } catch (error) {
    console.error("[v0] Error seeding admin user:", error)
    throw error
  } finally {
    await client.close()
  }
}

seedAdmin()
