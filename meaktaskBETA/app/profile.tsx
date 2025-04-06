import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, StatusBar as RNStatusBar } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';

// Get status bar height for proper UI positioning
const STATUS_BAR_HEIGHT = Constants.statusBarHeight || 0;

export default function ProfileScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<{name?: string, email?: string}>({});
  
  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem('userData');
        if (userDataString) {
          const parsedUserData = JSON.parse(userDataString);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);
  
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
    // Get first letter of name or email for avatar
    const firstLetter = userData.name 
      ? userData.name.charAt(0).toUpperCase()
      : userData.email
        ? userData.email.charAt(0).toUpperCase()
        : 'U';
        
    return (
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>
        <Text style={styles.name}>{userData.name || 'User'}</Text>
        <Text style={styles.email}>{userData.email || 'No email available'}</Text>
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
}); 