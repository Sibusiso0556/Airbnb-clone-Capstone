import { useState, useCallback, useMemo, useEffect } from 'react';
import * as authService from '../services/authService';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: loggedInUser } = await authService.login(username, password);
      authService.persistSession(token, loggedInUser);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Could not log in. Check your username and password.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: newUser } = await authService.signup(payload);
      authService.persistSession(token, newUser);
      setUser(newUser);
      return newUser;
    } catch (err) {
      const message = err.response?.data?.message || 'Could not create your account.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    authService.clearSession();
    setUser(null);
  }, []);

  useEffect(() => {
    function handleAuthExpired() {
      setUser(null);
    }
    window.addEventListener('airbnb:auth-expired', handleAuthExpired);
    return () => window.removeEventListener('airbnb:auth-expired', handleAuthExpired);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isHost: user?.role === 'host',
      loading,
      error,
      login,
      signup,
      logout,
    }),
    [user, loading, error, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
