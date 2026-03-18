import React, { createContext, useContext, useState } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  signup: (data: { username: string; password: string; firstName: string; lastName: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'password' | 'bio'>>) => void;
}

const USERS_KEY = 'maps_users';
const CURRENT_USER_KEY = 'maps_current_user';

function getAllUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function loadCurrentUser(): User | null {
  const id = localStorage.getItem(CURRENT_USER_KEY);
  if (!id) return null;
  return getAllUsers().find(u => u.id === id) || null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(loadCurrentUser);

  const login = (username: string, password: string) => {
    const users = getAllUsers();
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return { success: false, error: 'Invalid username or password' };
    localStorage.setItem(CURRENT_USER_KEY, user.id);
    setCurrentUser(user);
    return { success: true };
  };

  const signup = (data: { username: string; password: string; firstName: string; lastName: string }) => {
    const users = getAllUsers();
    if (users.some(u => u.username === data.username)) {
      return { success: false, error: 'Username already taken' };
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      bio: '',
    };
    saveUsers([...users, newUser]);
    localStorage.setItem(CURRENT_USER_KEY, newUser.id);
    setCurrentUser(newUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    setCurrentUser(null);
  };

  const updateProfile = (updates: Partial<Pick<User, 'firstName' | 'lastName' | 'password' | 'bio'>>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    const users = getAllUsers().map(u => u.id === updated.id ? updated : u);
    saveUsers(users);
    setCurrentUser(updated);
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated: !!currentUser, login, signup, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
