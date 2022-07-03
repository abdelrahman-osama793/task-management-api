const TaskModel = require('../models/task_model')

// Add new task with the owner id
const addTask = async (req, res) => {
    const task = new TaskModel({
        ...req.body,
        owner: req.user._id,
    });
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(500).send(e);
    }
}

// Get all Tasks with  the ability to sort
const getAllTasks = async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        // const tasks = await TaskModel.find({ owner: req.user._id });
        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                    //  {
                    //   1 is ascending and -1 is descending
                    //   lw 3aiz el completed htb2a -1 lw uncompleted hth2a 1
                    //   createdAt: -1,
                    // },
                },
            })
            .execPopulate();
        let tasks = req.user.tasks
        if (tasks.length === 0) {
            return res.status(404).send({ message: `No tasks found, let's create new one` })
        }
        res.status(200).send(tasks);
    } catch (e) {
        res.status(500).send(e);
    }
}

// get task by task id and user id (owner)
const getTask = async (req, res) => {
    const _id = req.params.id;
    try {
        const task = await TaskModel.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send({ message: "Not found" });
        }
        res.status(200).send(task);
    } catch (e) {
        res.status(500).send();
    }
}

// update task by id and owner id to check for the privileges
const updateTaskById = async (req, res) => {
    const _id = req.params.id;
    const requiredUpdates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    //.every() takes a callback function and this function gets called to every item in the array
    const isValidOperation = requiredUpdates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!isValidOperation) {
        return res.status(400).send({ error: "Field not available" });
    }

    try {
        const task = await TaskModel.findOne({ _id, owner: req.user._id });

        if (!task) {
            return res.status(404).send({ message: "Not Found" });
        }

        requiredUpdates.forEach((update) => (task[update] = req.body[update]));
        await task.save();

        res.status(200).send({ message: "Updated successfully", task });
    } catch (e) {
        res.status(500).send(e);
    }
}

const deleteTaskById = async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await TaskModel.findOneAndDelete({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send({ message: "Not found" });
        }
        res.send({ message: "Deleted successfully", task });
    } catch (e) {
        res.status(500).send(e);
    }
}

module.exports = TaskControllers = {
    addTask,
    getAllTasks,
    getTask,
    updateTaskById,
    deleteTaskById
}