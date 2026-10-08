import type { CookieOptions } from 'express'

export const TOKEN_COOKIE = 'token'

// Jedno źródło prawdy dla opcji ciasteczka. res.cookie i res.clearCookie muszą
// dostać te same wartości (poza maxAge), inaczej przeglądarka nie dopasuje
// ciasteczka przy usuwaniu i wylogowanie nic nie robi.
export const cookieOptions: CookieOptions = {
  httpOnly: true,                                  // JS w przeglądarce nie odczyta
  secure: process.env.NODE_ENV === 'production',   // dev po http => false, inaczej cookie zniknie
  sameSite: 'lax',                                 // ochrona CSRF
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,                 // 7 dni - spójne z expiresIn tokenu JWT
}

// clearCookie ignoruje maxAge/expires - reszta musi się zgadzać z powyższym.
export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}
