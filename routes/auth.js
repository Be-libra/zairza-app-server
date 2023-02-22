const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user.js');

// Register a new user
router.post('/register', async (req, res) => {
    const { name, registration_number, branch, phone_number, email, password, batch } = req.body;
    try {
        // Check if password is present and non-empty
        if (!password || password.trim().length === 0) {
            return res.status(400).json({ message: 'Password is required' });
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate Zairza ID
        const userCount = await User.countDocuments({ batch }); // Count number of users in batch
        const zairzaID = `ZA${batch.toString().padStart(2, '0')}${(userCount + 1).toString().padStart(3, '0')}`;

        // Create a new user
        let newUser = new User({
            name,
            registration_number,
            branch,
            phone_number,
            email,
            password: hashedPassword,
            zairza_id: zairzaID,
            batch
        });

        console.log(newUser);

        // Save the new user to the database
        await newUser.save();

        res.json({ message: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if user with the given email exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Create and sign a token
        const payload = {
            user: {
                id: user.id
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
