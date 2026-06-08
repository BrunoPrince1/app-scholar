import api from './api';

export async function loginApi(email, senha) {
  const response = await api.post('/api/login', { email, senha });
  return response.data; // { token, usuario }
}
