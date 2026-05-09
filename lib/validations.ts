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

const SlotShape = z.object({
  sportId: z.string().min(1, 'Sport is required'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  location: z.string().min(3, 'Location is required'),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  capacity: z.number().int().min(2).max(100),
})

export const CreateSlotSchema = SlotShape.refine(
  (d) => new Date(d.endsAt).getTime() > new Date(d.startsAt).getTime(),
  { message: 'End time must be after start time', path: ['endsAt'] }
)

// Partials skip the cross-field refine — that's fine since updates may send only one field.
export const UpdateSlotSchema = SlotShape.partial()

export const UpdateProfileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  phone: z
    .string()
    .regex(/^\+[1-9]\d{7,14}$/)
    .or(z.literal(''))
    .nullable()
    .optional(),
})

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

// Note: kept loose at the schema level — the route validates against the SPORTS list
// at runtime so that adding a new sport doesn't require a schema rebuild.
export const UpdateSportsSchema = z.object({
  sportIds: z.array(z.string()).max(50),
})

export const UpdateFeedSchema = z.object({
  leagues: z.array(
    z.object({
      league: z.string(),
      sport: z.string(),
    })
  ),
})
