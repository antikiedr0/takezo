import { Router } from 'express'
import bcrypt from 'bcrypt'
import { prisma } from '../lib/prisma.js'
import { signToken } from '../utils/jwt.js'
import { requireAuth } from '../middleware/auth.js'
import { TOKEN_COOKIE, cookieOptions, clearCookieOptions } from '../utils/cookies.js'

export const authRouter = Router()

authRouter.post('/register', async (req, res) => {
  const { email, password, name } = req.body

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'email, password i name są wymagane' })
  }

  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) {
    return res.status(409).json({ error: 'Użytkownik z tym emailem już istnieje' })
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: { email, password: hashedPassword, name },
  })

  res.cookie(TOKEN_COOKIE, signToken({ userId: user.id }), cookieOptions)
  return res.status(201).json({
    user: { id: user.id, email: user.email, name: user.name },
  })
})

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email i password są wymagane' })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' })
  }

  const passwordMatches = await bcrypt.compare(password, user.password)
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' })
  }

  res.cookie(TOKEN_COOKIE, signToken({ userId: user.id }), cookieOptions)
  return res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name },
  })
})

// Frontend nie widzi ciasteczka (httpOnly), więc po odświeżeniu strony pyta
// tutaj "kim jestem" żeby odtworzyć sesję.
authRouter.get('/me', requireAuth, async (_req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: res.locals.userId },
    select: { id: true, email: true, name: true },
  })
  if (!user) {
    return res.status(401).json({ error: 'Sesja wygasła' })
  }
  return res.json({ user })
})

authRouter.post('/logout', (_req, res) => {
  res.clearCookie(TOKEN_COOKIE, clearCookieOptions)
  return res.status(204).send()
})
