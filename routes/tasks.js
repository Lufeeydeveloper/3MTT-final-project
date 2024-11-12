const express = require('express');
const Task = require('../models/task'); // Import the Task model
const User = require('../models/user'); // Import the User model
const router = express.Router();

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next(); // User is authenticated
    }
    res.redirect('/login'); // Redirect to login if not authenticated
};

// Create a new task
router.post('/tasks', isAuthenticated, async (req, res) => {
    const { taskName, taskDescription, taskPriority, expectedCompletionDate, taskStatus, remark } = req.body;

    const newTask = new Task({
        taskName,
        taskDescription,
        taskPriority,
        creationDate: new Date(), // Automatically set current date
        expectedCompletionDate,
        taskStatus,
        remark,
        userId: req.session.userId // Associate the task with the logged-in user
    });

    try {
        await newTask.save();
        res.redirect('/dashboard'); // Redirect to dashboard after saving
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating task');
    }
});

// In routes/tasks.js
router.get('/dashboard', isAuthenticated, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.session.userId }); // Fetch tasks for the logged-in user
        const user = await User.findById(req.session.userId); // Fetch user details
        res.render('dashboard', { tasks, user }); // Pass tasks and user to the dashboard view
    } catch (err) {
        console.error("Error fetching tasks:", err);
        res.status(500).send('Error fetching tasks');
    }
});

// // Handle fetching tasks for the logged-in user
// router.get('/dashboard', isAuthenticated, async (req, res) => {
//     try {
//         const tasks = await Task.find({ userId: req.session.userId }); // Fetch tasks for the logged-in user
//         const user = await User.findById(req.session.userId); // Fetch user details
//         res.render('dashboard', { tasks, user }); // Pass tasks and user to the dashboard view
//     } catch (err) {
//         console.error("Error fetching tasks:", err);
//         res.status(500).send('Error fetching tasks');
//     }
// });

// Handle deleting a task
router.post('/tasks/delete/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;

    try {
        await Task.findByIdAndDelete(id); // Delete the task by ID
        res.redirect('/dashboard'); // Redirect back to dashboard after deletion
    } catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).send('Error deleting task');
    }
});

// Handle updating a task
router.post('/tasks/edit/:id', isAuthenticated, async (req, res) => {
    const { id } = req.params;
    const { taskName, taskDescription, taskPriority, expectedCompletionDate, taskStatus, remark } = req.body;

    try {
        await Task.findByIdAndUpdate(id, {
            taskName,
            taskDescription,
            taskPriority,
            expectedCompletionDate,
            taskStatus,
            remark,
            userId: req.session.userId // Ensure userId is included for validation
        });
        res.redirect('/dashboard'); // Redirect back to dashboard after updating
    } catch (err) {
        console.error("Error updating task:", err);
        res.status(500).send('Error updating task');
    }
});

module.exports = router;