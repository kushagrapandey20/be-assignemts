const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(express.static("public"));

// Function to read tasks from file
const getTasks = () => {
    try {
        if (!fs.existsSync("tasks.json")) return [];
        const data = fs.readFileSync("tasks.json", "utf8");
        return JSON.parse(data || "[]");
    } catch (error) {
        console.error("Error reading tasks.json:", error);
        return [];
    }
};

// Function to save tasks to file
const saveTasks = (tasks) => {
    try {
        fs.writeFileSync("tasks.json", JSON.stringify(tasks, null, 2));
    } catch (error) {
        console.error("Error saving tasks.json:", error);
    }
};

// Redirect root to /tasks
app.get("/", (req, res) => {
    res.redirect("/tasks");
});

// Display all tasks
app.get("/tasks", (req, res) => {
    const tasks = getTasks();
    res.render("tasks", { tasks });
});

// Display a single task (Fixed issue with undefined task)
app.get("/task", (req, res) => {
    const tasks = getTasks();
    const task = tasks.find(t => t.id == req.query.id);

    if (!task) {
        return res.status(404).send("Task not found");
    }

    res.render("task", { task });
});

// Render the Add Task page
app.get("/add-task", (req, res) => {
    res.render("addTask");
});

// Add a new task
app.post("/add-task", (req, res) => {
    let tasks = getTasks();
    const newTask = {
        id: Date.now(), // Use timestamp instead of array length
        title: req.body.title.trim(), // Trim to remove unnecessary spaces
    };

    if (!newTask.title) {
        return res.status(400).send("Task title cannot be empty");
    }

    tasks.push(newTask);
    saveTasks(tasks);
    res.redirect("/tasks");
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
});
