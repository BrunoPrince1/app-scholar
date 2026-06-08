const pool = require('../database/db');

// ── Util ──────────────────────────────────────────────────────────────────────
function calcularMedia(nota1, nota2) {
  const n1 = parseFloat(nota1) || 0;
  const n2 = parseFloat(nota2) || 0;
  const media = parseFloat(((n1 + n2) / 2).toFixed(2));
  return { n1, n2, media, situacao: media >= 6 ? 'Aprovado' : 'Reprovado' };
}

// ── GET /api/boletim/:matricula  (admin consulta qualquer aluno) ───────────────
async function consultarBoletim(req, res) {
  try {
    const alunoR = await pool.query('SELECT * FROM alunos WHERE matricula=$1', [req.params.matricula]);
    if (!alunoR.rows.length) return res.status(404).json({ erro: 'Aluno não encontrado.' });
    const aluno = alunoR.rows[0];

    const notasR = await pool.query(
      `SELECT n.*, d.nome AS disciplina FROM notas n
       JOIN disciplinas d ON n.disciplina_id=d.id
       WHERE n.aluno_id=$1 ORDER BY d.nome ASC`,
      [aluno.id]
    );

    return res.json({
      aluno: aluno.nome, matricula: aluno.matricula, curso: aluno.curso,
      disciplinas: notasR.rows.map(n => ({
        id: n.id,
        disciplina_id: n.disciplina_id,
        disciplina: n.disciplina,
        nota1: parseFloat(n.nota1),
        nota2: parseFloat(n.nota2),
        media: parseFloat(n.media),
        situacao: n.situacao,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── GET /api/meu-boletim  (aluno logado vê o próprio) ────────────────────────
async function meuBoletim(req, res) {
  try {
    const alunoR = await pool.query('SELECT * FROM alunos WHERE email=$1', [req.usuario.email]);
    if (!alunoR.rows.length) return res.status(404).json({ erro: 'Perfil de aluno não encontrado.' });
    const aluno = alunoR.rows[0];

    const notasR = await pool.query(
      `SELECT n.*, d.nome AS disciplina FROM notas n
       JOIN disciplinas d ON n.disciplina_id=d.id
       WHERE n.aluno_id=$1 ORDER BY d.nome ASC`,
      [aluno.id]
    );

    return res.json({
      aluno: aluno.nome, matricula: aluno.matricula, curso: aluno.curso,
      disciplinas: notasR.rows.map(n => ({
        disciplina: n.disciplina,
        nota1: parseFloat(n.nota1),
        nota2: parseFloat(n.nota2),
        media: parseFloat(n.media),
        situacao: n.situacao,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── GET /api/professor/disciplinas  (professor vê suas disciplinas) ───────────
async function disciplinasDoProfessor(req, res) {
  try {
    const profR = await pool.query('SELECT id FROM professores WHERE email=$1', [req.usuario.email]);
    if (!profR.rows.length) return res.status(404).json({ erro: 'Perfil de professor não encontrado.' });
    const professorId = profR.rows[0].id;

    const r = await pool.query(
      `SELECT d.*,
        (SELECT COUNT(*) FROM notas n WHERE n.disciplina_id=d.id) AS total_alunos
       FROM disciplinas d
       WHERE d.professor_id=$1
       ORDER BY d.nome ASC`,
      [professorId]
    );
    return res.json(r.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── GET /api/professor/disciplinas/:id/alunos  (alunos com notas da disciplina) ─
async function alunosDaDisciplina(req, res) {
  const { id } = req.params;
  try {
    // Verifica se o professor logado é dono da disciplina
    const profR = await pool.query('SELECT id FROM professores WHERE email=$1', [req.usuario.email]);
    if (!profR.rows.length) return res.status(403).json({ erro: 'Acesso negado.' });

    const discR = await pool.query('SELECT professor_id FROM disciplinas WHERE id=$1', [id]);
    if (!discR.rows.length) return res.status(404).json({ erro: 'Disciplina não encontrada.' });

    // Admin pode acessar qualquer disciplina; professor só as suas
    if (req.usuario.perfil !== 'admin' && discR.rows[0].professor_id !== profR.rows[0].id)
      return res.status(403).json({ erro: 'Você não é responsável por esta disciplina.' });

    // Todos os alunos com notas (JOIN LEFT para incluir alunos sem nota ainda)
    const r = await pool.query(
      `SELECT a.id AS aluno_id, a.nome AS aluno_nome, a.matricula,
              n.id AS nota_id, n.nota1, n.nota2, n.media, n.situacao
       FROM alunos a
       LEFT JOIN notas n ON n.aluno_id=a.id AND n.disciplina_id=$1
       WHERE n.disciplina_id=$1 OR n.id IS NOT NULL
       ORDER BY a.nome ASC`,
      [id]
    );

    // Buscar todos os alunos inscritos na disciplina (via notas)
    const r2 = await pool.query(
      `SELECT a.id AS aluno_id, a.nome AS aluno_nome, a.matricula,
              n.id AS nota_id,
              COALESCE(n.nota1, 0) AS nota1,
              COALESCE(n.nota2, 0) AS nota2,
              n.media, n.situacao
       FROM notas n
       JOIN alunos a ON a.id=n.aluno_id
       WHERE n.disciplina_id=$1
       ORDER BY a.nome ASC`,
      [id]
    );

    return res.json(r2.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── GET /api/disciplinas/:id/todos-alunos  (alunos disponíveis para vincular) ─
async function todosAlunosDaDisciplina(req, res) {
  const { id } = req.params;
  try {
    // Alunos JÁ matriculados na disciplina
    const r = await pool.query(
      `SELECT a.id, a.nome, a.matricula, a.curso,
              n.id AS nota_id,
              COALESCE(CAST(n.nota1 AS TEXT), '') AS nota1,
              COALESCE(CAST(n.nota2 AS TEXT), '') AS nota2,
              n.media, n.situacao
       FROM alunos a
       LEFT JOIN notas n ON n.aluno_id=a.id AND n.disciplina_id=$1
       ORDER BY a.nome ASC`,
      [id]
    );
    return res.json(r.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── POST /api/notas ───────────────────────────────────────────────────────────
async function lancarNota(req, res) {
  const { aluno_id, disciplina_id, nota1, nota2 } = req.body;
  if (!aluno_id || !disciplina_id)
    return res.status(400).json({ erro: 'aluno_id e disciplina_id são obrigatórios.' });

  // Professores só podem lançar notas em suas próprias disciplinas
  if (req.usuario.perfil === 'professor') {
    const profR = await pool.query('SELECT id FROM professores WHERE email=$1', [req.usuario.email]);
    if (profR.rows.length) {
      const discR = await pool.query('SELECT professor_id FROM disciplinas WHERE id=$1', [disciplina_id]);
      if (discR.rows.length && discR.rows[0].professor_id !== profR.rows[0].id)
        return res.status(403).json({ erro: 'Você não é responsável por esta disciplina.' });
    }
  }

  const { n1, n2, media, situacao } = calcularMedia(nota1, nota2);
  try {
    const r = await pool.query(
      `INSERT INTO notas (aluno_id,disciplina_id,nota1,nota2,media,situacao)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (aluno_id,disciplina_id)
       DO UPDATE SET nota1=$3,nota2=$4,media=$5,situacao=$6
       RETURNING *`,
      [aluno_id, disciplina_id, n1, n2, media, situacao]
    );
    return res.status(201).json({ mensagem: 'Nota lançada com sucesso!', nota: r.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── GET /api/notas ────────────────────────────────────────────────────────────
async function listarNotas(req, res) {
  try {
    const r = await pool.query(
      `SELECT n.*, a.nome AS aluno_nome, a.matricula, d.nome AS disciplina_nome
       FROM notas n
       JOIN alunos a ON n.aluno_id=a.id
       JOIN disciplinas d ON n.disciplina_id=d.id
       ORDER BY a.nome, d.nome`
    );
    return res.json(r.rows);
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

// ── DELETE /api/notas/:alunoId/:disciplinaId  (remover aluno da disciplina) ───
async function removerAlunoDaDisciplina(req, res) {
  const { alunoId, disciplinaId } = req.params;
  try {
    await pool.query('DELETE FROM notas WHERE aluno_id=$1 AND disciplina_id=$2', [alunoId, disciplinaId]);
    return res.json({ mensagem: 'Aluno removido da disciplina.' });
  } catch (err) {
    return res.status(500).json({ erro: 'Erro interno.' });
  }
}

module.exports = {
  consultarBoletim, meuBoletim,
  disciplinasDoProfessor, alunosDaDisciplina, todosAlunosDaDisciplina,
  lancarNota, listarNotas, removerAlunoDaDisciplina,
};
