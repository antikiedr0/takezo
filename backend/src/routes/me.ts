import path from 'node:path'
import fs from 'node:fs'
import { Router } from 'express'
import multer from 'multer'
import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { readStats } from '../lib/stats.js'

export const meRouter = Router()

meRouter.use(requireAuth)

const UPLOAD_DIR = path.resolve('uploads')
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_IMAGES = new Map([
  ['image/png', '.png'],
  ['image/jpeg', '.jpg'],
  ['image/webp', '.webp'],
])

// Zdjecia trafiaja na dysk, a w bazie siedzi tylko sciezka. Trzymanie
// binariow w Postgresie rozdmuchuje baze i kazdy jej backup.
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, done) => done(null, UPLOAD_DIR),
    filename: (req, file, done) => {
      const ext = ALLOWED_IMAGES.get(file.mimetype) ?? '.bin'
      done(null, `u${req.res?.locals.userId}-${Date.now()}${ext}`)
    },
  }),
  limits: { fileSize: MAX_AVATAR_BYTES },
  fileFilter: (_req, file, done) => {
    // Typ sprawdzamy tutaj, a nie po rozszerzeniu nazwy, ktore user wybiera sam.
    done(null, ALLOWED_IMAGES.has(file.mimetype))
  },
})

const profileSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  email: z.email().max(160).optional(),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(200),
})

function publicUser(user: {
  id: number
  email: string
  name: string
  avatarUrl: string | null
}) {
  return { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl }
}

meRouter.get('/stats', async (_req, res) => {
  const stats = await readStats(res.locals.userId)
  return res.json(stats)
})

// Nick i e-mail. E-mail jest unikatem, wiec zajety adres to 409, nie 500.
meRouter.patch('/', async (req, res) => {
  const parsed = profileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane', issues: parsed.error.issues })
  }

  if (parsed.data.email) {
    const taken = await prisma.user.findUnique({ where: { email: parsed.data.email } })
    if (taken && taken.id !== res.locals.userId) {
      return res.status(409).json({ error: 'Ten e-mail jest już zajęty' })
    }
  }

  const user = await prisma.user.update({
    where: { id: res.locals.userId },
    data: parsed.data,
  })
  return res.json({ user: publicUser(user) })
})

// Zmiana hasla wymaga starego hasla - inaczej przejete ciasteczko wystarczyloby,
// zeby trwale odebrac komus konto.
meRouter.post('/password', async (req, res) => {
  const parsed = passwordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Nowe hasło musi mieć co najmniej 8 znaków' })
  }

  const user = await prisma.user.findUnique({ where: { id: res.locals.userId } })
  if (!user) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  const matches = await bcrypt.compare(parsed.data.currentPassword, user.password)
  if (!matches) {
    return res.status(401).json({ error: 'Obecne hasło się nie zgadza' })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(parsed.data.newPassword, 10) },
  })
  return res.status(204).send()
})

meRouter.post('/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Dodaj plik PNG, JPG lub WEBP do 2 MB' })
  }

  const previous = await prisma.user.findUnique({
    where: { id: res.locals.userId },
    select: { avatarUrl: true },
  })

  const user = await prisma.user.update({
    where: { id: res.locals.userId },
    data: { avatarUrl: `/uploads/${req.file.filename}` },
  })

  // Stare zdjecie nikomu juz nie sluzy - zostawione zasmiecaloby dysk.
  if (previous?.avatarUrl) {
    fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(previous.avatarUrl))).catch(() => {})
  }

  return res.json({ user: publicUser(user) })
})

meRouter.delete('/avatar', async (_req, res) => {
  const current = await prisma.user.findUnique({
    where: { id: res.locals.userId },
    select: { avatarUrl: true },
  })

  const user = await prisma.user.update({
    where: { id: res.locals.userId },
    data: { avatarUrl: null },
  })

  if (current?.avatarUrl) {
    fs.promises.unlink(path.join(UPLOAD_DIR, path.basename(current.avatarUrl))).catch(() => {})
  }

  return res.json({ user: publicUser(user) })
})
