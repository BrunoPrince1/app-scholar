const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const {
  consultarBoletim, meuBoletim,
  disciplinasDoProfessor, alunosDaDisciplina, todosAlunosDaDisciplina,
  lancarNota, listarNotas, removerAlunoDaDisciplina,
} = require('../controllers/boletimController');

// Admin: boletim por matrícula
router.get('/boletim/:matricula',                    auth, consultarBoletim);

// Aluno logado: próprio boletim
router.get('/meu-boletim',                           auth, meuBoletim);

// Professor logado: suas disciplinas
router.get('/professor/disciplinas',                 auth, disciplinasDoProfessor);
router.get('/professor/disciplinas/:id/alunos',      auth, alunosDaDisciplina);

// Vincular/gerenciar alunos em disciplina
router.get('/disciplinas/:id/todos-alunos',          auth, todosAlunosDaDisciplina);

// Notas
router.post('/notas',                                auth, lancarNota);
router.get('/notas',                                 auth, listarNotas);
router.delete('/notas/:alunoId/:disciplinaId',       auth, removerAlunoDaDisciplina);

module.exports = router;
