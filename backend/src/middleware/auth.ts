import type { NextFunction, Request, Response } from 'express'
import { verifyToken } from '../utils/jwt.js'
import { TOKEN_COOKIE } from '../utils/cookies.js'

// Token siedzi w httpOnly cookie - przeglądarka dokłada je sama do każdego
// żądania na ten origin. Middleware weryfikuje podpis i dokłada userId do
// res.locals, zanim request dotrze do właściwego handlera. Jak nie ma tokenu
// albo jest zły - 401.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[TOKEN_COOKIE]

  if (!token) {
    return res.status(401).json({ error: 'Brak tokenu' })
  }

  try {
    const payload = verifyToken(token)
    res.locals.userId = payload.userId
    return next()
  } catch {
    return res.status(401).json({ error: 'Nieprawidłowy token' })
  }
}
