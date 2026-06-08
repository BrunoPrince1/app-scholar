import axios from 'axios';
import { Alert } from 'react-native';

// ─── Ajuste o IP para o da sua máquina ao rodar com Expo Go ───────────────────
// Emulador Android: http://10.0.2.2:3000
// Dispositivo físico / Expo Go: http://SEU_IP_LOCAL:3000
// Ex: http://192.168.0.100:3000
const BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Injeta o token JWT em todas as requisições autenticadas
let _token = null;
export function setToken(token) {
  _token = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Interceptor de erros global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const mensagem =
      error.response?.data?.erro ||
      error.message ||
      'Erro de conexão com o servidor.';
    console.error('API Error:', mensagem);
    return Promise.reject(new Error(mensagem));
  }
);

export default api;
