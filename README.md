# App Scholar

**Disciplina:** Programação para Dispositivos Móveis I  
**Professor:** André Olímpio  
**Curso:** Desenvolvimento de Software Multiplataforma — Fatec Jacareí

---

## Visão Geral



- **Backend Node.js + Express** com APIs REST completas
- **Banco de dados PostgreSQL** com 5 tabelas relacionadas
- **Autenticação JWT** (login real com token)
- **Integração ViaCEP** — preenchimento automático de endereço no cadastro de alunos
- **Integração IBGE Localidades** — lista de estados e cidades no cadastro de alunos
- **Axios** para requisições HTTP no mobile

---

## Estrutura do Projeto

```
appschollar_pt2/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Login + Registro
│   │   ├── alunosController.js     # CRUD Alunos
│   │   ├── professoresController.js# CRUD Professores
│   │   ├── disciplinasController.js# CRUD Disciplinas
│   │   └── boletimController.js    # Boletim + Notas
│   ├── database/
│   │   ├── db.js                   # Pool PostgreSQL
│   │   └── schema.sql              # Tabelas + seed inicial
│   ├── middleware/
│   │   └── auth.js                 # Verificação JWT
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── alunosRoutes.js
│   │   ├── professoresRoutes.js
│   │   ├── disciplinasRoutes.js
│   │   └── boletimRoutes.js
│   ├── server.js                   # Ponto de entrada
│   ├── package.json
│   └── .env.example
│
└── mobile/
    ├── src/
    │   ├── components/
    │   │   ├── CustomButton.js
    │   │   └── CustomInput.js
    │   ├── context/
    │   │   └── AuthContext.js      # useContext + login real
    │   ├── navigation/
    │   │   └── AppNavigator.js
    │   ├── screens/
    │   │   ├── LoginScreen.js      # Login via API
    │   │   ├── DashboardScreen.js
    │   │   ├── CadastroAlunoScreen.js   # + ViaCEP + IBGE
    │   │   ├── CadastroProfessorScreen.js
    │   │   ├── CadastroDisciplinaScreen.js
    │   │   └── BoletimScreen.js    # Consulta por matrícula
    │   ├── services/
    │   │   ├── api.js              # Instância axios + token
    │   │   ├── authService.js
    │   │   ├── alunosService.js    # + buscarCep + IBGE
    │   │   └── academicService.js
    │   └── styles/
    │       └── global.js
    ├── App.js
    ├── index.js
    └── package.json
```

---

## Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- Expo CLI (`npm install -g expo-cli`)
- Expo Go no celular ou emulador Android/iOS

---

## Configuração do Backend

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Criar banco de dados no PostgreSQL

```sql
-- No psql ou pgAdmin:
CREATE DATABASE appschollar;
```

### 3. Criar tabelas e dados iniciais

```bash
psql -U postgres -d appschollar -f database/schema.sql
```

### 4. Configurar variáveis de ambiente

```bash
cp .env.example .env
# Edite .env com suas credenciais:
#   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET
```

### 5. Iniciar o servidor

```bash
npm run dev        # Com nodemon (recomendado)
# ou
npm start          # Sem hot-reload
```

O servidor inicia em `http://localhost:3000`

---

## Configuração do Mobile

### 1. Ajustar URL da API

Edite `mobile/src/services/api.js` e altere `BASE_URL`:

```js
// Emulador Android:
const BASE_URL = 'http://10.0.2.2:3000';

// Dispositivo físico (Expo Go):
const BASE_URL = 'http://SEU_IP_LOCAL:3000';
// Ex: http://192.168.0.100:3000
```

Para descobrir seu IP local: `ipconfig` (Windows) ou `ifconfig` (Linux/Mac)

### 2. Instalar dependências

```bash
cd mobile
npm install
```

### 3. Iniciar o app

```bash
npm start
# Escaneie o QR code com o Expo Go
```

---

## APIs Disponíveis

### Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/login` | Login — retorna token JWT |
| POST | `/api/registro` | Criar novo usuário |

**Credenciais padrão (seed):**
- E-mail: `admin@appschollar.com`
- Senha: `admin123`

### Alunos (requer token)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/alunos` | Listar todos |
| GET | `/api/alunos/:id` | Buscar por ID |
| POST | `/api/alunos` | Criar aluno |
| PUT | `/api/alunos/:id` | Atualizar |
| DELETE | `/api/alunos/:id` | Remover |

### Professores (requer token)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/professores` | Listar todos |
| POST | `/api/professores` | Criar professor |
| PUT | `/api/professores/:id` | Atualizar |
| DELETE | `/api/professores/:id` | Remover |

### Disciplinas (requer token)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/disciplinas` | Listar (com nome do professor) |
| POST | `/api/disciplinas` | Criar disciplina |
| PUT | `/api/disciplinas/:id` | Atualizar |
| DELETE | `/api/disciplinas/:id` | Remover |

### Boletim / Notas (requer token)

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/boletim/:matricula` | Consultar boletim completo |
| POST | `/api/notas` | Lançar nota |
| GET | `/api/notas` | Listar todas as notas |

---

## APIs Externas Integradas

### 1. ViaCEP
Usado na tela de Cadastro de Alunos para preenchimento automático de endereço.

```
GET https://viacep.com.br/ws/{cep}/json/
```

Digite o CEP e clique em **Buscar** — endereço, cidade e estado são preenchidos automaticamente.

### 2. IBGE Localidades
Usado na tela de Cadastro de Alunos para selecionar estado e cidade.

```
GET https://servicodados.ibge.gov.br/api/v1/localidades/estados
GET https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios
```

Ao selecionar um estado, a lista de cidades é carregada dinamicamente.

---

## Hooks utilizados

| Hook | Onde | Para quê |
|------|------|----------|
| `useState` | Todas as telas | Formulários, loading, erros, dados |
| `useEffect` | Dashboard, CadastroDisciplina, CadastroAluno | Carregar dados ao montar a tela |
| `useContext` | AuthContext | Estado global de autenticação + token |

---

## Banco de Dados — Diagrama das Tabelas

```
usuarios          alunos               professores
────────          ──────               ───────────
id (PK)           id (PK)              id (PK)
nome              nome                 nome
email (UNIQUE)    matricula (UNIQUE)   titulacao
senha (hash)      curso                area
perfil            email (UNIQUE)       tempo_docencia
criado_em         telefone             email (UNIQUE)
                  cep                  criado_em
                  endereco
                  cidade
                  estado
                  criado_em

disciplinas                   notas
───────────                   ─────
id (PK)                       id (PK)
nome                          aluno_id (FK → alunos)
carga_horaria                 disciplina_id (FK → disciplinas)
professor_id (FK → prof)      nota1
curso                         nota2
semestre                      media
criado_em                     situacao
                              criado_em
                              UNIQUE(aluno_id, disciplina_id)
```
