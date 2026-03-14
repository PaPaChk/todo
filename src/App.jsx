import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Checkbox,
  Container,
  CssBaseline,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

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

function compareDaysLeft(taskA, taskB) {
  const daysLeftA = getDaysLeft(taskA.dueDate);
  const daysLeftB = getDaysLeft(taskB.dueDate);

  if (daysLeftA === null && daysLeftB === null) return 0;
  if (daysLeftA === null) return 1;
  if (daysLeftB === null) return -1;

  return daysLeftA - daysLeftB;
}

function comparePriority(taskA, taskB) {
  return PRIORITY_ORDER[taskA.priority] - PRIORITY_ORDER[taskB.priority];
}

function getSortLabel(sortValue) {
  return sortValue === "daysLeft" ? "Days left" : "Priority";
}

function getDaysLeftDisplay(task) {
  const daysLeft = getDaysLeft(task.dueDate);

  if (task.completed) return "Completed";
  if (daysLeft === null) return "N/A";
  if (!task.completed && daysLeft < 0) return `Overdue for ${Math.abs(daysLeft)} days`;

  return daysLeft;
}

function App() {
  const [tasks, setTasks] = useState(readStoredTasks);
  const [input, setInput] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("none");
  const [sortBy, setSortBy] = useState("daysLeft");
  const [sortDirection, setSortDirection] = useState("asc");
  const [secondSortDirection, setSecondSortDirection] = useState("asc");

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

  const secondarySortBy = sortBy === "daysLeft" ? "priority" : "daysLeft";

  const sortedTasks = [...tasks].sort((taskA, taskB) => {
    if (taskA.completed !== taskB.completed) {
      return taskA.completed ? 1 : -1;
    }

    const primaryDirection = sortDirection === "asc" ? 1 : -1;
    const secondaryDirection = secondSortDirection === "asc" ? 1 : -1;
    const comparePrimary = sortBy === "daysLeft" ? compareDaysLeft : comparePriority;
    const compareSecondary =
      secondarySortBy === "daysLeft" ? compareDaysLeft : comparePriority;

    const primaryResult = comparePrimary(taskA, taskB) * primaryDirection;
    if (primaryResult !== 0) return primaryResult;

    const secondaryResult = compareSecondary(taskA, taskB) * secondaryDirection;
    if (secondaryResult !== 0) return secondaryResult;

    return taskA.text.localeCompare(taskB.text);
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
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #f7f4ee 0%, #efe8db 100%)",
          py: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Typography
              component="h1"
              variant="h3"
              sx={{ fontWeight: 700, color: "#2f2a24", letterSpacing: "0.02em" }}
            >
              Todo List
            </Typography>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f1e7d0" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Task name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow hover>
                    <TableCell>
                      <TextField
                        fullWidth
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Enter task name here"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        fullWidth
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        size="small"
                      >
                        <MenuItem value="none">None</MenuItem>
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={addTask}
                        sx={{ backgroundColor: "#556b2f" }}
                      >
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Paper elevation={2} sx={{ borderRadius: 3, px: 3, py: 2.5 }}>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                  <Typography sx={{ color: "#4a4339" }}>Sorting by</Typography>
                  <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small">
                    <MenuItem value="daysLeft">Days left</MenuItem>
                    <MenuItem value="priority">Priority</MenuItem>
                  </Select>
                  <Typography sx={{ color: "#4a4339" }}>in</Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() =>
                      setSortDirection((currentDirection) =>
                        currentDirection === "asc" ? "desc" : "asc"
                      )
                    }
                    sx={{ width: { xs: "100%", md: "auto" } }}
                  >
                    {sortDirection === "asc" ? "ascending" : "descending"}
                  </Button>
                  <Typography sx={{ color: "#4a4339" }}>order, then</Typography>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} alignItems={{ md: "center" }}>
                  <Typography sx={{ color: "#4a4339" }}>sorting by</Typography>
                  <Select value={secondarySortBy} disabled size="small">
                    <MenuItem value={secondarySortBy}>{getSortLabel(secondarySortBy)}</MenuItem>
                  </Select>
                  <Typography sx={{ color: "#4a4339" }}>in</Typography>
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() =>
                      setSecondSortDirection((currentDirection) =>
                        currentDirection === "asc" ? "desc" : "asc"
                      )
                    }
                    sx={{ width: { xs: "100%", md: "auto" } }}
                  >
                    {secondSortDirection === "asc" ? "ascending" : "descending"}
                  </Button>
                  <Typography sx={{ color: "#4a4339" }}>order</Typography>
                </Stack>
              </Stack>
            </Paper>

            <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f1e7d0" }}>
                    <TableCell sx={{ fontWeight: 700 }}>Task</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Days left
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Priority
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Completed
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedTasks.map((task) => {
                    const isCompleted = task.completed;
                    return (
                      <TableRow
                        key={task.id}
                        hover
                        sx={
                          isCompleted
                            ? {
                                backgroundColor: "#f0f0f0",
                                "& td": {
                                  color: "text.disabled",
                                },
                              }
                            : undefined
                        }
                      >
                        <TableCell sx={isCompleted ? { textDecoration: "line-through" } : undefined}>
                          {task.text}
                        </TableCell>
                        <TableCell align="center">{getDaysLeftDisplay(task)}</TableCell>
                        <TableCell align="center" sx={{ textTransform: "capitalize" }}>
                          {task.priority}
                        </TableCell>
                        <TableCell align="center">
                          <Checkbox
                            checked={task.completed}
                            onChange={() => toggleTask(task.id)}
                            color="success"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            onClick={() => deleteTask(task.id)}
                            variant="outlined"
                            color="error"
                            size="small"
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </Container>
      </Box>
    </>
  )
}

export default App
