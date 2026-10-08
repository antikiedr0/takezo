import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { today } from '../utils/day.js'
import { XP_FOR_CLOSED_DAY } from '../utils/xp.js'
import { readStats } from '../lib/stats.js'

export const goalsRouter = Router()

goalsRouter.use(requireAuth)

const createGoalSchema = z.object({
  text: z.string().trim().min(1).max(300),
  topicId: z.number().int().positive().optional(),
})

const toggleGoalSchema = z.object({
  done: z.boolean(),
})

goalsRouter.get('/today', async (_req, res) => {
  const day = today()
  const goals = await prisma.dailyGoal.findMany({
    where: { userId: res.locals.userId, day },
    orderBy: { createdAt: 'asc' },
    include: { topic: { select: { id: true, name: true } } },
  })

  const doneCount = goals.filter((goal) => goal.doneAt !== null).length
  const closed = await prisma.xpEvent.findUnique({
    where: {
      userId_reason_day: { userId: res.locals.userId, reason: 'DAY_CLOSED', day },
    },
  })

  return res.json({
    day: day.toISOString().slice(0, 10),
    goals,
    doneCount,
    totalCount: goals.length,
    dayClosed: closed !== null,
  })
})

goalsRouter.post('/', async (req, res) => {
  const parsed = createGoalSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane', issues: parsed.error.issues })
  }

  // Cel mozna przypiac do tematu, ale tylko do wlasnego.
  if (parsed.data.topicId !== undefined) {
    const topic = await prisma.topic.findUnique({
      where: { id: parsed.data.topicId },
      include: { project: { select: { userId: true } } },
    })
    if (!topic || topic.project.userId !== res.locals.userId) {
      return res.status(404).json({ error: 'Nie znaleziono tematu' })
    }
  }

  const goal = await prisma.dailyGoal.create({
    data: {
      text: parsed.data.text,
      topicId: parsed.data.topicId,
      userId: res.locals.userId,
      day: today(),
    },
  })
  return res.status(201).json({ goal })
})

// Odhaczenie celu i ewentualne przyznanie XP to jedno zdarzenie, wiec jedna
// transakcja i jedna odpowiedz - inaczej interfejs przez chwile klamie.
goalsRouter.patch('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = toggleGoalSchema.safeParse(req.body)
  if (!Number.isInteger(id) || !parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane' })
  }

  const userId = res.locals.userId
  const existing = await prisma.dailyGoal.findUnique({ where: { id } })
  if (!existing || existing.userId !== userId) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  const result = await prisma.$transaction(async (tx) => {
    const goal = await tx.dailyGoal.update({
      where: { id },
      data: { doneAt: parsed.data.done ? new Date() : null },
    })

    const day = goal.day
    const [total, open] = await Promise.all([
      tx.dailyGoal.count({ where: { userId, day } }),
      tx.dailyGoal.count({ where: { userId, day, doneAt: null } }),
    ])

    let xpAwarded = 0
    if (total > 0 && open === 0) {
      // Unikat [userId, reason, day] jest jedyna ochrona przed podwojnym
      // przyznaniem XP, ktorej nie da sie obejsc bledem w kodzie wyzej.
      //
      // createMany + skipDuplicates daje INSERT ... ON CONFLICT DO NOTHING:
      // konflikt nie rzuca wyjatkiem, wiec nie przerywa transakcji. Zwykly
      // create z .catch() wygladal na to samo, ale w Postgresie nieudana
      // instrukcja uniewaznia cala transakcje i cofala TAKZE zapis celu.
      const inserted = await tx.xpEvent.createMany({
        data: [{ userId, day, reason: 'DAY_CLOSED', amount: XP_FOR_CLOSED_DAY }],
        skipDuplicates: true,
      })
      xpAwarded = inserted.count > 0 ? XP_FOR_CLOSED_DAY : 0
    }

    return { goal, dayClosed: total > 0 && open === 0, xpAwarded }
  })

  const stats = await readStats(userId)

  return res.json({
    goal: result.goal,
    dayClosed: result.dayClosed,
    xpAwarded: result.xpAwarded,
    totalXp: stats.totalXp,
    level: stats.level,
    streak: stats.streak,
  })
})

goalsRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Niepoprawne id' })
  }

  const existing = await prisma.dailyGoal.findUnique({ where: { id } })
  if (!existing || existing.userId !== res.locals.userId) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  await prisma.dailyGoal.delete({ where: { id } })
  return res.status(204).send()
})
