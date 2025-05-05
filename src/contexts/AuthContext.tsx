import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

interface User {
  id: string;
  username: string;
  email: string;
  contributionPoints: number;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoredData() {
      // This is the line that's causing the issue
      // Changed from getItemAsync to manually handle the promise
      try {
        const storedToken = await SecureStore.getItemAsync('bluescan_token');
        if (storedToken) {
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
            const response = await api.get('/user/profile');
            setUser(response.data);
          } catch (error) {
            await SecureStore.deleteItemAsync('bluescan_token');
          }
        }
      } catch (error) {
        console.error("Error loading token:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadStoredData();
  }, []);

  // Rest of your component remains the same
  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await SecureStore.setItemAsync('bluescan_token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, username });
      const { token, user } = response.data;
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      await SecureStore.setItemAsync('bluescan_token', token);
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('bluescan_token');
    api.defaults.headers.common['Authorization'] = '';
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}