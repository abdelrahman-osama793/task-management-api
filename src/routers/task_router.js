const express = require("express");
const auth = require("../middleware/auth");
const router = express.Router();
const TaskControllers = require('../controllers/task_controller')

router.post("/", auth, TaskControllers.addTask);

router.get("/", auth, TaskControllers.getAllTasks);

router.get("/:id", auth, TaskControllers.getTask);

router.patch("/:id", auth, TaskControllers.updateTaskById);

router.delete("/:id", auth, TaskControllers.deleteTaskById);

module.exports = router;
