const jwt = require('jsonwebtoken');
const User = require('../models/user');
const express = require('express');
const bcrypt = require('bcrypt');
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
router.post('/register', async (req, res) => {
    const { firstName, otherNames, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('User already exists with this email.');
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
        res.status(500).send('Error registering user');
    }
});


// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET); // Use the secret key here
            req.session.userId = user._id; // Example for session-based authentication.
            res.redirect('/dashboard');
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
});

// Logout route
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard'); // Redirect back if there's an error
        }
        res.redirect('/'); // Redirect to home after logout
    });
});


// router.post('/logout', (req, res) => {
//     req.session.destroy(); // Destroy session on logout.
//     res.redirect('/');
// });

module.exports = router;