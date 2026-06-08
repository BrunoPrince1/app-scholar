const pool = require('../database/db');

// GET /api/alunos
async function listarAlunos(req, res) {
  try {
    const resultado = await pool.query(
      'SELECT * FROM alunos ORDER BY nome ASC'
    );
    return res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao listar alunos:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// GET /api/alunos/:id
async function buscarAluno(req, res) {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'SELECT * FROM alunos WHERE id = $1',
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar aluno:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// POST /api/alunos
async function criarAluno(req, res) {
  const { nome, matricula, curso, email, telefone, cep, endereco, cidade, estado } = req.body;

  if (!nome || !matricula || !email) {
    return res.status(400).json({ erro: 'Nome, matrícula e e-mail são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO alunos (nome, matricula, curso, email, telefone, cep, endereco, cidade, estado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nome, matricula, curso, email, telefone, cep, endereco, cidade, estado]
    );
    return res.status(201).json({
      mensagem: 'Aluno cadastrado com sucesso!',
      aluno: resultado.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'Matrícula ou e-mail já cadastrado.' });
    }
    console.error('Erro ao criar aluno:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// PUT /api/alunos/:id
async function atualizarAluno(req, res) {
  const { id } = req.params;
  const { nome, matricula, curso, email, telefone, cep, endereco, cidade, estado } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE alunos SET nome=$1, matricula=$2, curso=$3, email=$4,
       telefone=$5, cep=$6, endereco=$7, cidade=$8, estado=$9
       WHERE id=$10 RETURNING *`,
      [nome, matricula, curso, email, telefone, cep, endereco, cidade, estado, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }
    return res.json({ mensagem: 'Aluno atualizado!', aluno: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar aluno:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// DELETE /api/alunos/:id
async function deletarAluno(req, res) {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'DELETE FROM alunos WHERE id = $1 RETURNING id',
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }
    return res.json({ mensagem: 'Aluno removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar aluno:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { listarAlunos, buscarAluno, criarAluno, atualizarAluno, deletarAluno };
