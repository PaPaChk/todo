import { useState, useEffect} from "react";

const STORAGE_KEY = "todo-tasks";

function App() {
  const [tasks, setTasks] = useState(readStoredTasks);
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (input.trim() === "") return;
    const newTasks = [...tasks, [input.trim(), false]];
    setTasks(newTasks);
    setInput("");
  };

  const deleteTask = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index][1] = !newTasks[index][1];
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
          Array.isArray(task) &&
          typeof task[0] === "string" &&
          task[0].trim() !== "" &&
          typeof task[1] === "boolean"
      );
    } catch {
      return [];
    }
  }

  return (
    <div>
      <h1>Todo List</h1>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter a task"
      />
      <button onClick={addTask}>Add</button>
      <ul>
        {tasks.map(([taskname, completed], index) => (
          <li key={index}>
            {taskname}
            <input type="checkbox" checked={completed} onChange={() => toggleTask(index)} />
            <button onClick={() => deleteTask(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
