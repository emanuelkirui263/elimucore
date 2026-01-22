import create from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isSignedIn: false,
  biometricEnabled: false,
  loading: true,

  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  setIsSignedIn: (isSignedIn) => set({ isSignedIn }),
  setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
  
  login: async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const data = await response.json();
      const { user, token } = data;
      
      set({ user, token, isSignedIn: true });
      await AsyncStorage.setItem('token', token);
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  biometricLogin: async (email) => {
    try {
      // Retrieve credentials from secure storage
      const credentials = await Keychain.getGenericPassword();
      
      if (!credentials || credentials.username !== email) {
        throw new Error('No stored credentials for this email');
      }

      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: credentials.username, 
          password: credentials.password 
        }),
      });

      if (!response.ok) throw new Error('Biometric login failed');

      const data = await response.json();
      const { user, token } = data;

      set({ user, token, isSignedIn: true });
      await AsyncStorage.setItem('token', token);

      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    set({ user: null, token: null, isSignedIn: false });
  },

  restoreToken: async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        set({ token, isSignedIn: true });
      }
    } catch (error) {
      console.error('Failed to restore token:', error);
    } finally {
      set({ loading: false });
    }
  },
}));
