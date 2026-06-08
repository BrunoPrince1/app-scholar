const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  listarDisciplinas,
  buscarDisciplina,
  criarDisciplina,
  atualizarDisciplina,
  deletarDisciplina,
} = require('../controllers/disciplinasController');

router.get('/', auth, listarDisciplinas);
router.get('/:id', auth, buscarDisciplina);
router.post('/', auth, criarDisciplina);
router.put('/:id', auth, atualizarDisciplina);
router.delete('/:id', auth, deletarDisciplina);

module.exports = router;
