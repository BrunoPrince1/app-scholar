import api from './api';

export async function loginApi(email, senha) {
  const response = await api.post('/api/login', { email, senha });
  return response.data; // { token, usuario, senhaPadrao }
}

export async function alterarSenhaApi(senhaAtual, novaSenha) {
  const response = await api.put('/api/alterar-senha', { senhaAtual, novaSenha });
  return response.data;
}
