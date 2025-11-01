import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContext as AuthContextType } from '../types/auth';
import { loginUser, registerUser, getCurrentUser, createUserSession, clearCurrentSession } from '../utils/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on app start
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await loginUser(email, password);
      if (result.success && result.user) {
        createUserSession(result.user.id);
        setUser(result.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await registerUser(email, password, name);
      if (result.success) {
        // Auto login after successful registration
        const loginResult = await loginUser(email, password);
        if (loginResult.success && loginResult.user) {
          createUserSession(loginResult.user.id);
          setUser(loginResult.user);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearCurrentSession();
    setUser(null);
  };

  const contextValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};