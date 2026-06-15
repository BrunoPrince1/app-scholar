-- ============================================================
--  App Scholar — Script de criação do banco de dados
--  Execute: psql -U postgres -d appschollar -f database/schema.sql
-- ============================================================

-- Tabela de usuários (para autenticação)
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  perfil VARCHAR(20) NOT NULL DEFAULT 'aluno',
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de alunos
CREATE TABLE IF NOT EXISTS alunos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  matricula VARCHAR(20) UNIQUE NOT NULL,
  curso VARCHAR(100),
  email VARCHAR(150) UNIQUE NOT NULL,
  telefone VARCHAR(20),
  cep VARCHAR(10),
  endereco VARCHAR(200),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de professores
CREATE TABLE IF NOT EXISTS professores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  titulacao VARCHAR(50),
  area VARCHAR(100),
  tempo_docencia INTEGER,
  email VARCHAR(150) UNIQUE NOT NULL,
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  carga_horaria INTEGER NOT NULL,
  professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL,
  curso VARCHAR(100),
  semestre VARCHAR(20),
  criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de notas
CREATE TABLE IF NOT EXISTS notas (
  id SERIAL PRIMARY KEY,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  nota1 NUMERIC(4,2),
  nota2 NUMERIC(4,2),
  media NUMERIC(4,2),
  situacao VARCHAR(20),
  criado_em TIMESTAMP DEFAULT NOW(),
  UNIQUE(aluno_id, disciplina_id)
);

-- ──────────────────────────────────────────────────────────
--  Seed inicial
--  Senhas geradas com bcrypt(10):
--    admin123  → hash abaixo
--    123456    → hash abaixo
-- ──────────────────────────────────────────────────────────

-- Admin (senha: admin123)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES (
  'Administrador',
  'admin@appschollar.com',
  '$2a$10$e3I.DVN/LYGkqb7ziL8CMOemSSwGL0pHKRQKSSXgnk89TSDmXf4ki',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- Professor seed (senha padrão: 123456)
INSERT INTO professores (nome, titulacao, area, tempo_docencia, email) VALUES (
  'Prof. André Olímpio',
  'Mestre',
  'Desenvolvimento de Software',
  10,
  'andre@appschollar.com'
) ON CONFLICT (email) DO NOTHING;

-- Usuário para o professor seed (senha: 123456)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES (
  'Prof. André Olímpio',
  'andre@appschollar.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'professor'
) ON CONFLICT (email) DO NOTHING;

-- Aluno seed (senha padrão: 123456)
INSERT INTO alunos (nome, matricula, curso, email, telefone, cep, endereco, cidade, estado) VALUES (
  'João Silva',
  '2024001',
  'Desenvolvimento de Software Multiplataforma',
  'joao@email.com',
  '(12) 99999-0001',
  '12245-000',
  'Rua Exemplo, 100',
  'São José dos Campos',
  'SP'
) ON CONFLICT (email) DO NOTHING;

-- Usuário para o aluno seed (senha: 123456)
INSERT INTO usuarios (nome, email, senha, perfil) VALUES (
  'João Silva',
  'joao@email.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'aluno'
) ON CONFLICT (email) DO NOTHING;

-- Disciplina seed
INSERT INTO disciplinas (nome, carga_horaria, professor_id, curso, semestre) VALUES (
  'Programação para Dispositivos Móveis I',
  80,
  1,
  'Desenvolvimento de Software Multiplataforma',
  '3° Semestre'
) ON CONFLICT DO NOTHING;

-- Nota seed
INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao) VALUES (
  1, 1, 8.5, 9.0, 8.75, 'Aprovado'
) ON CONFLICT DO NOTHING;
