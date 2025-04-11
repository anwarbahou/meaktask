import { supabase, isEmailConfirmed, resendConfirmationEmail } from '../lib/supabase/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Database } from '../lib/supabase/types';

// Types
interface RegisterParams {
  name: string;
  email: string;
  password: string;
}

interface WriteParams {
  // ... existing code ...
}

// Auth services
export const authService = {
  // Register user
  register: async ({ name, email, password }: RegisterParams) => {
    try {
      console.log('Registering user:', { email, name });
      
      // Check if user already exists using our custom function
      const { data: userExists, error: checkError } = await supabase
        .rpc('user_exists', { email });
      
      if (checkError) {
        console.error('Error checking if user exists:', checkError);
      } else if (userExists) {
        throw new Error('This email is already registered. Please try logging in instead.');
      }
      
      // Sign up the user with metadata
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) {
        console.error('Sign up error:', signUpError);
        if (signUpError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        }
        throw signUpError;
      }

      if (!signUpData.user) {
        console.error('No user data returned from signup');
        throw new Error('No user data returned from signup');
      }

      console.log('Registration response:', signUpData);
      console.log('User ID:', signUpData.user.id);
      console.log('User email:', signUpData.user.email);
      console.log('User metadata:', signUpData.user.user_metadata);

      // If we have a session, the user is already confirmed
      if (signUpData.session) {
        console.log('User is already confirmed');
        return {
          user: signUpData.user,
          session: signUpData.session,
          emailConfirmationSent: false
        };
      }

      // If we have a user but no session, email confirmation was sent
      console.log('Email confirmation was sent');
      return {
        user: signUpData.user,
        session: null,
        emailConfirmationSent: true
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Login user
  login: async (userData: { email: string; password: string }) => {
    console.log('Logging in user:', { email: userData.email });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
      });
      
      if (error) {
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email before logging in.');
        }
        throw error;
      }
      
      console.log('Login response:', data);
      
      // Check if email is confirmed
      const emailConfirmed = await isEmailConfirmed();
      if (!emailConfirmed) {
        // Store user data but don't allow access to the app
        if (data.user) {
          await AsyncStorage.setItem('userData', JSON.stringify(data.user));
          await AsyncStorage.setItem('emailNotConfirmed', 'true');
        }
        return { 
          user: data.user, 
          session: data.session,
          emailNotConfirmed: true 
        };
      }
      
      // Email is confirmed, proceed with login
      if (data.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        await AsyncStorage.removeItem('emailNotConfirmed');
      }
      
      return { user: data.user, session: data.session };
    } catch (error: any) {
      console.error('Login error:', error);
      throw error.message || 'Login failed';
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      
      if (error) throw error;
      
      console.log('getCurrentUser response:', data);
      
      if (data.user) {
        // Check if email is confirmed
        const emailConfirmed = await isEmailConfirmed();
        if (!emailConfirmed) {
          await AsyncStorage.setItem('emailNotConfirmed', 'true');
        } else {
          await AsyncStorage.removeItem('emailNotConfirmed');
        }
        
        // Store the user data in AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify(data.user));
        return data.user;
      }
      
      // Fall back to local data if Supabase fails to return valid user object
      const cachedUserData = await AsyncStorage.getItem('userData');
      if (cachedUserData) {
        console.log('getCurrentUser - Using cached data instead');
        return JSON.parse(cachedUserData);
      }
      
      return null;
    } catch (error: any) {
      console.error('Get current user error:', error);
      
      // Fall back to local data if Supabase request fails
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          console.log('getCurrentUser - Using cached data after error');
          return JSON.parse(cachedUserData);
        }
      } catch (e) {
        console.error('Failed to retrieve cached user data:', e);
      }
      
      throw error.message || 'Failed to get user data';
    }
  },

  // Get user profile
  getUserProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_user_profile', { user_id: userId });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Get user profile error:', error);
      throw error.message || 'Failed to get user profile';
    }
  },

  // Logout user
  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('emailNotConfirmed');
      await AsyncStorage.removeItem('registrationComplete');
    } catch (error: any) {
      console.error('Logout error:', error);
      throw error.message || 'Logout failed';
    }
  },

  // Check if user is logged in
  isAuthenticated: async () => {
    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error('isAuthenticated error:', error);
      return false;
    }
  },
  
  // Check if email is confirmed
  checkEmailConfirmed: async () => {
    return await isEmailConfirmed();
  },
  
  // Resend confirmation email
  resendConfirmationEmail: async () => {
    return await resendConfirmationEmail();
  },
  
  // Check if registration is complete
  isRegistrationComplete: async () => {
    try {
      const registrationComplete = await AsyncStorage.getItem('registrationComplete');
      return registrationComplete === 'true';
    } catch (error) {
      console.error('Error checking registration status:', error);
      return false;
    }
  }
};

// Task services
export const taskService = {
  // Get all tasks for the current user
  getTasks: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Get tasks error:', error);
      throw error.message || 'Failed to get tasks';
    }
  },
  
  // Create a new task
  createTask: async (taskData: Omit<Database['public']['Tables']['tasks']['Insert'], 'user_id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...taskData, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Create task error:', error);
      throw error.message || 'Failed to create task';
    }
  },
  
  // Update a task
  updateTask: async (id: string, updates: Database['public']['Tables']['tasks']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error: any) {
      console.error('Update task error:', error);
      throw error.message || 'Failed to update task';
    }
  },
  
  // Delete a task
  deleteTask: async (id: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      return true;
    } catch (error: any) {
      console.error('Delete task error:', error);
      throw error.message || 'Failed to delete task';
    }
  }
};

// Connection check helper
export const checkApiConnection = async () => {
  try {
    console.log('Checking connection to Supabase...');
    const { data, error } = await supabase.from('tasks').select('count').limit(1);
    
    if (error) throw error;
    
    console.log('Supabase connection is successful');
    return true;
  } catch (error: any) {
    console.error('Supabase connection failed. Error:', error.message || 'Unknown error');
    console.log('Please ensure:');
    console.log('1. Your Supabase project is set up correctly');
    console.log('2. Your environment variables are configured properly');
    return false;
  }
};

// Test function to verify database setup
export const testDatabaseSetup = async () => {
  try {
    console.log('Testing database setup...');
    
    // Test profiles table
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
      return { success: false, error: 'Profiles table not properly set up' };
    }
    
    console.log('Profiles table is accessible');
    
    // Test tasks table
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(1);
    
    if (tasksError) {
      console.error('Tasks table error:', tasksError);
      return { success: false, error: 'Tasks table not properly set up' };
    }
    
    console.log('Tasks table is accessible');
    
    // Test RLS policies by trying to create a test task
    const { data: testTask, error: testTaskError } = await supabase
      .from('tasks')
      .insert([
        {
          title: 'Test Task',
          description: 'This is a test task',
          status: 'pending',
          priority: 'medium'
        }
      ])
      .select()
      .single();
    
    if (testTaskError) {
      console.error('RLS policy test error:', testTaskError);
      return { success: false, error: 'RLS policies not properly set up' };
    }
    
    // Clean up test task
    await supabase
      .from('tasks')
      .delete()
      .eq('id', testTask.id);
    
    console.log('RLS policies are working correctly');
    
    return { success: true };
  } catch (error: any) {
    console.error('Database setup test error:', error);
    return { success: false, error: error.message };
  }
};

export default supabase; 