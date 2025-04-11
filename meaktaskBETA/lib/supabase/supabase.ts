import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Create a platform-specific storage adapter
const createStorageAdapter = () => {
  // For web platform, use localStorage with fallback
  if (Platform.OS === 'web') {
    return {
      getItem: async (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem(key);
          }
          return null;
        } catch (error) {
          console.error('Error getting item from localStorage:', error);
          return null;
        }
      },
      setItem: async (key: string, value: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem(key, value);
          }
        } catch (error) {
          console.error('Error setting item in localStorage:', error);
        }
      },
      removeItem: async (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.removeItem(key);
          }
        } catch (error) {
          console.error('Error removing item from localStorage:', error);
        }
      },
    };
  }
  
  // For native platforms, use AsyncStorage
  return {
    getItem: async (key: string) => {
      try {
        return await AsyncStorage.getItem(key);
      } catch (error) {
        console.error('Error getting item from AsyncStorage:', error);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (error) {
        console.error('Error setting item in AsyncStorage:', error);
      }
    },
    removeItem: async (key: string) => {
      try {
        await AsyncStorage.removeItem(key);
      } catch (error) {
        console.error('Error removing item from AsyncStorage:', error);
      }
    },
  };
};

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorageAdapter(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Helper function to check if email is confirmed
export const isEmailConfirmed = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    
    // Check if email is confirmed
    return data.user?.email_confirmed_at !== null;
  } catch (error) {
    console.error('Error checking email confirmation status:', error);
    return false;
  }
};

// Helper function to resend confirmation email
export const resendConfirmationEmail = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: (await supabase.auth.getUser()).data.user?.email || '',
    });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error: any) {
    console.error('Error resending confirmation email:', error);
    return { success: false, error: error.message || 'Failed to resend confirmation email' };
  }
}; 