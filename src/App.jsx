import { useState, useEffect } from "react";

const STORAGE_KEY = "todo-tasks";
const PRIORITY_ORDER = {
  none: 0,
  low: 1,
  medium: 2,
  high: 3,
};

function getDateFromInput(dateString) {
  if (!dateString) return null;

  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
}

function getDaysLeft(dueDate) {
  const parsedDate = getDateFromInput(dueDate);
  if (!parsedDate) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  parsedDate.setHours(0, 0, 0, 0);

  return Math.ceil((parsedDate - today) / (1000 * 60 * 60 * 24));
}

function App() {
  const [tasks, setTasks] = useState(readStoredTasks);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("none");
  const [sortBy, setSortBy] = useState("daysLeft");
  const [sortDirection, setSortDirection] = useState("asc");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (input.trim() === "") return;
    const newTask = {
      id: crypto.randomUUID(),
      text: input.trim(),
      completed: false,
      dueDate,
      priority,
    };
    setTasks((currentTasks) => [...currentTasks, newTask]);
    setInput("");
  };

  const deleteTask = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
  };

  const toggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const sortedTasks = [...tasks].sort((taskA, taskB) => {
    const direction = sortDirection === "asc" ? 1 : -1;

    if (sortBy === "priority") {
      return (
        (PRIORITY_ORDER[taskA.priority] - PRIORITY_ORDER[taskB.priority]) * direction
      );
    }

    const daysLeftA = getDaysLeft(taskA.dueDate);
    const daysLeftB = getDaysLeft(taskB.dueDate);

    if (daysLeftA === null && daysLeftB === null) return 0;
    if (daysLeftA === null) return 1;
    if (daysLeftB === null) return -1;

    return (daysLeftA - daysLeftB) * direction;
  });

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

      <div>
        <span>Sort by</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="daysLeft">Days left</option>
          <option value="priority">Priority</option>
        </select>

        <button
          type="button"
          onClick={() =>
            setSortDirection((currentDirection) =>
              currentDirection === "asc" ? "desc" : "asc"
            )
          }
        >
          {sortDirection === "asc" ? "Ascending" : "Descending"}
        </button>
      </div>

      <br></br>

      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Days left</th>
            <th>Priority</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {sortedTasks.map((task) => {
            const daysLeft = getDaysLeft(task.dueDate);
            return (
              <tr key={task.id}>
                <td align="center">{task.text}</td>
                <td align="center">{daysLeft ?? "N/A"}</td>
                <td align="center">{task.priority}</td>
                <td align="center">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTask(task.id)}
                  />
                </td>
                <td align="center">
                  <button onClick={() => deleteTask(task.id)}>Delete</button>
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
