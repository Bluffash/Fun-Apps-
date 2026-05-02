import { z } from 'zod'

export const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format (e.g. +12125551234)')
    .optional()
    .or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const CreateSlotSchema = z.object({
  sportId: z.string().min(1, 'Sport is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().int().min(2).max(100),
})

export const UpdateSlotSchema = CreateSlotSchema.partial()

export const SendInviteSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('user'), recipientId: z.string().min(1) }),
  z.object({
    type: z.literal('phone'),
    phone: z.string().regex(/^\+[1-9]\d{7,14}$/, 'Phone must be in E.164 format'),
  }),
])

export const SendMessageSchema = z.object({
  body: z.string().min(1).max(1000),
})

export const UpdateSportsSchema = z.object({
  sportIds: z.array(z.string()),
})

export const UpdateFeedSchema = z.object({
  leagues: z.array(
    z.object({
      league: z.string(),
      sport: z.string(),
    })
  ),
})
