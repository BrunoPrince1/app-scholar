const pool = require('../database/db');

// GET /api/disciplinas
async function listarDisciplinas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT d.*, p.nome AS professor_nome
       FROM disciplinas d
       LEFT JOIN professores p ON d.professor_id = p.id
       ORDER BY d.nome ASC`
    );
    return res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao listar disciplinas:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// GET /api/disciplinas/:id
async function buscarDisciplina(req, res) {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      `SELECT d.*, p.nome AS professor_nome
       FROM disciplinas d
       LEFT JOIN professores p ON d.professor_id = p.id
       WHERE d.id = $1`,
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Disciplina não encontrada.' });
    }
    return res.json(resultado.rows[0]);
  } catch (err) {
    console.error('Erro ao buscar disciplina:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// POST /api/disciplinas
async function criarDisciplina(req, res) {
  const { nome, carga_horaria, professor_id, curso, semestre } = req.body;

  if (!nome || !carga_horaria) {
    return res.status(400).json({ erro: 'Nome e carga horária são obrigatórios.' });
  }

  try {
    const resultado = await pool.query(
      `INSERT INTO disciplinas (nome, carga_horaria, professor_id, curso, semestre)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [nome, carga_horaria, professor_id || null, curso, semestre]
    );
    return res.status(201).json({
      mensagem: 'Disciplina cadastrada com sucesso!',
      disciplina: resultado.rows[0],
    });
  } catch (err) {
    console.error('Erro ao criar disciplina:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// PUT /api/disciplinas/:id
async function atualizarDisciplina(req, res) {
  const { id } = req.params;
  const { nome, carga_horaria, professor_id, curso, semestre } = req.body;

  try {
    const resultado = await pool.query(
      `UPDATE disciplinas SET nome=$1, carga_horaria=$2, professor_id=$3, curso=$4, semestre=$5
       WHERE id=$6 RETURNING *`,
      [nome, carga_horaria, professor_id || null, curso, semestre, id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Disciplina não encontrada.' });
    }
    return res.json({ mensagem: 'Disciplina atualizada!', disciplina: resultado.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar disciplina:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// DELETE /api/disciplinas/:id
async function deletarDisciplina(req, res) {
  const { id } = req.params;
  try {
    const resultado = await pool.query(
      'DELETE FROM disciplinas WHERE id = $1 RETURNING id',
      [id]
    );
    if (resultado.rows.length === 0) {
      return res.status(404).json({ erro: 'Disciplina não encontrada.' });
    }
    return res.json({ mensagem: 'Disciplina removida com sucesso.' });
  } catch (err) {
    console.error('Erro ao deletar disciplina:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = {
  listarDisciplinas,
  buscarDisciplina,
  criarDisciplina,
  atualizarDisciplina,
  deletarDisciplina,
};
