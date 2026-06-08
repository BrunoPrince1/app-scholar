const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listarAlunos,
  buscarAluno,
  criarAluno,
  atualizarAluno,
  deletarAluno,
} = require('../controllers/alunosController');

router.get('/', auth, listarAlunos);
router.get('/:id', auth, buscarAluno);
router.post('/', auth, criarAluno);
router.put('/:id', auth, atualizarAluno);
router.delete('/:id', auth, deletarAluno);

module.exports = router;
