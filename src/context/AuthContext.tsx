// ============================================
// Authentication Context
// Manages user login state across the app
// ============================================

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, AuthContextType } from '@/types';
import { mockUsers } from '@/data/mockData';

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys for persistence
const TOKEN_KEY = 'doctorgo_token';
const USER_KEY = 'doctorgo_user';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved auth state on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  // Login function - simulates API call
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find user in mock data
    const foundUser = mockUsers.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!foundUser) {
      setIsLoading(false);
      return { success: false, error: 'Invalid email or password' };
    }

    // Create mock token and user object (without password)
    const mockToken = `mock_jwt_${Date.now()}_${foundUser.id}`;
    const userWithoutPassword: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      createdAt: foundUser.createdAt,
    };

    // Save to state and localStorage
    setToken(mockToken);
    setUser(userWithoutPassword);
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userWithoutPassword));

    setIsLoading(false);
    return { success: true };
  };

  // Signup function - simulates API call
  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      setIsLoading(false);
      return { success: false, error: 'An account with this email already exists' };
    }

    // Create new user
    const newUser: User = {
      id: Date.now(),
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    };

    // Add to mock users (in-memory only for demo)
    mockUsers.push({ ...newUser, password });

    // Create mock token
    const mockToken = `mock_jwt_${Date.now()}_${newUser.id}`;

    // Save to state and localStorage
    setToken(mockToken);
    setUser(newUser);
    localStorage.setItem(TOKEN_KEY, mockToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));

    setIsLoading(false);
    return { success: true };
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
