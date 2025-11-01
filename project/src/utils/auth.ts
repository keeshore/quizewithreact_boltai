import { User, UserSession } from '../types/auth';
import { hashPassword, verifyPassword, generateId } from './helpers';

// Storage keys
const AUTH_KEYS = {
  USERS: 'quiz_users',
  CURRENT_SESSION: 'quiz_current_session',
  SESSIONS: 'quiz_sessions',
};

// User operations
export const saveUser = (user: User): void => {
  try {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
  } catch (error) {
    console.error('Failed to save user:', error);
  }
};

export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(AUTH_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const getUserByEmail = (email: string): User | null => {
  const users = getUsers();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

export const getUserById = (id: string): User | null => {
  const users = getUsers();
  return users.find(u => u.id === id) || null;
};

export const updateUser = (updatedUser: User): void => {
  try {
    const users = getUsers();
    const index = users.findIndex(u => u.id === updatedUser.id);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(AUTH_KEYS.USERS, JSON.stringify(users));
    }
  } catch (error) {
    console.error('Failed to update user:', error);
  }
};

// Session operations
export const createUserSession = (userId: string): UserSession => {
  const session: UserSession = {
    userId,
    token: generateId() + '_' + Date.now(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
  };
  
  try {
    localStorage.setItem(AUTH_KEYS.CURRENT_SESSION, JSON.stringify(session));
    
    // Update user's last login
    const user = getUserById(userId);
    if (user) {
      updateUser({
        ...user,
        lastLoginAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('Failed to create session:', error);
  }
  
  return session;
};

export const getCurrentSession = (): UserSession | null => {
  try {
    const data = localStorage.getItem(AUTH_KEYS.CURRENT_SESSION);
    if (!data) return null;
    
    const session: UserSession = JSON.parse(data);
    
    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      clearCurrentSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

export const clearCurrentSession = (): void => {
  try {
    localStorage.removeItem(AUTH_KEYS.CURRENT_SESSION);
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
};

export const getCurrentUser = (): User | null => {
  const session = getCurrentSession();
  if (!session) return null;
  
  return getUserById(session.userId);
};

// Auth functions
export const registerUser = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // Check if user already exists
    const existingUser = getUserByEmail(email);
    if (existingUser) {
      return { success: false, error: 'User with this email already exists' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Validate password strength
    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    // Create new user
    const passwordHash = await hashPassword(password);
    const user: User = {
      id: generateId(),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    saveUser(user);
    return { success: true };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: 'Registration failed. Please try again.' };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: User }> => {
  try {
    const user = getUserByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};