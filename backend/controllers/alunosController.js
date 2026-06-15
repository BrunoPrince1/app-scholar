const pool = require('../database/db');
const { hashSenhaPadrao } = require('./authController');

// GET /api/alunos
async function listarAlunos(req, res) {
  try {
    const r = await pool.query('SELECT * FROM alunos ORDER BY nome ASC');
    return res.json(r.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// GET /api/alunos/:id
async function buscarAluno(req, res) {
  try {
    const r = await pool.query('SELECT * FROM alunos WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    return res.json(r.rows[0]);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// POST /api/alunos  — também cria login com senha padrão 123456
async function criarAluno(req, res) {
  const { nome, matricula, curso, email, telefone, cep, endereco, cidade, estado } = req.body;
  if (!nome || !matricula || !email)
    return res.status(400).json({ erro: 'Nome, matrícula e e-mail são obrigatórios.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Inserir aluno
    const alunoR = await client.query(
      `INSERT INTO alunos (nome,matricula,curso,email,telefone,cep,endereco,cidade,estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [nome, matricula, curso, email, telefone, cep, endereco, cidade, estado]
    );

    // 2. Criar usuário com senha padrão (ignora se já existir)
    const hash = await hashSenhaPadrao();
    await client.query(
      `INSERT INTO usuarios (nome,email,senha,perfil)
       VALUES ($1,$2,$3,'aluno')
       ON CONFLICT (email) DO NOTHING`,
      [nome, email, hash]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      mensagem: 'Aluno cadastrado! Login criado com senha padrão 123456.',
      aluno: alunoR.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ erro: 'Matrícula ou e-mail já cadastrado.' });
    console.error('Erro ao criar aluno:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  } finally {
    client.release();
  }
}

// PUT /api/alunos/:id
async function atualizarAluno(req, res) {
  const { id } = req.params;
  const { nome, matricula, curso, email, telefone, cep, endereco, cidade, estado } = req.body;
  try {
    const r = await pool.query(
      `UPDATE alunos SET nome=$1,matricula=$2,curso=$3,email=$4,
       telefone=$5,cep=$6,endereco=$7,cidade=$8,estado=$9
       WHERE id=$10 RETURNING *`,
      [nome, matricula, curso, email, telefone, cep, endereco, cidade, estado, id]
    );
    if (!r.rows.length) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    return res.json({ mensagem: 'Aluno atualizado!', aluno: r.rows[0] });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// DELETE /api/alunos/:id
async function deletarAluno(req, res) {
  try {
    const r = await pool.query('DELETE FROM alunos WHERE id=$1 RETURNING id', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    return res.json({ mensagem: 'Aluno removido com sucesso.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { listarAlunos, buscarAluno, criarAluno, atualizarAluno, deletarAluno };
