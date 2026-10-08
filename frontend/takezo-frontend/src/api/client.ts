export const API_BASE = import.meta.env.VITE_API_URL
const BASE = API_BASE

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

// Jedno miejsce na komunikację z backendem.
// - credentials: 'include' -> przeglądarka wysyła i przyjmuje httpOnly cookie
// - domyślny Content-Type: application/json
// - !res.ok => rzuca ApiError z komunikatem z pola `error` w odpowiedzi
export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (res.status === 204) {
    return undefined as T
  }

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? `Błąd ${res.status}`)
  }

  return body as T
}

// Wysylka pliku idzie jako multipart, wiec NIE ustawiamy Content-Type -
// przegladarka musi sama dopisac granice (boundary) do naglowka.
export async function apiUpload<T>(path: string, form: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: form,
  })

  const body = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(res.status, body.error ?? `Błąd ${res.status}`)
  }

  return body as T
}
