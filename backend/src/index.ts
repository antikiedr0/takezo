import path from 'node:path'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import { authRouter } from './routes/auth.js'
import { projectsRouter } from './routes/projects.js'
import { topicsRouter } from './routes/topics.js'
import { goalsRouter } from './routes/goals.js'
import { meRouter } from './routes/me.js'

const app = express()

app.use(cookieParser())
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
)
app.use(express.json())

// Wgrane zdjecia profilowe sa serwowane wprost z dysku.
app.use('/uploads', express.static(path.resolve('uploads')))

app.use('/auth', authRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/topics', topicsRouter)
app.use('/api/goals', goalsRouter)
app.use('/api/me', meRouter)

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
