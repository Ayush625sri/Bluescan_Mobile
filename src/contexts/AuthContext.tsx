import React, { createContext, useState, useEffect, useContext } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';
import websocketService from '../services/websocket';
import * as Device from 'expo-device';
// Define missing User interface
interface User {
  id: string;
  username: string;
  email: string;
  contributionPoints?: number;
  contributionCount?: number;
}

interface Session {
  id: string;
  requesterId: string;
  requesterName: string;
  status: 'pending' | 'active' | 'ended';
  startTime?: Date;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  isSessionActive: boolean;
  activeSession: Session | null;
  acceptSessionRequest: (sessionId: string) => Promise<void>;
  rejectSessionRequest: (sessionId: string) => Promise<void>;
  endSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  // Load token from storage on initial mount
  useEffect(() => {
    async function loadStoredData() {
      try {
        const storedToken = await SecureStore.getItemAsync('bluescan_token');
        if (storedToken) {
          setToken(storedToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

          try {
            const response = await api.get('/user/profile');
            setUser(response.data);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // Invalid token, clear it
            await SecureStore.deleteItemAsync('bluescan_token');
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Error loading stored token:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStoredData();
  }, []);

  // Initialize websocket connection when token changes
  useEffect(() => {
    let cleanupListeners = () => { };

    if (token) {
      try {
        // Connect to websocket
        websocketService.connect(token);

        // Register device with server
        registerDevice();

        // Setup session request listener
        setupSessionListeners();

        cleanupListeners = () => {
          // Clean up all listeners
          websocketService.off('session_request');
          websocketService.off('session_canceled');
          websocketService.off('session_ended');
        };
      } catch (error) {
        console.error('Error setting up WebSocket:', error);
      }
    } else {
      websocketService.disconnect();
    }

    return cleanupListeners;
  }, [token]);

  const registerDevice = async () => {
    try {
      const deviceName = Device.deviceName || 'Mobile Device';
      const deviceId = await SecureStore.getItemAsync('device_id') ||
        `mobile_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Store device ID for future use
      await SecureStore.setItemAsync('device_id', deviceId);

      // Send device info to server via websocket
      if (websocketService.isConnected()) {
        websocketService.emit('register_device', {
          device_name: deviceName,
          device_type: 'mobile',
          device_id: deviceId
        });
      }
    } catch (error) {
      console.error('Error registering device:', error);
    }
  };

  const setupSessionListeners = () => {
    // Handle incoming session requests
    websocketService.on('session_request', (data) => {
      const { session_id, requester_id, requester_name } = data;

      setActiveSession({
        id: session_id || 'unknown',
        requesterId: requester_id || 'unknown',
        requesterName: requester_name || 'Unknown User',
        status: 'pending'
      });
    });

    // Handle canceled session requests
    websocketService.on('session_canceled', () => {
      setActiveSession(null);
    });

    // Handle session end
    websocketService.on('session_ended', () => {
      setIsSessionActive(false);
      setActiveSession(prev => prev ? { ...prev, status: 'ended' } : null);
    });
  };

  const acceptSessionRequest = async (sessionId: string) => {
    try {
      await api.post(`/session/${sessionId}/respond`, { accepted: true });

      setIsSessionActive(true);
      setActiveSession(prev => prev ? { ...prev, status: 'active', startTime: new Date() } : null);
    } catch (error) {
      console.error('Error accepting session:', error);
      throw error;
    }
  };

  const rejectSessionRequest = async (sessionId: string) => {
    try {
      await api.post(`/session/${sessionId}/respond`, { accepted: false });
      setActiveSession(null);
    } catch (error) {
      console.error('Error rejecting session:', error);
      throw error;
    }
  };

  const endSession = async () => {
    if (activeSession) {
      try {
        await api.post(`/session/${activeSession.id}/end`);
        setIsSessionActive(false);
        setActiveSession(prev => prev ? { ...prev, status: 'ended' } : null);
      } catch (error) {
        console.error('Error ending session:', error);
        throw error;
      }
    }
  };

const signIn = async (email: string, password: string) => {
  try {
    console.log('SignIn started with:', email);
    
    // Create form data for login
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    // Get auth token
    const authResponse = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    console.log('Auth response received:', authResponse.data);
    const authToken = authResponse.data.access_token;

    if (!authToken) {
      throw new Error('Invalid response from server');
    }

    // Set token in headers
    api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // Get user data
    const userResponse = await api.get('/auth/me');
    const userData = userResponse.data;
    console.log('User data received:', userData);

    // Store token securely
    await SecureStore.setItemAsync('bluescan_token', authToken);

    // Update state
    console.log('Setting token and user state...');
    setToken(authToken);
    setUser(userData);
    console.log('User state set:', userData);
    
    return userData; // Return the user data in case it's needed
  } catch (error) {
    console.error('Sign in error:', error);
    throw error;
  }
};

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const response = await api.post('/auth/register', { email, password, username });
      const { token: authToken, user: userData } = response.data;

      if (!authToken || !userData) {
        throw new Error('Invalid response from server');
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      await SecureStore.setItemAsync('bluescan_token', authToken);

      setToken(authToken);
      setUser(userData);
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await SecureStore.deleteItemAsync('bluescan_token');
      api.defaults.headers.common['Authorization'] = '';
      websocketService.disconnect();
      setToken(null);
      setUser(null);
      setIsSessionActive(false);
      setActiveSession(null);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signOut,
      signUp,
      isSessionActive,
      activeSession,
      acceptSessionRequest,
      rejectSessionRequest,
      endSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};