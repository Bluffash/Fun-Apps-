import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:./dev.db' })
const prisma = new PrismaClient({ adapter } as never)

const sports = [
  { slug: 'soccer',            name: 'Soccer',            icon: '⚽' },
  { slug: 'basketball',        name: 'Basketball',        icon: '🏀' },
  { slug: 'pickleball',        name: 'Pickleball',        icon: '🏓' },
  { slug: 'tennis',            name: 'Tennis',            icon: '🎾' },
  { slug: 'volleyball',        name: 'Volleyball',        icon: '🏐' },
  { slug: 'american-football', name: 'American Football', icon: '🏈' },
  { slug: 'baseball',          name: 'Baseball',          icon: '⚾' },
  { slug: 'hockey',            name: 'Hockey',            icon: '🏒' },
  { slug: 'golf',              name: 'Golf',              icon: '⛳' },
  { slug: 'badminton',         name: 'Badminton',         icon: '🏸' },
]

async function main() {
  for (const sport of sports) {
    await (prisma as any).sport.upsert({
      where: { slug: sport.slug },
      update: sport,
      create: sport,
    })
  }
  console.log('✅ Seeded 10 sports')

  const adminPassword = await bcrypt.hash('Admin1234!', 12)
  const admin = await (prisma as any).user.upsert({
    where: { email: 'admin@sportsapp.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@sportsapp.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin user:', admin.email)
}

main()
  .catch(console.error)
  .finally(() => (prisma as any).$disconnect())
