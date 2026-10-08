import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../generated/prisma/client.js'

// Prisma 7 wymaga jawnego "driver adapter" zamiast wbudowanego silnika -
// to on faktycznie łączy się z Postgresem po connection stringu z .env.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })

// Jedna, współdzielona instancja PrismaClient dla całej aplikacji.
// Importuj ją wszędzie tam, gdzie potrzebujesz zapytań do bazy -
// nigdy nie twórz `new PrismaClient()` w innych plikach.
export const prisma = new PrismaClient({ adapter })
