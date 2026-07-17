import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { apiRequest, configureApiTokens } from '../api/client';
import { clearTokens, loadTokens, saveTokens } from '../auth/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  const persistSession = async (tokens, nextUser) => {
    configureApiTokens(tokens, persistSession);
    await saveTokens(tokens);
    if (nextUser) {
      setUser(nextUser);
    }
  };

  useEffect(() => {
    let mounted = true;

    const boot = async () => {
      try {
        const tokens = await loadTokens();
        configureApiTokens(tokens, persistSession);
        if (tokens.accessToken) {
          const data = await apiRequest('/auth/me');
          if (mounted) setUser(data.user);
        } else if (tokens.refreshToken) {
          const data = await apiRequest('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });
          await persistSession(data, data.user);
        }
      } catch {
        await clearTokens();
        configureApiTokens(null, persistSession);
      } finally {
        if (mounted) setBooting(false);
      }
    };

    boot();
    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo(() => ({
    user,
    booting,
    async login(email, password) {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await persistSession(data, data.user);
      setUser(data.user);
    },
    async register({ email, password, name, phone }) {
      const data = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, name, phone }),
      });
      await persistSession(data, data.user);
      setUser(data.user);
    },
    async loginWithGoogle(idToken) {
      const data = await apiRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken }),
      });
      await persistSession(data, data.user);
      setUser(data.user);
    },
    async logout() {
      const tokens = await loadTokens();
      try {
        if (tokens.refreshToken) {
          await apiRequest('/auth/logout', {
            method: 'POST',
            body: JSON.stringify({ refreshToken: tokens.refreshToken }),
          });
        }
      } catch (error) {
        Alert.alert('Logout', error.message);
      } finally {
        await clearTokens();
        configureApiTokens(null, persistSession);
        setUser(null);
      }
    },
  }), [user, booting]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
