const pool = require('../database/db');

// GET /api/boletim/:matricula  — consulta boletim do aluno
async function consultarBoletim(req, res) {
  const { matricula } = req.params;

  try {
    // Buscar aluno pela matrícula
    const alunoRes = await pool.query(
      'SELECT * FROM alunos WHERE matricula = $1',
      [matricula]
    );

    if (alunoRes.rows.length === 0) {
      return res.status(404).json({ erro: 'Aluno não encontrado.' });
    }

    const aluno = alunoRes.rows[0];

    // Buscar notas com informações da disciplina
    const notasRes = await pool.query(
      `SELECT n.*, d.nome AS disciplina
       FROM notas n
       JOIN disciplinas d ON n.disciplina_id = d.id
       WHERE n.aluno_id = $1
       ORDER BY d.nome ASC`,
      [aluno.id]
    );

    return res.json({
      aluno: aluno.nome,
      matricula: aluno.matricula,
      curso: aluno.curso,
      disciplinas: notasRes.rows.map((n) => ({
        disciplina: n.disciplina,
        nota1: parseFloat(n.nota1),
        nota2: parseFloat(n.nota2),
        media: parseFloat(n.media),
        situacao: n.situacao,
      })),
    });
  } catch (err) {
    console.error('Erro ao consultar boletim:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// POST /api/notas  — lançar ou atualizar nota
async function lancarNota(req, res) {
  const { aluno_id, disciplina_id, nota1, nota2 } = req.body;

  if (!aluno_id || !disciplina_id) {
    return res.status(400).json({ erro: 'aluno_id e disciplina_id são obrigatórios.' });
  }

  const n1 = parseFloat(nota1) || 0;
  const n2 = parseFloat(nota2) || 0;
  const media = parseFloat(((n1 + n2) / 2).toFixed(2));
  const situacao = media >= 6 ? 'Aprovado' : 'Reprovado';

  try {
    const resultado = await pool.query(
      `INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (aluno_id, disciplina_id)
       DO UPDATE SET nota1=$3, nota2=$4, media=$5, situacao=$6
       RETURNING *`,
      [aluno_id, disciplina_id, n1, n2, media, situacao]
    );

    return res.status(201).json({
      mensagem: 'Nota lançada com sucesso!',
      nota: resultado.rows[0],
    });
  } catch (err) {
    console.error('Erro ao lançar nota:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// GET /api/notas  — listar todas as notas
async function listarNotas(req, res) {
  try {
    const resultado = await pool.query(
      `SELECT n.*, a.nome AS aluno_nome, a.matricula, d.nome AS disciplina_nome
       FROM notas n
       JOIN alunos a ON n.aluno_id = a.id
       JOIN disciplinas d ON n.disciplina_id = d.id
       ORDER BY a.nome, d.nome`
    );
    return res.json(resultado.rows);
  } catch (err) {
    console.error('Erro ao listar notas:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { consultarBoletim, lancarNota, listarNotas };
