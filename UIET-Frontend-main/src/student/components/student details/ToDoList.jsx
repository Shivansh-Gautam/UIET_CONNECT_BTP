import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  Paper,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

const ToDoList = () => {
  const [tasks, setTasks] = useState(() => {
    // Load from localStorage
    const saved = localStorage.getItem("mui-todo-tasks");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [input, setInput] = useState("");

  useEffect(() => {
    localStorage.setItem("mui-todo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed === "") return;
    setTasks([...tasks, { text: trimmed, completed: false }]);
    setInput("");
  };

  const toggleTask = (index) => {
    const newTasks = [...tasks];
    newTasks[index].completed = !newTasks[index].completed;
    setTasks(newTasks);
  };

  const deleteTask = (index) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  return (
    <Box
      sx={{
        maxWidth: 480,
        margin: "2rem auto",
        bgcolor: "background.paper",
        boxShadow: 3,
        borderRadius: 3,
        p: 3,
      }}
      component={Paper}
      aria-label="To-do List"
    >
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        textAlign="center"
        color="primary"
      >
        My To-Do List
      </Typography>
      <Box
        component="form"
        onSubmit={handleAddTask}
        sx={{ display: "flex", mb: 3 }}
      >
        <TextField
          label="Add a new task"
          variant="outlined"
          size="small"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          aria-label="Add a new task"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ ml: 1 }}
          aria-label="Add task"
        >
          Add
        </Button>
      </Box>
      <Divider />
      {tasks.length === 0 ? (
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mt: 3, textAlign: "center" }}
        >
          No tasks yet. Add one above!
        </Typography>
      ) : (
        <List>
          {tasks.map((task, index) => (
            <ListItem
              key={index}
              dense
              button
              onClick={() => toggleTask(index)}
              sx={{
                textDecoration: task.completed ? "line-through" : "none",
                color: task.completed ? "text.disabled" : "text.primary",
                bgcolor: task.completed ? "action.selected" : "inherit",
                borderRadius: 1,
                mb: 1,
                "&:hover": { bgcolor: "action.hover" },
              }}
              role="listitem"
              aria-checked={task.completed}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleTask(index);
                }
              }}
            >
              <Checkbox
                edge="start"
                checked={task.completed}
                tabIndex={-1}
                disableRipple
                inputProps={{
                  "aria-label": `Mark task "${task.text}" completed`,
                }}
              />
              <ListItemText primary={task.text} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label={`delete task ${task.text}`}
                  onClick={() => deleteTask(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ToDoList;
