require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const alunosRoutes = require('./routes/alunosRoutes');
const professoresRoutes = require('./routes/professoresRoutes');
const disciplinasRoutes = require('./routes/disciplinasRoutes');
const boletimRoutes = require('./routes/boletimRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ── Middlewares globais ──────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api/alunos', alunosRoutes);
app.use('/api/professores', professoresRoutes);
app.use('/api/disciplinas', disciplinasRoutes);
app.use('/api', boletimRoutes);

// ── Healthcheck ──────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    mensagem: 'App Scholar API v2 rodando!',
    endpoints: [
      'POST /api/login',
      'POST /api/registro',
      'GET|POST /api/alunos',
      'GET|PUT|DELETE /api/alunos/:id',
      'GET|POST /api/professores',
      'GET|PUT|DELETE /api/professores/:id',
      'GET|POST /api/disciplinas',
      'GET|PUT|DELETE /api/disciplinas/:id',
      'GET /api/boletim/:matricula',
      'POST /api/notas',
      'GET /api/notas',
    ],
  });
});

// ── 404 handler ──────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

// ── Error handler global ─────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ erro: 'Erro interno do servidor.' });
});

// ── Iniciar servidor ─────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 App Scholar Backend rodando na porta ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
