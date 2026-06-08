import api from './api';

// ── Professores ──────────────────────────────────────────────────────────────

export async function listarProfessores() {
  const response = await api.get('/api/professores');
  return response.data;
}

export async function criarProfessor(dados) {
  const response = await api.post('/api/professores', dados);
  return response.data;
}

export async function atualizarProfessor(id, dados) {
  const response = await api.put(`/api/professores/${id}`, dados);
  return response.data;
}

export async function deletarProfessor(id) {
  const response = await api.delete(`/api/professores/${id}`);
  return response.data;
}

// ── Disciplinas ──────────────────────────────────────────────────────────────

export async function listarDisciplinas() {
  const response = await api.get('/api/disciplinas');
  return response.data;
}

export async function criarDisciplina(dados) {
  const response = await api.post('/api/disciplinas', dados);
  return response.data;
}

export async function atualizarDisciplina(id, dados) {
  const response = await api.put(`/api/disciplinas/${id}`, dados);
  return response.data;
}

export async function deletarDisciplina(id) {
  const response = await api.delete(`/api/disciplinas/${id}`);
  return response.data;
}

// ── Boletim ──────────────────────────────────────────────────────────────────

export async function consultarBoletim(matricula) {
  const response = await api.get(`/api/boletim/${matricula}`);
  return response.data;
}

export async function lancarNota(dados) {
  const response = await api.post('/api/notas', dados);
  return response.data;
}
