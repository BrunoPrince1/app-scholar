const pool = require('../database/db');

// GET /api/professores
async function listarProfessores(req, res) {
  try {
    const resultado = await pool.query(
      'SELECT * FROM professores ORDER BY nome ASC'
    );
    return res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao listar professores:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// GET /api/professores/:id
async function buscarProfessor(req, res) {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'SELECT * FROM professores WHERE id = $1',
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Professor não encontrado.' });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar professor:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// POST /api/professores
async function criarProfessor(req, res) {
  const { nome, titulacao, area, tempo_docencia, email } = req.body;

  if (!nome || !email) {
    return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO professores (nome, titulacao, area, tempo_docencia, email)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, titulacao, area, tempo_docencia, email]
    );
    return res.status(201).json({
      mensagem: 'Professor cadastrado com sucesso!',
      professor: resultado.rows[0],
    });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    }
    console.error('Erro ao criar professor:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// PUT /api/professores/:id
async function atualizarProfessor(req, res) {
  const { id } = req.params;
  const { nome, titulacao, area, tempo_docencia, email } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE professores SET nome=$1, titulacao=$2, area=$3, tempo_docencia=$4, email=$5
       WHERE id=$6 RETURNING *`,
      [nome, titulacao, area, tempo_docencia, email, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Professor não encontrado.' });
    }
    return res.json({ mensagem: 'Professor atualizado!', professor: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar professor:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// DELETE /api/professores/:id
async function deletarProfessor(req, res) {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'DELETE FROM professores WHERE id = $1 RETURNING id',
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Professor não encontrado.' });
    }
    return res.json({ mensagem: 'Professor removido com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar professor:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { listarProfessores, buscarProfessor, criarProfessor, atualizarProfessor, deletarProfessor };
