import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, StatusBar as RNStatusBar, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { authService } from '../utils/api';

// Get status bar height for proper UI positioning
const STATUS_BAR_HEIGHT = Constants.statusBarHeight || 0;

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    name?: string, 
    email?: string, 
    _id?: string,
    id?: string
  }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Fetch user data from MongoDB on component mount
  useEffect(() => {
    const initializeUserData = async () => {
      // First try to get cached data for immediate display
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          const parsedData = JSON.parse(cachedUserData);
          console.log('Initial load - using cached data:', parsedData);
          setUserData(parsedData);
        }
      } catch (error) {
        console.error('Error loading cached user data on init:', error);
      }
      
      // Then fetch fresh data from backend
      fetchUserDataFromBackend();
    };
    
    initializeUserData();
  }, []);
  
  const fetchUserDataFromBackend = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // First check if we have a token
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      // Fetch user data from backend
      const userDataFromBackend = await authService.getCurrentUser();
      console.log('User data from backend:', userDataFromBackend);
      
      if (userDataFromBackend) {
        // Check if email exists in the user data
        const hasEmail = userDataFromBackend.email && userDataFromBackend.email.trim() !== '';
        
        if (hasEmail) {
          console.log('Successfully retrieved user data with email:', userDataFromBackend.email);
          
          // Update state with fresh data
          setUserData(userDataFromBackend);
          
          // Also update the AsyncStorage cache
          await AsyncStorage.setItem('userData', JSON.stringify(userDataFromBackend));
          console.log('Successfully updated user data from backend');
        } else {
          console.log('Backend returned data without email, checking cache...');
          
          // Try to get cached data with email
          const cachedUserData = await AsyncStorage.getItem('userData');
          if (cachedUserData) {
            const parsedData = JSON.parse(cachedUserData);
            console.log('Using cached user data:', parsedData);
            
            // If cached data has more info (like email), use it but update with new data
            if (parsedData.email) {
              const mergedData = { ...userDataFromBackend, email: parsedData.email };
              console.log('Merged data from backend and cache:', mergedData);
              setUserData(mergedData);
              await AsyncStorage.setItem('userData', JSON.stringify(mergedData));
            } else {
              setUserData(parsedData);
            }
          } else {
            console.log('No cached user data found with email');
            setError('User profile incomplete. Please log out and log in again.');
          }
        }
      } else {
        console.log('Backend returned empty data, checking cache...');
        // Fall back to cached data if backend request fails or returns incomplete data
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          const parsedData = JSON.parse(cachedUserData);
          console.log('Using cached user data:', parsedData);
          setUserData(parsedData);
        } else {
          console.log('No cached user data found');
          setError('User profile data incomplete. Please log out and log in again.');
        }
      }
    } catch (error) {
      console.error('Error fetching user data from backend:', error);
      setError('Could not load user data from server');
      
      // Fall back to cached data
      try {
        const cachedUserData = await AsyncStorage.getItem('userData');
        if (cachedUserData) {
          const parsedData = JSON.parse(cachedUserData);
          console.log('Falling back to cached user data after error:', parsedData);
          setUserData(parsedData);
        }
      } catch (cacheError) {
        console.error('Error reading cached user data:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Set status bar configuration for this screen
  useEffect(() => {
    if (Platform.OS === 'ios') {
      RNStatusBar.setBarStyle('dark-content');
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      // For web, use window.confirm since Alert.alert is not available
      if (Platform.OS === 'web') {
        const confirmLogout = window.confirm('Are you sure you want to logout?');
        if (confirmLogout) {
          // Clear storage and navigate
          await clearStorageAndNavigate();
        }
      } else {
        // For mobile, use Alert.alert
        Alert.alert(
          "Logout",
          "Are you sure you want to logout?",
          [
            {
              text: "Cancel",
              style: "cancel"
            },
            {
              text: "Logout",
              onPress: async () => {
                await clearStorageAndNavigate();
              },
              style: "destructive"
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Show error message based on platform
      if (Platform.OS === 'web') {
        window.alert('Failed to logout. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to logout. Please try again.');
      }
    }
  };
  
  // Separate function to clear storage and navigate
  const clearStorageAndNavigate = async () => {
    try {
      console.log('Clearing storage and navigating...');
      // Clear token and user data from AsyncStorage
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      console.log('Storage cleared, navigating to login');
      // Navigate to login screen
      router.push('/login');
    } catch (error) {
      console.error('Error in clearStorageAndNavigate:', error);
      throw error; // Rethrow to be caught by the calling function
    }
  };
  
  // Render the avatar section
  const renderAvatarSection = () => {
    // Show loading indicator while fetching data and no cached data is available
    if (isLoading && !userData.email) {
      return (
        <View style={styles.avatarContainer}>
          <ActivityIndicator size="large" color="#3b8a7a" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      );
    }
    
    // Show error if something went wrong and no cached data is available
    if (error && !userData.email) {
      return (
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: '#E53935' }]}>
            <Ionicons name="alert-circle" size={40} color="white" />
          </View>
          <Text style={styles.name}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchUserDataFromBackend}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    
    // Check specifically for email availability
    const hasEmail = userData && userData.email && userData.email.trim() !== '';
    
    // Get first letter of name or email for avatar
    const firstLetter = userData.name 
      ? userData.name.charAt(0).toUpperCase()
      : hasEmail
        ? userData.email!.charAt(0).toUpperCase()
        : 'U';

    // Get user ID (could be '_id' or 'id' depending on the backend)
    const userId = userData._id || userData.id;
        
    return (
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>
        <Text style={styles.name}>{userData.name || 'User'}</Text>
        
        {hasEmail ? (
          <Text style={styles.email}>{userData.email}</Text>
        ) : (
          <View style={styles.emailMissingContainer}>
            <Text style={styles.emailMissing}>No email available</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={fetchUserDataFromBackend}
            >
              <Ionicons name="refresh" size={16} color="#3b8a7a" />
              <Text style={styles.refreshText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Show connection status if there's an error but we have cached data */}
        {error && hasEmail && (
          <Text style={styles.connectionError}>
            Connected to offline mode
          </Text>
        )}
        
        {userId && (
          <Text style={styles.userId}>User ID: {userId}</Text>
        )}
      </View>
    );
  };
  
  // Render the info section
  const renderInfoSection = () => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>Profile Information</Text>
      <Text style={styles.infoText}>
        This is a placeholder profile page. In a real app, this would display user information and settings.
      </Text>
    </View>
  );
  
  // Render the logout button
  const renderLogoutButton = () => (
    <TouchableOpacity 
      style={styles.logoutButton}
      onPress={handleLogout}
    >
      <Ionicons name="log-out-outline" size={22} color="white" />
      <Text style={styles.logoutText}>Logout</Text>
    </TouchableOpacity>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" translucent={true} backgroundColor="transparent" />
      
      {/* Simplified Header with just Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={28} color="#333" />
        </TouchableOpacity>
        <View style={styles.headerRightSpace} />
      </View>

      <View style={styles.content}>
        {renderAvatarSection()}
        {renderInfoSection()}
        {renderLogoutButton()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: STATUS_BAR_HEIGHT, // Account for status bar height
    height: STATUS_BAR_HEIGHT + 44, // Header height + status bar
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  headerRightSpace: {
    width: 28, // Same width as back button for balanced layout
  },
  content: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#3b8a7a',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    color: 'white',
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 15,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  errorText: {
    color: '#E53935',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#3b8a7a',
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  userId: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emailMissingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  emailMissing: {
    fontSize: 16,
    color: '#666',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    padding: 4,
  },
  refreshText: {
    color: '#3b8a7a',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  connectionError: {
    fontSize: 12,
    color: '#E53935',
    marginTop: 4,
  },
}); 