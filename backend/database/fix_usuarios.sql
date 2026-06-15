-- ============================================================
--  SCRIPT DE CORREÇÃO — Criar usuários para alunos e
--  professores que já existem no BD mas não têm login.
--
--  Execute APÓS rodar o schema.sql:
--  psql -U postgres -d appschollar -f database/fix_usuarios.sql
--
--  Hash abaixo = bcrypt("123456", 10)
-- ============================================================

-- Cria usuário para cada ALUNO que ainda não tem login
INSERT INTO usuarios (nome, email, senha, perfil)
SELECT a.nome, a.email,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'aluno'
FROM alunos a
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios u WHERE u.email = a.email
);

-- Cria usuário para cada PROFESSOR que ainda não tem login
INSERT INTO usuarios (nome, email, senha, perfil)
SELECT p.nome, p.email,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'professor'
FROM professores p
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios u WHERE u.email = p.email
);

-- Confirmar quantos foram criados
SELECT perfil, COUNT(*) AS total FROM usuarios GROUP BY perfil ORDER BY perfil;
