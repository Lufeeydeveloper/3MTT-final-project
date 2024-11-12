const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path'); // For handling file paths
require('dotenv').config(); // Load environment variables from .env
const router = express.Router();

const authRoutes = require('./routes/auth'); // Authentication routes
const taskRoutes = require('./routes/tasks'); // Task management routes

const app = express();
const PORT = process.env.PORT || 3000;

// In server.js
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set views directory


// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from public directory

// Session setup using the secret key from .env
app.use(session({
    secret: process.env.JWT_SECRET, // Use the secret key from .env
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://bangiscoder:teSt1234@test.ilu4n.mongodb.net/?retryWrites=true&w=majority&appName=test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log("Connected to MongoDB Atlas");
})
.catch(err => {
    console.error("MongoDB connection error:", err);
});

// Serve the landing page as index.html at root URL
// In server.js
app.get('/', (req, res) => {
    res.render('index', { user: req.session.userId }); // Pass user session data
});


// Define authentication routes
app.use('/', authRoutes);

// Define task management routes
app.use('/', taskRoutes);

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated.
    }
    res.sendFile(path.join(__dirname, 'views', 'dashboard.ejs')); // Serve dashboard page.
});

// Handle creating a new task
router.post('/tasks', async (req, res) => {
    const { taskName, taskDescription, taskPriority, creationDate, expectedCompletionDate, taskStatus, remark } = req.body;

    try {
        const newTask = new Task({
            taskName,
            taskDescription,
            taskPriority,
            creationDate: new Date(creationDate), // Convert string to Date object
            expectedCompletionDate: new Date(expectedCompletionDate), // Convert string to Date object
            taskStatus,
            remark,
        });

        await newTask.save(); // Save the new task to the database
        res.redirect('/dashboard'); // Redirect back to dashboard after saving
    } catch (err) {
        console.error("Error creating task:", err);
        res.status(500).send('Error creating task');
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});