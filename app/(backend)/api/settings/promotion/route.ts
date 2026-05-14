// import { NextRequest, NextResponse } from 'next/server'
// import { neon } from '@neondatabase/serverless'
// import { promotionSettingsSchema } from '@/lib/validation/settings'
// import { v4 as uuid } from 'uuid'

// const sql = neon(process.env.DATABASE_URL!)

// export async function GET() {
//   try {
//     const result = await sql`SELECT * FROM "PromotionSettings" LIMIT 1`
//     return NextResponse.json({ data: result[0] || null })
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to fetch promotion settings' }, { status: 500 })
//   }
// }

// export async function PUT(request: NextRequest) {
//   try {
//     const data = await request.json()
//     const validated = promotionSettingsSchema.parse(data)

//     // Check if settings exist
//     const existing = await sql`SELECT id FROM "PromotionSettings" LIMIT 1`

//     if (existing.length > 0) {
//       // Update existing
//       const result = await sql`
//         UPDATE "PromotionSettings"
//         SET "passingScore" = ${validated.minimumPassMark},
//             "retentionPolicy" = ${validated.promotionNote || null},
//             "updatedAt" = NOW()
//         WHERE id = ${existing[0].id}
//         RETURNING *
//       `
//       return NextResponse.json({ success: true, data: result[0] })
//     } else {
//       // Create new
//       const id = uuid()
//       const result = await sql`
//         INSERT INTO "PromotionSettings" (id, "passingScore", "retentionPolicy", "academicYearId", "createdAt", "updatedAt")
//         VALUES (${id}, ${validated.minimumPassMark}, ${validated.promotionNote || null}, 
//                 'default-academic-year', NOW(), NOW())
//         RETURNING *
//       `
//       return NextResponse.json({ success: true, data: result[0] }, { status: 201 })
//     }
//   } catch (error: any) {
//     return NextResponse.json(
//       { error: error.message || 'Failed to save promotion settings' },
//       { status: 400 }
//     )
//   }
// }
