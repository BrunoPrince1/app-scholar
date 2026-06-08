const express = require('express');
const router = express.Router();
const { login, registro } = require('../controllers/authController');

// POST /api/login
router.post('/login', login);

// POST /api/registro
router.post('/registro', registro);

module.exports = router;
