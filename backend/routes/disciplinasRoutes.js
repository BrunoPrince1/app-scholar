const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  listarDisciplinas, buscarDisciplina,
  criarDisciplina, atualizarDisciplina, deletarDisciplina,
} = require('../controllers/disciplinasController');
const { todosAlunosDaDisciplina } = require('../controllers/boletimController');

// Rota específica ANTES da rota genérica /:id para não ser interceptada
router.get('/:id/todos-alunos', auth, todosAlunosDaDisciplina);

router.get('/',    auth, listarDisciplinas);
router.get('/:id', auth, buscarDisciplina);
router.post('/',   auth, criarDisciplina);
router.put('/:id', auth, atualizarDisciplina);
router.delete('/:id', auth, deletarDisciplina);

module.exports = router;
