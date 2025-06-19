import React, { createContext, useContext, useState } from 'react';
import type { User } from '../types';

// デモ用のFirebaseUserタイプ
interface DemoUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName: string;
}

interface AuthContextType {
  user: DemoUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<DemoUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading] = useState(false);

  const login = async (email: string, password: string) => {
    // デモ専用認証
    if ((email === 'demo@hq.com' || email === 'demo@fc.com') && password === 'demo12345') {
      const demoUser: DemoUser = {
        uid: email === 'demo@hq.com' ? 'demo-hq-user' : 'demo-fc-user',
        email: email,
        emailVerified: true,
        displayName: email === 'demo@hq.com' ? 'デモHQ管理者' : 'デモFC管理者'
      };
      
      const demoUserData: User = {
        uid: demoUser.uid,
        email: email,
        role: email === 'demo@hq.com' ? 'HQ' : 'FC',
        orgId: email === 'demo@hq.com' ? 'hq-org' : 'demo-fc-org',
        isActive: true
      };
      
      setUser(demoUser);
      setUserData(demoUserData);
      return;
    }
    
    // 他のアカウントは拒否
    throw new Error('デモアカウント以外はサポートされていません');
  };

  const logout = async () => {
    setUser(null);
    setUserData(null);
  };

  const value = {
    user,
    userData,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};