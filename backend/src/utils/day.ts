// Cel dzienny nalezy do dnia kalendarzowego, nie do chwili - w bazie siedzi
// jako @db.Date. Tutaj jedno miejsce, ktore zamienia "dzis" na taka date.
export function today(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()))
}

// Ten sam dzien przesuniety o n dni wstecz - uzywane przy liczeniu serii.
export function daysBefore(day: Date, n: number): Date {
  const copy = new Date(day)
  copy.setUTCDate(copy.getUTCDate() - n)
  return copy
}

// YYYY-MM-DD, bez strefy czasowej.
export function toDayString(day: Date): string {
  return day.toISOString().slice(0, 10)
}
