const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listarProfessores,
  buscarProfessor,
  criarProfessor,
  atualizarProfessor,
  deletarProfessor,
} = require('../controllers/professoresController');

router.get('/', auth, listarProfessores);
router.get('/:id', auth, buscarProfessor);
router.post('/', auth, criarProfessor);
router.put('/:id', auth, atualizarProfessor);
router.delete('/:id', auth, deletarProfessor);

module.exports = router;
