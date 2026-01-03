import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function initDatabase() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("[v0] Connected to MongoDB")

    const db = client.db("academic_management")

    // Create collections
    const collections = [
      "users",
      "students",
      "classes",
      "subjects",
      "teachers",
      "attendance",
      "assessments",
      "grades",
      "report_cards",
      "timetables",
      "academic_sessions",
    ]

    for (const collectionName of collections) {
      const collectionExists = await db.listCollections({ name: collectionName }).hasNext()

      if (!collectionExists) {
        await db.createCollection(collectionName)
        console.log(`[v0] Created collection: ${collectionName}`)
      }
    }

    // Create indexes
    await db.collection("users").createIndex({ email: 1 }, { unique: true })
    await db.collection("students").createIndex({ studentId: 1 }, { unique: true })
    await db.collection("students").createIndex({ classId: 1 })
    await db.collection("attendance").createIndex({ studentId: 1, date: 1 })
    await db.collection("grades").createIndex({ studentId: 1, assessmentId: 1 })

    console.log("[v0] Database initialized successfully")
  } catch (error) {
    console.error("[v0] Error initializing database:", error)
    throw error
  } finally {
    await client.close()
  }
}

initDatabase()
