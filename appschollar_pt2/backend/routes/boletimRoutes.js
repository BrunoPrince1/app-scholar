const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { consultarBoletim, lancarNota, listarNotas } = require('../controllers/boletimController');

// GET /api/boletim/:matricula
router.get('/boletim/:matricula', auth, consultarBoletim);

// POST /api/notas
router.post('/notas', auth, lancarNota);

// GET /api/notas
router.get('/notas', auth, listarNotas);

module.exports = router;
