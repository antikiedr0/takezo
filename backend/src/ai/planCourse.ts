// SZEW DLA AGENTA (docelowo w Pythonie).
//
// Dzis: z prompta powstaje pusty projekt o nazwie wzietej z tekstu.
// Pozniej: ta funkcja odpyta serwis agenta (HTTP) i zwroci gotowy plan -
// tytul, opis, rozdzialy i cele. Kontrakt POST /api/projects/generate
// nie zmieni sie, wiec frontend pisany teraz zostaje bez zmian.
export type CoursePlan = {
  name: string
  description: string | null
  topics: string[]
  goals: string[]
}

export async function planCourse(
  prompt: string,
): Promise<{ plan: CoursePlan; generated: boolean }> {
  const plan: CoursePlan = {
    name: prompt.trim().slice(0, 60),
    description: null,
    topics: [],
    goals: [],
  }

  // generated: false mowi frontendowi, ze rozdzialy trzeba na razie dodac recznie.
  return { plan, generated: false }
}
