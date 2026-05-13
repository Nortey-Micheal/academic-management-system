import { z } from 'zod'

// Academic Settings Schema
export const academicSettingsSchema = z.object({
  academicYear: z.string().regex(/^\d{4}\/\d{4}$/, 'Academic year must be in format 2025/2026'),
  term: z.enum(['First Term', 'Second Term', 'Third Term']),
  termStartDate: z.coerce.date(),
  termEndDate: z.coerce.date(),
  academicStatus: z.enum(['Active', 'Vacation', 'Closed']),
}).refine((data) => data.termEndDate >= data.termStartDate, {
  message: 'End date must be after or equal to start date',
  path: ['termEndDate'],
})

// Holiday Schema
export const holidaySchema = z.object({
  name: z.string().min(1, 'Holiday name is required').max(100),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be after or equal to start date',
  path: ['endDate'],
})

// School Profile Schema
export const schoolProfileSchema = z.object({
  name: z.string().min(1, 'School name is required').max(200),
  motto: z.string().max(250).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(), // This will be a file path or URL
})

// Promotion Settings Schema
export const promotionSettingsSchema = z.object({
  enableAutoPromotion: z.boolean().default(false),
  minimumPassMark: z.coerce.number().min(0).max(100),
  promotionNote: z.string().optional(),
})

// Types
export type AcademicSettings = z.infer<typeof academicSettingsSchema>
export type Holiday = z.infer<typeof holidaySchema>
export type SchoolProfile = z.infer<typeof schoolProfileSchema>
export type PromotionSettings = z.infer<typeof promotionSettingsSchema>
