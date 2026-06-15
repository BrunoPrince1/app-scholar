import React, { createContext, useState, useContext } from 'react';
import { setToken } from '../services/api';
import { loginApi } from '../services/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn,   setIsLoggedIn]   = useState(false);
  const [user,         setUser]         = useState(null);   // { id, nome, email, perfil, vinculo }
  const [senhaPadrao,  setSenhaPadrao]  = useState(false);
  const [loading,      setLoading]      = useState(false);

  const login = async (email, senha) => {
    setLoading(true);
    try {
      const { token, usuario, senhaPadrao: sp } = await loginApi(email, senha);
      setToken(token);
      setUser(usuario);
      setSenhaPadrao(sp);
      setIsLoggedIn(true);
      return { sucesso: true, perfil: usuario.perfil, senhaPadrao: sp };
    } catch (err) {
      return { sucesso: false, erro: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setSenhaPadrao(false);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, senhaPadrao, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
