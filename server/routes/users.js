const express = require('express');
const User = require('../models/user');
const { requireAuth } = require('../middleware/authMiddleware');
const router = express.Router();

router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.getUserById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

router.put('/me', requireAuth, async (req, res) => {
    try {
        const { name, photo, email } = req.body;
        const updatedUser = await User.updateUser(req.user.id, name, photo, email);
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error updating profile' });
    }
});

router.delete('/me', requireAuth, async (req, res) => {
    try {
        await User.deleteUser(req.user.id);
        res.json({ message: 'Account deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error deleting account' });
    }
});

module.exports = router;
