import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Mock Users for demonstration
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'João Silva (Dono)',
    email: 'admin@bov.com',
    role: 'owner',
    farmName: 'Fazenda Boa Esperança',
    avatarUrl: 'JS'
  },
  {
    id: '2',
    name: 'Maria Souza (Gerente)',
    email: 'gerente@bov.com',
    role: 'manager',
    farmName: 'Fazenda Boa Esperança',
    avatarUrl: 'MS'
  },
  {
    id: '3',
    name: 'Pedro Santos (Peão)',
    email: 'peao@bov.com',
    role: 'collaborator',
    farmName: 'Fazenda Boa Esperança',
    avatarUrl: 'PS'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('bov_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulating API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock password check
        if (password === '123456') {
          const foundUser = MOCK_USERS.find(u => u.email === email);
          if (foundUser) {
            setUser(foundUser);
            localStorage.setItem('bov_user', JSON.stringify(foundUser));
            resolve(true);
            return;
          }
        }
        resolve(false);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bov_user');
  };

  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);