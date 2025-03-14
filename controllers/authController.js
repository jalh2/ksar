const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Register user
exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // Create user
        const user = await User.create({
            username,
            password,
            role: 'user' // Default role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                role: user.role,
                token: generateToken(user._id)
            });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Create admin user
exports.createAdmin = async (req, res) => {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ message: 'Admin already exists' });
        }

        const { username, password } = req.body;

        const admin = await User.create({
            username,
            password,
            role: 'admin'
        });

        res.status(201).json({
            _id: admin._id,
            username: admin.username,
            role: admin.role,
            token: generateToken(admin._id)
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        // Since we removed auth middleware, expect username in query
        const { username } = req.query;
        if (!username) {
            return res.status(400).json({ message: 'Username is required' });
        }
        
        const user = await User.findOne({ username }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
