import api from './api';

// ── Professores ───────────────────────────────────────────────────────────────
export const listarProfessores      = () => api.get('/api/professores').then(r => r.data);
export const criarProfessor         = d  => api.post('/api/professores', d).then(r => r.data);
export const atualizarProfessor     = (id, d) => api.put(`/api/professores/${id}`, d).then(r => r.data);
export const deletarProfessor       = id => api.delete(`/api/professores/${id}`).then(r => r.data);

// ── Disciplinas ───────────────────────────────────────────────────────────────
export const listarDisciplinas      = () => api.get('/api/disciplinas').then(r => r.data);
export const criarDisciplina        = d  => api.post('/api/disciplinas', d).then(r => r.data);
export const atualizarDisciplina    = (id, d) => api.put(`/api/disciplinas/${id}`, d).then(r => r.data);
export const deletarDisciplina      = id => api.delete(`/api/disciplinas/${id}`).then(r => r.data);

// ── Notas / Boletim ───────────────────────────────────────────────────────────
export const consultarBoletim       = matricula => api.get(`/api/boletim/${matricula}`).then(r => r.data);
export const meuBoletim             = () => api.get('/api/meu-boletim').then(r => r.data);
export const lancarNota             = d  => api.post('/api/notas', d).then(r => r.data);
export const removerAlunoDaDisciplina = (alunoId, discId) =>
  api.delete(`/api/notas/${alunoId}/${discId}`).then(r => r.data);

// ── Professor: suas disciplinas e alunos ─────────────────────────────────────
export const disciplinasDoProfessor = () => api.get('/api/professor/disciplinas').then(r => r.data);
export const alunosDaDisciplina     = id => api.get(`/api/professor/disciplinas/${id}/alunos`).then(r => r.data);
export const todosAlunosDaDisciplina= id => api.get(`/api/disciplinas/${id}/todos-alunos`).then(r => r.data);

// ── Re-export de alunosService para conveniência ──────────────────────────────
export { listarAlunos } from './alunosService';
