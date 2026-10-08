import {useRef, useState} from "react";


type Task = {
    id: number
    name: string
    done:  boolean
    date: string 
}

function ToDoCard(){
    const [tasks, setTasks] = useState<Task[]>([])
    const [newTaskName, setNewTaskName] = useState('')
    const nextId = useRef(1)
    
    function setTask(event:React.FormEvent<HTMLFormElement>){
        event.preventDefault()
        const trimmedTaskName = newTaskName.trim()
        if(trimmedTaskName === ''){
            return
        }
        const today = new Date()
        const newTask: Task = {
            id: nextId.current++,
            name: trimmedTaskName,
            done: false,
            date: today.toISOString()
        }
        setTasks(currentTasks => [...currentTasks, newTask])
    }

    return(
        <div className="todo-card">
            <h2>welcome</h2>
                <form onSubmit={setTask}>
                <input type="text" placeholder="Add a new task..." value={newTaskName} onChange={(event)=> setNewTaskName(event.target.value)}/>
                <button type="submit">Add Task</button>
            </form>

            <h3>My Tasks</h3>
            <ul>
                {tasks.map(task => (
                    <li key={task.id}>{task.name}</li>
                ))}
            </ul>
    
        </div>
    )
}
export default ToDoCard
