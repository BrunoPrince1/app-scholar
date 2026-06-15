import api from './api';
import axios from 'axios';

// ── CRUD Alunos ──────────────────────────────────────────────────────────────

export async function listarAlunos() {
  const response = await api.get('/api/alunos');
  return response.data;
}

export async function criarAluno(dados) {
  const response = await api.post('/api/alunos', dados);
  return response.data;
}

export async function atualizarAluno(id, dados) {
  const response = await api.put(`/api/alunos/${id}`, dados);
  return response.data;
}

export async function deletarAluno(id) {
  const response = await api.delete(`/api/alunos/${id}`);
  return response.data;
}

// ── API Externa 1: ViaCEP — preenchimento automático de endereço ──────────────

export async function buscarCep(cep) {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos.');
  }
  const response = await axios.get(
    `https://viacep.com.br/ws/${cepLimpo}/json/`
  );
  if (response.data.erro) {
    throw new Error('CEP não encontrado.');
  }
  return {
    endereco: response.data.logradouro,
    cidade: response.data.localidade,
    estado: response.data.uf,
  };
}

// ── API Externa 2: IBGE Localidades — lista de estados e cidades ─────────────

export async function listarEstados() {
  const response = await axios.get(
    'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
  );
  return response.data.map((e) => ({ sigla: e.sigla, nome: e.nome }));
}

export async function listarCidadesPorEstado(uf) {
  const response = await axios.get(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`
  );
  return response.data.map((c) => c.nome);
}
