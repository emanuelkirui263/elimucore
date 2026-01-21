import { create } from 'zustand';
import { authAPI } from '../api/endpoints';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  // Initialize from localStorage
  init: () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      set({ user: JSON.parse(user), token });
    }
  },

  // Login
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, token, isLoading: false });
      return user;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null, error: null });
  },

  // Change password
  changePassword: async (oldPassword, newPassword) => {
    set({ isLoading: true, error: null });
    try {
      await authAPI.changePassword(oldPassword, newPassword);
      set({ isLoading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Check if authenticated
  isAuthenticated: () => !!localStorage.getItem('token'),

  // Get user role
  getUserRole: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user).role : null;
  },
}));

export default useAuthStore;
