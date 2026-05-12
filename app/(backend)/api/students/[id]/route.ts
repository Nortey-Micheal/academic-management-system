// import { NextRequest, NextResponse } from "next/server"
// import { connectToDB } from "@/lib/db/mongodb"
// import Student from "@/app/(backend)/models/studentSchema"
// import ClassRoom from "@/app/(backend)/models/classSchema"
// import { ObjectId } from "mongodb"
// import { z } from "zod"

// // ---------------------
// // Validation schemas
// // ---------------------
// const updateStudentSchema = z.object({
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
//   gender: z.enum(["male", "female", "other"]),
//   guardianName: z.string().min(1, "Guardian name is required"),
//   guardianPhone: z.string().min(1, "Guardian phone is required"),
//   guardianEmail: z.string().email().optional(),
//   address: z.string().min(1, "Address is required"),
//   status: z.enum(["active", "inactive", "graduated", "transferred"]),
// })

// const idParamSchema = z.object({
//   id: z.string().refine((val) => ObjectId.isValid(val), { message: "Invalid student id" }),
// })

// // ---------------------
// // PUT: Update student
// // ---------------------
// export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params
//     idParamSchema.parse({ id })

//     const body = await request.json()
//     const parsedData = updateStudentSchema.parse(body)

//     await connectToDB()

//     const updateData = {
//       ...parsedData,
//       dateOfBirth: new Date(parsedData.dateOfBirth),
//       updatedAt: new Date(),
//     }

//     const result = await Student.updateOne({ _id: new ObjectId(id) }, { $set: updateData })

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: "Student not found" }, { status: 404 })
//     }

//     return NextResponse.json({ success: true })
//   } catch (error: any) {
//     console.error("Error updating student:", error)

//     if (error.name === "ZodError") {
//       return NextResponse.json({ error: error.errors }, { status: 400 })
//     }

//     return NextResponse.json({ error: "Failed to update student" }, { status: 500 })
//   }
// }

// // ---------------------
// // DELETE: Remove student
// // ---------------------
// export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
//   try {
//     const { id } = await params
//     idParamSchema.parse({ id })

//     await connectToDB()

//     const student = await Student.findOne({ _id: new ObjectId(id) })

//     if (!student) {
//       return NextResponse.json({ error: "Student not found" }, { status: 404 })
//     }

//     // Decrement class enrollment if class exists
//     if (student.classId) {
//       await ClassRoom.updateOne(
//         { _id: new ObjectId(student.classId) },
//         { $inc: { currentEnrollment: -1 } }
//       )
//     }

//     await Student.deleteOne({ _id: new ObjectId(id) })

//     return NextResponse.json({ success: true })
//   } catch (error: any) {
//     console.error("Error deleting student:", error)

//     if (error.name === "ZodError") {
//       return NextResponse.json({ error: error.errors }, { status: 400 })
//     }

//     return NextResponse.json({ error: "Failed to delete student" }, { status: 500 })
//   }
// }
