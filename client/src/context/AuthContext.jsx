import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  login as loginService,
  logout as logoutService,
  getToken,
  getStoredUser,
} from '../services/authService';

const AuthContext = createContext(null);

/**
 * Provides authentication state and helpers to the component tree.
 *
 * - `user`         — current admin user object or null
 * - `isLoading`    — true while initial auth check is running
 * - `login(email, password)` — authenticate and update state
 * - `logout()`     — clear auth state
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount
  useEffect(() => {
    const token = getToken();
    const stored = getStoredUser();

    if (token && stored) {
      setUser(stored);
    }

    setIsLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { user: loggedInUser } = await loginService(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook — access the auth context.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return ctx;
}

