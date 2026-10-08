import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { planCourse } from '../ai/planCourse.js'
import { today } from '../utils/day.js'

export const projectsRouter = Router()

projectsRouter.use(requireAuth)

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).optional(),
})

const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(500).nullable().optional(),
  archived: z.boolean().optional(),
})

const generateSchema = z.object({
  prompt: z.string().trim().min(3).max(1000),
})

const createTopicSchema = z.object({
  name: z.string().trim().min(1).max(160),
})

// Lista projektow na ekran "Projekty": kazdy z licznikiem tematow i postepem.
projectsRouter.get('/', async (_req, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: res.locals.userId, archivedAt: null },
    orderBy: { lastOpenedAt: 'desc' },
    include: {
      topics: { select: { status: true } },
    },
  })

  return res.json({
    projects: projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      lastOpenedAt: project.lastOpenedAt,
      topicCount: project.topics.length,
      doneTopicCount: project.topics.filter((t) => t.status === 'DONE').length,
    })),
  })
})

projectsRouter.post('/', async (req, res) => {
  const parsed = createProjectSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane', issues: parsed.error.issues })
  }

  const project = await prisma.project.create({
    data: { ...parsed.data, userId: res.locals.userId },
  })
  return res.status(201).json({ project })
})

// Jeden projekt z tematami - wszystko, czego potrzebuje ekran projektu.
projectsRouter.get('/:id', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Niepoprawne id' })
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { topics: { orderBy: { position: 'asc' } } },
  })

  if (!project || project.userId !== res.locals.userId) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  // Wejscie w projekt jest tym, co stawia go na gorze listy "ostatnie".
  await prisma.project.update({
    where: { id },
    data: { lastOpenedAt: new Date() },
  })

  return res.json({ project })
})

projectsRouter.patch('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = updateProjectSchema.safeParse(req.body)
  if (!Number.isInteger(id) || !parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane' })
  }

  const existing = await prisma.project.findUnique({ where: { id } })
  if (!existing || existing.userId !== res.locals.userId) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  const { archived, ...rest } = parsed.data
  const project = await prisma.project.update({
    where: { id },
    data: {
      ...rest,
      ...(archived === undefined ? {} : { archivedAt: archived ? new Date() : null }),
    },
  })
  return res.json({ project })
})

// Nowy temat ladu je na koncu listy - stad position liczone z aktualnego maksimum.
projectsRouter.post('/:id/topics', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = createTopicSchema.safeParse(req.body)
  if (!Number.isInteger(id) || !parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane' })
  }

  const project = await prisma.project.findUnique({ where: { id } })
  if (!project || project.userId !== res.locals.userId) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  const last = await prisma.topic.findFirst({
    where: { projectId: id },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const topic = await prisma.topic.create({
    data: {
      name: parsed.data.name,
      projectId: id,
      position: (last?.position ?? 0) + 1,
    },
  })
  return res.status(201).json({ topic })
})

// Projekt zakladany przez agenta: z jednego zdania powstaje tytul, opis,
// rozdzialy i cele na dzis. Wszystko leci w jednej transakcji - polowa kursu
// w bazie bylaby gorsza niz brak kursu.
projectsRouter.post('/generate', async (req, res) => {
  const parsed = generateSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Napisz w kilku słowach, czego chcesz się nauczyć' })
  }

  const userId = res.locals.userId
  const { plan, generated } = await planCourse(parsed.data.prompt)

  const project = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: { name: plan.name, description: plan.description, userId },
    })

    if (plan.topics.length > 0) {
      await tx.topic.createMany({
        data: plan.topics.map((name, index) => ({
          name,
          projectId: created.id,
          position: index + 1,
        })),
      })
    }

    if (plan.goals.length > 0) {
      const firstTopic = await tx.topic.findFirst({
        where: { projectId: created.id },
        orderBy: { position: 'asc' },
        select: { id: true },
      })
      await tx.dailyGoal.createMany({
        data: plan.goals.map((text) => ({
          text,
          userId,
          day: today(),
          topicId: firstTopic?.id ?? null,
        })),
      })
    }

    return tx.project.findUnique({
      where: { id: created.id },
      include: { topics: { orderBy: { position: 'asc' } } },
    })
  })

  return res.status(201).json({ project, generated })
})
