const jwt = require('jsonwebtoken');
const User = require('../models/user');
const express = require('express');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator'); // For input validation
const router = express.Router();
const path = require('path');

// Serve the registration page
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/register.html'));
});

// Serve the login page
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
});

// Handle registration form submission
router.post('/register', [
    body('firstName').notEmpty().withMessage('First name is required.'),
    body('otherNames').notEmpty().withMessage('Other names are required.'),
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    const { firstName, otherNames, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists with this email.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user
        const newUser = new User({
            firstName,
            otherNames,
            email,
            password: hashedPassword,
        });

        await newUser.save(); // Save the user to the database
        res.redirect('/login'); // Redirect to login page after successful registration
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error registering user' });
    }
});

// Login route with input validation
router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() }); // Return validation errors
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' }); // User not found
        }

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' }); // Password mismatch
        }

        // Generate JWT token and set session
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        req.session.userId = user._id; // Store user ID in session

        res.redirect('/dashboard'); // Redirect to dashboard on successful login
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect('/dashboard'); // Redirect back if there's an error
        }
        res.redirect('/'); // Redirect to home after logout
    });
});

module.exports = router;