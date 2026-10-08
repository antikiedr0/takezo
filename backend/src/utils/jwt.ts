import jwt from 'jsonwebtoken'

const JWT_SECRET: string = (() => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('Brak JWT_SECRET w .env')
  }
  return secret
})()

export type JwtPayload = {
  userId: number
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  const decoded = jwt.verify(token, JWT_SECRET)
  return decoded as unknown as JwtPayload
}
