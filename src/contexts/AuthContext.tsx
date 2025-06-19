import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import type { User } from '../types';

interface AuthContextType {
  user: FirebaseUser | null;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as User);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    // デモ用認証を先にチェック
    if ((email === 'demo@hq.com' || email === 'demo@fc.com') && password === 'demo12345') {
      const demoUser = {
        uid: email === 'demo@hq.com' ? 'demo-hq-user' : 'demo-fc-user',
        email: email,
        emailVerified: true,
        displayName: email === 'demo@hq.com' ? 'デモHQ管理者' : 'デモFC管理者'
      } as FirebaseUser;
      
      const demoUserData = {
        uid: demoUser.uid,
        email: email,
        role: email === 'demo@hq.com' ? 'HQ' : 'FC',
        orgId: email === 'demo@hq.com' ? 'hq-org' : 'demo-fc-org',
        isActive: true
      } as User;
      
      setUser(demoUser);
      setUserData(demoUserData);
      setLoading(false);
      return Promise.resolve();
    }
    
    // 通常のFirebase認証
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
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