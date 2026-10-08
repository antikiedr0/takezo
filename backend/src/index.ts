import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth.js'
import { tasksRouter } from './routes/tasks.js'
import cookieParser from 'cookie-parser'
const app = express()
app.use(cookieParser())
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}))
app.use(express.json())

app.use('/auth', authRouter)
app.use('/tasks', tasksRouter)

const PORT = process.env.PORT ?? 3001

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
