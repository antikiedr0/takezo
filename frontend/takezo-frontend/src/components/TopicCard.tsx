import { useRef, useState } from 'react'

type Task = {
  id: number
  name: string
  done: boolean
}

function TopicCard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskName, setNewTaskName] = useState('')
  const nextId = useRef(1)

  function handleToggleDone(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, done: !task.done } : task,
      ),
    )
  }

  function handleAddTask(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedName = newTaskName.trim()
    if (trimmedName === '') {
      return
    }

    const newTask: Task = {
      id: nextId.current,
      name: trimmedName,
      done: false,
    }
    nextId.current += 1

    setTasks((currentTasks) => [...currentTasks, newTask])
    setNewTaskName('')
  }

  return (
    <div className="topic-card">
      <h3>Topic Title</h3>
      <p>Topic description goes here.</p>

      <form onSubmit={handleAddTask}>
        <input
          type="text"
          value={newTaskName}
          onChange={(event) => setNewTaskName(event.target.value)}
          placeholder="Nazwa nowego zadania"
        />
        <button type="submit">Dodaj</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            style={{
              textDecoration: task.done ? 'line-through' : 'none',
            }}
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => handleToggleDone(task.id)}
            />
            {task.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TopicCard
