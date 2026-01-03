import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"

async function seedSubjects() {
  const client = new MongoClient(uri)

  try {
    await client.connect()
    console.log("[v0] Connected to MongoDB")

    const db = client.db("academic_management")

    // Add subjects to classes
    const classes = await db.collection("classes").find({}).toArray()

    const commonSubjects = ["Mathematics", "English", "Science", "History", "Geography"]

    for (const classItem of classes) {
      if (!classItem.subjects || classItem.subjects.length === 0) {
        await db.collection("classes").updateOne({ _id: classItem._id }, { $set: { subjects: commonSubjects } })

        console.log(`[v0] Added subjects to class: ${classItem.className}`)
      }
    }

    console.log("[v0] Subjects seeded successfully")
  } catch (error) {
    console.error("[v0] Error seeding subjects:", error)
    throw error
  } finally {
    await client.close()
  }
}

seedSubjects()
