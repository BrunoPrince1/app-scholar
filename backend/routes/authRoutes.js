const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const { login, registro, alterarSenha } = require('../controllers/authController');

router.post('/login',         login);
router.post('/registro',      registro);
router.put('/alterar-senha',  auth, alterarSenha);

module.exports = router;
