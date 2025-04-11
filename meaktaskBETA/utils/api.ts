import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base URL for API - dynamically set based on platform
// Android emulator: 10.0.2.2 (special IP that forwards to host machine's localhost)
// iOS simulator: localhost
// Physical device: your computer's actual IP address on the network

const getApiUrl = () => {
  // When using Expo Go on a physical device, we need to use the computer's actual IP address
  // Get your IP by running 'ipconfig' on Windows or 'ifconfig' on Mac/Linux
  const YOUR_COMPUTER_IP = '192.168.1.10'; // REPLACE THIS with your computer's actual IP address
  
  // For Expo Go on physical devices, we always need to use the actual IP
  if (Platform.OS === 'android') {
    // For Android emulator
    return 'http://10.0.2.2:5001/api';
  } else if (Platform.OS === 'ios') {
    // For iOS, always use the IP address to be safe
    // This ensures it works on both simulator and physical devices with Expo Go
    return `http://${YOUR_COMPUTER_IP}:5001/api`;
  } else {
    // Web or fallback
    return 'http://localhost:5001/api';
  }
};

const API_URL = getApiUrl();
console.log('Using API URL:', API_URL);

// Setup axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Check for both token keys - 'token' and 'userToken'
      const token = await AsyncStorage.getItem('userToken') || await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      console.log(`${config.method?.toUpperCase()} Request to: ${config.baseURL}${config.url}`);
      return config;
    } catch (error) {
      console.error('Request interceptor error:', error);
      return config;
    }
  },
  (error) => {
    console.error('Request interceptor rejection:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for better error logging
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}: Status ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Error: ${error.config.url} - Status ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  // Register user
  register: async (userData: { name: string; email: string; password: string }) => {
    console.log('Registering user:', { email: userData.email });
    try {
      const response = await api.post('/auth/register', userData);
      console.log('Registration response:', response.data);
      if (response.data.token) {
        // Store token with consistent key
        await AsyncStorage.setItem('userToken', response.data.token);
        // Also store user data directly if it exists
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error.response?.data?.error || 'Registration failed';
    }
  },

  // Login user
  login: async (userData: { email: string; password: string }) => {
    console.log('Logging in user:', { email: userData.email });
    try {
      const response = await api.post('/auth/login', userData);
      console.log('Login response:', response.data);
      if (response.data.token) {
        // Store token with consistent key
        await AsyncStorage.setItem('userToken', response.data.token);
        // Also store user data directly if it exists
        if (response.data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
        }
      }
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error.response?.data?.error || 'Login failed';
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      // Log the token for debugging
      const token = await AsyncStorage.getItem('userToken');
      console.log('getCurrentUser - Token available:', !!token);
      
      const response = await api.get('/users/me');
      console.log('getCurrentUser response:', response.data);
      
      // Extract user data from the nested structure
      let userData = null;
      if (response.data && response.data.data) {
        // Handle the nested structure where user data is in response.data.data
        userData = response.data.data;
        console.log('Extracted user data from nested response:', userData);
        
        // Store the correctly formatted userData in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        return userData;
      } else if (response.data && response.data.email) {
        // Handle case where data is directly in response.data
        userData = response.data;
        console.log('User data is directly in response:', userData);
        
        // Store the userData in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
        
        return userData;
      } else {
        console.log('getCurrentUser - Invalid response format:', response.data);
        
        // Fall back to local data if backend fails to return valid user object
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          console.log('getCurrentUser - Using cached data instead');
          return JSON.parse(cachedUserData);
        }
        
        return null;
      }
    } catch (error: any) {
      console.error('Get current user error:', error);
      
      // Fall back to local data if backend request fails
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          console.log('getCurrentUser - Using cached data after error');
          return JSON.parse(cachedUserData);
        }
      } catch (e) {
        console.error('Failed to retrieve cached user data:', e);
      }
      
      throw error.response?.data?.error || 'Failed to get user data';
    }
  },

  // Logout user
  logout: async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
  },

  // Check if user is logged in
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('userToken');
    return !!token;
  }
};

// Add this after the API_URL declaration but before exporting
// Connection check helper
export const checkApiConnection = async () => {
  try {
    console.log('Checking connection to API server...');
    const response = await axios.get(`${API_URL.replace('/api', '')}/`);
    console.log('API server is reachable:', response.status);
    return true;
  } catch (error: any) {
    console.error('API server is not reachable. Error:', error.message || 'Unknown error');
    console.log('Please ensure:');
    console.log('1. Your backend server is running');
    console.log(`2. Your IP address (${API_URL}) is correct`);
    console.log('3. Your device and server are on the same network');
    return false;
  }
};

export default api; 