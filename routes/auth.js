const express = require('express');
const router = express.Router();
const { register, login, createAdmin, getCurrentUser } = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/admin/create', createAdmin); // Special route for initial admin creation
router.get('/me', getCurrentUser);

module.exports = router;
