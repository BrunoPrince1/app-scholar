import React, { createContext, useState, useContext } from 'react';
import { setToken } from '../services/api';
import { loginApi } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  // Login real via API REST
  const login = async (email, senha) => {
    setLoading(true);
    try {
      const { token, usuario } = await loginApi(email, senha);
      setToken(token);          // injeta o JWT em todas as próximas requisições
      setUser(usuario);
      setIsLoggedIn(true);
      return { sucesso: true };
    } catch (err) {
      return { sucesso: false, erro: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
