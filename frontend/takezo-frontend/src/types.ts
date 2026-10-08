export type TopicStatus = 'TODO' | 'IN_PROGRESS' | 'DONE'

export type Topic = {
  id: number
  name: string
  status: TopicStatus
  position: number
  completedAt: string | null
  projectId: number
}

export type ProjectSummary = {
  id: number
  name: string
  description: string | null
  lastOpenedAt: string
  topicCount: number
  doneTopicCount: number
}

export type Project = {
  id: number
  name: string
  description: string | null
  topics: Topic[]
}

export type Goal = {
  id: number
  text: string
  day: string
  doneAt: string | null
  topicId: number | null
  topic: { id: number; name: string } | null
}

export type GoalsToday = {
  day: string
  goals: Goal[]
  doneCount: number
  totalCount: number
  dayClosed: boolean
}

export type ChatMessage = {
  id: number
  role: 'USER' | 'ASSISTANT'
  content: string
  createdAt: string
}

export type Stats = {
  totalXp: number
  level: number
  xpToNextLevel: number
  streak: number
  closedDays: number
  doneGoals: number
  last7Days: { day: string; doneGoals: number }[]
}
