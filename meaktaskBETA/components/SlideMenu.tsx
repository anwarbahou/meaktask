import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Platform,
  TouchableWithoutFeedback,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Constants.statusBarHeight || 0;

interface SlideMenuProps {
  isVisible: boolean;
  onClose: () => void;
}

interface MenuItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  color?: string;
  style?: any;
}

const MenuItem = ({ icon, title, onPress, color = '#3b8a7a', style }: MenuItemProps) => (
  <TouchableOpacity 
    style={[styles.menuItem, style]} 
    onPress={onPress} 
    activeOpacity={0.7}
  >
    <View style={[styles.iconCircle, { backgroundColor: color }]}>
      <Ionicons name={icon as any} size={22} color="white" />
    </View>
    <Text style={styles.menuItemText}>{title}</Text>
  </TouchableOpacity>
);

const SlideMenu = ({ isVisible, onClose }: SlideMenuProps) => {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const [isFullyHidden, setIsFullyHidden] = useState(!isVisible);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);

  // Check if user is logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(token !== null);
    };
    
    if (isVisible) {
      checkLoginStatus();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      setIsFullyHidden(false);
      // Slide in menu
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 50
        }),
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          delay: 150,
          useNativeDriver: true
        })
      ]).start();
    } else {
      // Slide out menu
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -300, // Increase slide distance to ensure it's fully off-screen
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(titleOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        })
      ]).start(() => {
        // After animation completes, set fully hidden
        setIsFullyHidden(true);
      });
    }
  }, [isVisible, slideAnim, titleOpacity]);

  // Handle navigation with type safety
  const navigateTo = (route: string) => {
    onClose();
    // Use setTimeout to ensure the menu is closed before navigation
    setTimeout(() => {
      if (route === '/profile' || route === '/tasks') {
        router.push(route as any);
      } else {
        router.push('/');
      }
    }, 300);
  };

  // Handle logout
  const handleLogout = () => {
    onClose();
    
    // Show confirmation dialog
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
            try {
              // Clear all data from AsyncStorage
              await AsyncStorage.removeItem('userToken');
              await AsyncStorage.removeItem('userData');
              
              // Navigate to the home screen
              setTimeout(() => {
                router.replace('/');
              }, 300);
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
          style: "destructive"
        }
      ]
    );
  };

  const onMenuLayout = (event: any) => {
    // Capture the height of the menu content
    const {height} = event.nativeEvent.layout;
    setMenuHeight(height);
  };

  // Render menu items with dynamic styling
  const renderMenuItems = () => {
    const hasLogout = isLoggedIn;
    const menuItemStyle = hasLogout ? styles.menuItemFour : styles.menuItem;
    
    return (
      <>
        {/* Section 1: Home */}
        <MenuItem 
          icon="home-outline" 
          title="Home" 
          onPress={() => {
            onClose();
            setTimeout(() => router.push('/'), 300);
          }}
          color="#4a9e8a"
          style={menuItemStyle}
        />
        
        {/* Section 2: Tasks */}
        <MenuItem 
          icon="list-outline" 
          title="Tasks" 
          onPress={() => navigateTo('/tasks')}
          color="#3b8a7a"
          style={menuItemStyle}
        />
        
        {/* Section 3: Profile */}
        <MenuItem 
          icon="person-outline" 
          title="Profile" 
          onPress={() => navigateTo('/profile')}
          color="#2c7466" 
          style={menuItemStyle}
        />
        
        {/* Section 4: Logout (only shown when logged in) */}
        {isLoggedIn && (
          <MenuItem 
            icon="log-out-outline" 
            title="Logout" 
            onPress={handleLogout}
            color="#e74c3c" 
            style={menuItemStyle}
          />
        )}
      </>
    );
  };

  if (isFullyHidden) {
    return null; // Don't render when completely hidden
  }

  return (
    <TouchableWithoutFeedback>
      <Animated.View 
        style={[
          styles.container,
          { transform: [{ translateY: slideAnim }] }
        ]}
      >
        <View style={styles.innerContainer} onLayout={onMenuLayout}>
          {/* App Brand Title */}
          <Animated.View style={[styles.titleContainer, { opacity: titleOpacity }]}>
            <Text style={styles.titleText}>Astara</Text>
            <View style={styles.titleUnderline} />
          </Animated.View>
          
          <View style={styles.content}>
            <View style={styles.menuItems}>
              {renderMenuItems()}
            </View>
          </View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    height: 'auto',
    zIndex: 999,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    paddingBottom: 8,
  },
  innerContainer: {
    paddingTop: 0,
    paddingBottom: 12,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  titleContainer: {
    alignItems: 'center',
    paddingTop: STATUS_BAR_HEIGHT ? STATUS_BAR_HEIGHT + 8 : 16,
    paddingBottom: 4,
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    color: '#1a5d4c',
    letterSpacing: 1,
  },
  titleUnderline: {
    width: 50,
    height: 2,
    backgroundColor: '#1a5d4c',
    marginTop: 4,
    marginBottom: 4,
  },
  content: {
    padding: 16,
    width: '100%',
  },
  menuItems: {
    flexDirection: 'row', 
    justifyContent: 'space-around',
    flexWrap: 'wrap', // Allow items to wrap if needed
  },
  menuItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80, // Slightly larger for better spacing
  },
  menuItemFour: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70, // Slightly narrower when all four items are shown
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b8a7a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  menuItemText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
});

export default SlideMenu; 