const express = require('express');
const router = express.Router();
const Session = require('../models/session');

router.post('/sessions', async (req, res) => {
    try {
        const { name, description, date, time, wing, skills } = req.body;

        const newSession = new Session({
            name,
            description,
            date,
            time,
            wing,
            skills
        });

        const savedSession = await newSession.save();

        res.status(201).json(savedSession);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/sessions', async (req, res) => {
    try {
        const sessions = await Session.find();
        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;
