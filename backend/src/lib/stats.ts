import { prisma } from './prisma.js'
import { daysBefore, today, toDayString } from '../utils/day.js'
import { levelFromXp, xpToNextLevel } from '../utils/xp.js'

// Seria dni = ile dni z rzedu konczy sie zdarzeniem DAY_CLOSED, liczac od dzis
// w tyl. Jesli dzisiejszy dzien nie jest jeszcze domkniety, liczymy od wczoraj -
// inaczej licznik spadalby do zera kazdego ranka.
function countStreak(closedDays: Set<string>): number {
  const start = closedDays.has(toDayString(today())) ? 0 : 1
  let streak = 0
  for (let offset = start; offset < 400; offset += 1) {
    if (!closedDays.has(toDayString(daysBefore(today(), offset)))) {
      break
    }
    streak += 1
  }
  return streak
}

export async function readStats(userId: number) {
  const [sum, closedEvents, doneGoals] = await Promise.all([
    prisma.xpEvent.aggregate({ where: { userId }, _sum: { amount: true } }),
    prisma.xpEvent.findMany({
      where: { userId, reason: 'DAY_CLOSED' },
      orderBy: { day: 'desc' },
      select: { day: true },
      take: 400,
    }),
    prisma.dailyGoal.count({ where: { userId, doneAt: { not: null } } }),
  ])

  const totalXp = sum._sum.amount ?? 0
  const closedDays = new Set(closedEvents.map((event) => toDayString(event.day)))

  // Ostatnie 7 dni: ile celow odhaczono kazdego dnia - sluzy slupkom na profilu.
  const since = daysBefore(today(), 6)
  const recent = await prisma.dailyGoal.findMany({
    where: { userId, doneAt: { not: null }, day: { gte: since } },
    select: { day: true },
  })

  const perDay = new Map<string, number>()
  for (const goal of recent) {
    const key = toDayString(goal.day)
    perDay.set(key, (perDay.get(key) ?? 0) + 1)
  }

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const key = toDayString(daysBefore(today(), 6 - index))
    return { day: key, doneGoals: perDay.get(key) ?? 0 }
  })

  return {
    totalXp,
    level: levelFromXp(totalXp),
    xpToNextLevel: xpToNextLevel(totalXp),
    streak: countStreak(closedDays),
    closedDays: closedDays.size,
    doneGoals,
    last7Days,
  }
}
