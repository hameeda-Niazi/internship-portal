import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!localStorage.getItem('launchpad-token')) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data.user))
      .catch(() => localStorage.removeItem('launchpad-token'))
      .finally(() => setLoading(false));
  }, []);
  const value = useMemo(() => ({
    user, loading,
    async login(credentials) {
      const { data } = await api.post('/auth/login', credentials);
      localStorage.setItem('launchpad-token', data.token);
      setUser(data.user);
      return data.user;
    },
    async register(payload) {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('launchpad-token', data.token);
      setUser(data.user);
      return data.user;
    },
    async refresh() {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      return data.user;
    },
    logout() {
      localStorage.removeItem('launchpad-token');
      setUser(null);
    }
  }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
