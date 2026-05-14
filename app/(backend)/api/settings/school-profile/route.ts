// import { NextRequest, NextResponse } from 'next/server'
// import { neon } from '@neondatabase/serverless'
// import { schoolProfileSchema } from '@/lib/validation/settings'
// import { v4 as uuid } from 'uuid'

// const sql = neon(process.env.DATABASE_URL!)

// export async function GET() {
//   try {
//     const result = await sql`SELECT * FROM "SchoolProfile" LIMIT 1`
//     return NextResponse.json({ data: result[0] || null })
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to fetch school profile' }, { status: 500 })
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const data = await request.json()
//     const validated = schoolProfileSchema.parse(data)

//     // Check if profile exists
//     const existing = await sql`SELECT id FROM "SchoolProfile" LIMIT 1`

//     if (existing.length > 0) {
//       // Update existing
//       const result = await sql`
//         UPDATE "SchoolProfile"
//         SET name = ${validated.name},
//             motto = ${validated.motto || null},
//             "contactEmail" = ${validated.email || null},
//             "contactPhone" = ${validated.phone || null},
//             address = ${validated.address || null},
//             logo = ${validated.logo || null},
//             "updatedAt" = NOW()
//         WHERE id = ${existing[0].id}
//         RETURNING *
//       `
//       return NextResponse.json({ success: true, data: result[0] })
//     } else {
//       // Create new
//       const id = uuid()
//       const result = await sql`
//         INSERT INTO "SchoolProfile" (id, name, motto, "contactEmail", "contactPhone", address, logo, "createdAt", "updatedAt")
//         VALUES (${id}, ${validated.name}, ${validated.motto || null}, ${validated.email || null}, 
//                 ${validated.phone || null}, ${validated.address || null}, ${validated.logo || null}, NOW(), NOW())
//         RETURNING *
//       `
//       return NextResponse.json({ success: true, data: result[0] }, { status: 201 })
//     }
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || 'Failed to save school profile' },
//       { status: 400 }
//     )
//   }
// }
