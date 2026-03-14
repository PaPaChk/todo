import { useState, useEffect } from "react";

const STORAGE_KEY = "todo-tasks";

function App() {
  const [tasks, setTasks] = useState(readStoredTasks);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("none");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (input.trim() === "") return;
    const newTasks = {
      id: crypto.randomUUID(),
      text: input.trim(),
      completed: false,
      dueDate,
      priority,
    }
    setTasks([...tasks, newTasks]);
    setInput("");
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  function readStoredTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (task) =>
          typeof task === "object" &&
          task !== null &&
          typeof task.text === "string" &&
          task.text.trim() !== "" &&
          typeof task.completed === "boolean"
      );
    } catch {
      return [];
    }
  }

  return (
    <div>
      <h1>Todo List</h1>

      <table>
        <thead>
        <tr>
          <th>Task name</th>
          <th>Due date</th>
          <th>Priority</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        <tr>
          <td>
            {/* Task Name Input*/}
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter task name here"
            />
          </td>
          <td>
            {/* Due Date Input */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </td>
          <td>
            {/* Priority Input */}
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="none">None</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </td>
          <td>
            {/* Add Button */}
            <button onClick={addTask}>Add</button>
          </td>
        </tr>
        </tbody>
      </table>

      <br></br>

      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Days left</th>
            <th>Priority</th>
            <th>Completed</th>
          </tr>
        </thead>
        
        <tbody>
        {tasks.map((task, index) => {
          const daysLeft = task.dueDate
            ? Math.ceil((new Date(task.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
            : "N/A";
          return (
            <tr key={index}>
              <td align="center">{task.text}</td>
              <td align="center">{daysLeft}</td>
              <td align="center">{task.priority}</td>
              <td align="center">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(index)}
                />
              </td>
              <td align="center">
                <button onClick={() => deleteTask(index)}>Delete</button>
              </td>
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  )
}

export default App
