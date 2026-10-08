import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../middleware/auth.js'
import { respond } from '../ai/respond.js'

export const topicsRouter = Router()

topicsRouter.use(requireAuth)

const updateTopicSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  position: z.number().int().min(0).optional(),
})

const messageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
})

// Temat nalezy do uzytkownika przez projekt - jedno miejsce, ktore to sprawdza.
async function findOwnTopic(topicId: number, userId: number) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: { project: { select: { userId: true, name: true } } },
  })
  if (!topic || topic.project.userId !== userId) {
    return null
  }
  return topic
}

topicsRouter.patch('/:id', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = updateTopicSchema.safeParse(req.body)
  if (!Number.isInteger(id) || !parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane' })
  }

  const existing = await findOwnTopic(id, res.locals.userId)
  if (!existing) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  const { status } = parsed.data
  const topic = await prisma.topic.update({
    where: { id },
    data: {
      ...parsed.data,
      ...(status === undefined
        ? {}
        : { completedAt: status === 'DONE' ? new Date() : null }),
    },
  })
  return res.json({ topic })
})

topicsRouter.get('/:id/messages', async (req, res) => {
  const id = Number(req.params.id)
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Niepoprawne id' })
  }

  const topic = await findOwnTopic(id, res.locals.userId)
  if (!topic) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  const messages = await prisma.chatMessage.findMany({
    where: { topicId: id },
    orderBy: { createdAt: 'asc' },
  })

  return res.json({
    topic: { id: topic.id, name: topic.name, status: topic.status, projectName: topic.project.name },
    messages,
  })
})

// Kontrakt tego endpointu nie zmieni sie, gdy w etapie 2 za respond()
// stanie agent LangChain zamiast jednego wywolania modelu.
topicsRouter.post('/:id/messages', async (req, res) => {
  const id = Number(req.params.id)
  const parsed = messageSchema.safeParse(req.body)
  if (!Number.isInteger(id) || !parsed.success) {
    return res.status(400).json({ error: 'Niepoprawne dane' })
  }

  const topic = await findOwnTopic(id, res.locals.userId)
  if (!topic) {
    return res.status(404).json({ error: 'Nie znaleziono' })
  }

  const history = await prisma.chatMessage.findMany({
    where: { topicId: id },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  const userMessage = await prisma.chatMessage.create({
    data: { topicId: id, role: 'USER', content: parsed.data.content },
  })

  const answer = await respond({
    topicName: topic.name,
    projectName: topic.project.name,
    topicStatus: topic.status,
    history: history.reverse(),
    userMessage: parsed.data.content,
  })

  const assistantMessage = await prisma.chatMessage.create({
    data: { topicId: id, role: 'ASSISTANT', content: answer },
  })

  return res.status(201).json({ messages: [userMessage, assistantMessage] })
})
