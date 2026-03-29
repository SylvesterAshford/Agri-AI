import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, UserRole, UserTier, KYCStatus, AuthTokens } from '@/types/auth';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'agrishield_access_token',
  REFRESH_TOKEN: 'agrishield_refresh_token',
  USER: 'agrishield_user',
};

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; phone: string; name: string; township: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  hasPermission: (resource: string, action: string) => boolean;
  isFarmer: () => boolean;
  isExpert: () => boolean;
  isValidator: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for development
const MOCK_USERS: Record<string, User & { password: string }> = {
  'farmer@example.com': {
    id: 'user_1',
    email: 'farmer@example.com',
    password: 'password123',
    phone: '+959123456789',
    name: 'ဦးစောလှိုင်',
    role: 'farmer',
    tier: 'bronze',
    score: 150,
    kycStatus: 'pending',
    township: 'ညောင်ဦး',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'expert@example.com': {
    id: 'user_2',
    email: 'expert@example.com',
    password: 'password123',
    phone: '+959123456788',
    name: 'ဒေါ်သိဒ္ဓာ',
    role: 'expert',
    tier: 'silver',
    score: 450,
    kycStatus: 'approved',
    township: 'ညောင်ဦး',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'validator@example.com': {
    id: 'user_3',
    email: 'validator@example.com',
    password: 'password123',
    phone: '+959123456787',
    name: 'ဦးကျော်စွာ',
    role: 'validator',
    tier: 'gold',
    score: 750,
    kycStatus: 'approved',
    township: 'မန္တလေး',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  'admin@example.com': {
    id: 'user_4',
    email: 'admin@example.com',
    password: 'password123',
    phone: '+959123456786',
    name: 'Admin User',
    role: 'admin',
    tier: 'platinum',
    score: 1000,
    kycStatus: 'approved',
    township: 'နေပြည်တော်',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  // Load stored auth on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedUser = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
      const storedTokens = await SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);

      if (storedUser && storedTokens) {
        setUser(JSON.parse(storedUser));
        setTokens(JSON.parse(storedTokens));
      }
    } catch (error) {
      console.error('Failed to load stored auth:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email: string, password: string) {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockUser = MOCK_USERS[email.toLowerCase()];

      if (!mockUser || mockUser.password !== password) {
        throw new Error('Invalid email or password');
      }

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = mockUser;

      // Create mock tokens
      const mockTokens: AuthTokens = {
        accessToken: `mock_access_token_${userWithoutPassword.id}`,
        refreshToken: `mock_refresh_token_${userWithoutPassword.id}`,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      };

      // Store in secure storage
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(userWithoutPassword));
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify(mockTokens));

      setUser(userWithoutPassword);
      setTokens(mockTokens);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(data: { email: string; password: string; phone: string; name: string; township: string }) {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      if (MOCK_USERS[data.email.toLowerCase()]) {
        throw new Error('Email already registered');
      }

      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: data.email.toLowerCase(),
        phone: data.phone,
        name: data.name,
        role: 'farmer', // All new users start as farmers
        tier: 'bronze',
        score: 0,
        kycStatus: 'not_submitted',
        township: data.township,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Create mock tokens
      const mockTokens: AuthTokens = {
        accessToken: `mock_access_token_${newUser.id}`,
        refreshToken: `mock_refresh_token_${newUser.id}`,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000),
      };

      // Store in secure storage
      await SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(newUser));
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, JSON.stringify(mockTokens));

      setUser(newUser);
      setTokens(mockTokens);
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setTokens(null);
    }
  }

  function updateUser(updates: Partial<User>) {
    if (!user) return;

    const updatedUser = { ...user, ...updates, updatedAt: new Date().toISOString() };
    setUser(updatedUser);
    SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
  }

  function hasPermission(resource: string, action: string): boolean {
    if (!user) return false;

    // Admin has all permissions
    if (user.role === 'admin') return true;

    // Simple permission check (in production, this would check against a permission matrix)
    const permissions: Record<UserRole, Record<string, string[]>> = {
      farmer: {
        community: ['read', 'create'],
        kyc: ['read', 'create'],
        loans: ['read', 'create'],
        points: ['read'],
      },
      expert: {
        community: ['read', 'create', 'answer'],
        kyc: ['read', 'create'],
        loans: ['read', 'create'],
        points: ['read'],
      },
      validator: {
        community: ['read'],
        kyc: ['read', 'verify', 'reject', 'send_back'],
        loans: ['read'],
        points: ['read'],
      },
      admin: {
        community: ['read', 'create', 'delete'],
        kyc: ['read', 'verify', 'reject', 'send_back'],
        loans: ['read', 'approve', 'reject'],
        points: ['read', 'adjust'],
        users: ['read', 'create', 'update', 'delete'],
        permissions: ['read', 'write'],
      },
    };

    const userPermissions = permissions[user.role];
    return userPermissions?.[resource]?.includes(action) ?? false;
  }

  function isFarmer(): boolean {
    return user?.role === 'farmer';
  }

  function isExpert(): boolean {
    return user?.role === 'expert' || (user?.score || 0) >= 300;
  }

  function isValidator(): boolean {
    return user?.role === 'validator';
  }

  function isAdmin(): boolean {
    return user?.role === 'admin';
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    hasPermission,
    isFarmer,
    isExpert,
    isValidator,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
