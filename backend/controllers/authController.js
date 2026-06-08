const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../database/db');

const SENHA_PADRAO    = '123456';
const JWT_SECRET      = () => process.env.JWT_SECRET || 'appschollar_secret';

// ── Helpers ──────────────────────────────────────────────────────────────────

async function hashSenhaPadrao() {
  return bcrypt.hash(SENHA_PADRAO, 10);
}

// ── POST /api/login ───────────────────────────────────────────────────────────
async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios.' });

  try {
    const r = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (!r.rows.length)
      return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const usuario = r.rows[0];
    if (!(await bcrypt.compare(senha, usuario.senha)))
      return res.status(401).json({ erro: 'Credenciais inválidas.' });

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
      JWT_SECRET(), { expiresIn: '8h' }
    );

    // Informa se ainda usa a senha padrão (para forçar troca)
    const senhaPadrao = await bcrypt.compare(SENHA_PADRAO, usuario.senha);

    // Se for aluno ou professor, busca o registro vinculado pelo e-mail
    let vinculo = null;
    if (usuario.perfil === 'aluno') {
      const av = await pool.query('SELECT id, nome, matricula, curso FROM alunos WHERE email=$1', [usuario.email]);
      vinculo = av.rows[0] || null;
    } else if (usuario.perfil === 'professor') {
      const pv = await pool.query('SELECT id, nome, titulacao, area FROM professores WHERE email=$1', [usuario.email]);
      vinculo = pv.rows[0] || null;
    }

    return res.json({
      token,
      senhaPadrao,
      usuario: {
        id: usuario.id, nome: usuario.nome,
        email: usuario.email, perfil: usuario.perfil,
        vinculo,                       // { id, matricula, ... } ou { id, area, ... }
      },
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// ── POST /api/registro ────────────────────────────────────────────────────────
async function registro(req, res) {
  const { nome, email, senha, perfil = 'aluno' } = req.body;
  if (!nome || !email || !senha)
    return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios.' });

  try {
    const hash = await bcrypt.hash(senha, 10);
    const r = await pool.query(
      'INSERT INTO usuarios (nome,email,senha,perfil) VALUES ($1,$2,$3,$4) RETURNING id,nome,email,perfil',
      [nome, email, hash, perfil]
    );
    return res.status(201).json({ usuario: r.rows[0] });
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ erro: 'E-mail já cadastrado.' });
    console.error('Erro no registro:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

// ── PUT /api/alterar-senha ────────────────────────────────────────────────────
// Usuário logado altera a própria senha
async function alterarSenha(req, res) {
  const { senhaAtual, novaSenha } = req.body;
  const usuarioId = req.usuario.id;

  if (!senhaAtual || !novaSenha)
    return res.status(400).json({ erro: 'Senha atual e nova senha são obrigatórias.' });
  if (novaSenha.length < 6)
    return res.status(400).json({ erro: 'A nova senha deve ter ao menos 6 caracteres.' });

  try {
    const r = await pool.query('SELECT senha FROM usuarios WHERE id=$1', [usuarioId]);
    if (!r.rows.length) return res.status(404).json({ erro: 'Usuário não encontrado.' });
    if (!(await bcrypt.compare(senhaAtual, r.rows[0].senha)))
      return res.status(401).json({ erro: 'Senha atual incorreta.' });

    const hash = await bcrypt.hash(novaSenha, 10);
    await pool.query('UPDATE usuarios SET senha=$1 WHERE id=$2', [hash, usuarioId]);
    return res.json({ mensagem: 'Senha alterada com sucesso!' });
  } catch (err) {
    console.error('Erro ao alterar senha:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }
}

module.exports = { login, registro, alterarSenha, hashSenhaPadrao };
