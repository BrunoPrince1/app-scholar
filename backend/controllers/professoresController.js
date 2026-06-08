const pool = require('../database/db');
const { hashSenhaPadrao } = require('./authController');

async function listarProfessores(req, res) {
  try {
    const r = await pool.query('SELECT * FROM professores ORDER BY nome ASC');
    return res.json(r.rows);
  } catch (err) { return res.status(500).json({ erro: 'Erro interno.' }); }
}

async function buscarProfessor(req, res) {
  try {
    const r = await pool.query('SELECT * FROM professores WHERE id=$1', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ erro: 'Professor não encontrado.' });
    return res.json(r.rows[0]);
  } catch (err) { return res.status(500).json({ erro: 'Erro interno.' }); }
}

// POST /api/professores — também cria login com senha padrão 123456
async function criarProfessor(req, res) {
  const { nome, titulacao, area, tempo_docencia, email } = req.body;
  if (!nome || !email)
    return res.status(400).json({ erro: 'Nome e e-mail são obrigatórios.' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const profR = await client.query(
      `INSERT INTO professores (nome,titulacao,area,tempo_docencia,email)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [nome, titulacao, area, tempo_docencia, email]
    );

    const hash = await hashSenhaPadrao();
    await client.query(
      `INSERT INTO usuarios (nome,email,senha,perfil)
       VALUES ($1,$2,$3,'professor')
       ON CONFLICT (email) DO NOTHING`,
      [nome, email, hash]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      mensagem: 'Professor cadastrado! Login criado com senha padrão 123456.',
      professor: profR.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    if (err.code === '23505') return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    console.error('Erro ao criar professor:', err);
    return res.status(500).json({ erro: 'Erro interno.' });
  } finally { client.release(); }
}

async function atualizarProfessor(req, res) {
  const { id } = req.params;
  const { nome, titulacao, area, tempo_docencia, email } = req.body;
  try {
    const r = await pool.query(
      `UPDATE professores SET nome=$1,titulacao=$2,area=$3,tempo_docencia=$4,email=$5
       WHERE id=$6 RETURNING *`,
      [nome, titulacao, area, tempo_docencia, email, id]
    );
    if (!r.rows.length) return res.status(404).json({ erro: 'Professor não encontrado.' });
    return res.json({ mensagem: 'Professor atualizado!', professor: r.rows[0] });
  } catch (err) { return res.status(500).json({ erro: 'Erro interno.' }); }
}

async function deletarProfessor(req, res) {
  try {
    const r = await pool.query('DELETE FROM professores WHERE id=$1 RETURNING id', [req.params.id]);
    if (!r.rows.length) return res.status(404).json({ erro: 'Professor não encontrado.' });
    return res.json({ mensagem: 'Professor removido com sucesso.' });
  } catch (err) { return res.status(500).json({ erro: 'Erro interno.' }); }
}

module.exports = { listarProfessores, buscarProfessor, criarProfessor, atualizarProfessor, deletarProfessor };
