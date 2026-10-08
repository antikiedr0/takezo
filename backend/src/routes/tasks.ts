import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'

export const tasksRouter = Router()

// Wszystkie trasy poniżej wymagają zalogowania - middleware sprawdza token
// zanim jakikolwiek handler się wykona.
tasksRouter.use(requireAuth)

tasksRouter.get('/', async (_req, res) => {
  const tasks = await prisma.task.findMany({
    where: { userId: res.locals.userId },
    orderBy: { createdAt: 'asc' },
  })
  res.json(tasks)
})

tasksRouter.post('/', async (req, res) => {
  const { name } = req.body

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({ error: 'name jest wymagane' })
  }

  const task = await prisma.task.create({
    data: { name: name.trim(), userId: res.locals.userId },
  })
  return res.status(201).json(task)
})

tasksRouter.patch('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const { done } = req.body

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.userId !== res.locals.userId) {
    return res.status(404).json({ error: 'Nie znaleziono zadania' })
  }

  const updated = await prisma.task.update({
    where: { id },
    data: { done },
  })
  return res.json(updated)
})

tasksRouter.delete('/:id', async (req, res) => {
  const id = Number(req.params.id)

  const task = await prisma.task.findUnique({ where: { id } })
  if (!task || task.userId !== res.locals.userId) {
    return res.status(404).json({ error: 'Nie znaleziono zadania' })
  }

  await prisma.task.delete({ where: { id } })
  return res.status(204).send()
})
