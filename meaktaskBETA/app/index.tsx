import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Dimensions, 
  Animated,
  Platform,
  ScrollView,
  StatusBar as RNStatusBar,
  ActivityIndicator
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import SlideMenu from '@/components/SlideMenu';
import { BlurView } from 'expo-blur';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

// Get status bar height for proper UI positioning
const STATUS_BAR_HEIGHT = Constants.statusBarHeight || 0;

// Define the type for animated words
interface AnimatedWord {
  id: number;
  word: string;
  translateY: Animated.Value;
  opacity: Animated.Value;
  xPosition: number;
}

interface ServiceCategoryProps {
  icon: string;
  title: string;
  onPress: () => void;
}

interface TaskerCardProps {
  image?: string;
  name: string;
  rating: string;
  category: string;
  location: string;
  price: string;
}

interface PromoCardProps {
  title: string;
  subtitle: string;
  color: string;
  image?: string;
}

// Service category component
const ServiceCategory = ({ icon, title, onPress }: ServiceCategoryProps) => (
  <TouchableOpacity style={styles.categoryCard} onPress={onPress}>
    <View style={styles.categoryIconContainer}>
      <Ionicons name={icon as any} size={32} color="#1a5d4c" />
    </View>
    <Text style={styles.categoryTitle}>{title}</Text>
  </TouchableOpacity>
);

// Tasker card component
const TaskerCard = ({ image, name, rating, category, location, price }: TaskerCardProps) => (
  <TouchableOpacity style={styles.taskerCard}>
    <View style={styles.taskerHeader}>
      <Ionicons name="person-circle-outline" size={28} color="#1a5d4c" />
      <Text style={styles.taskerName}>{name}</Text>
      <View style={styles.ratingContainer}>
        <Ionicons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{rating}</Text>
      </View>
    </View>
    <View style={styles.taskerDetails}>
      <Text style={styles.categoryText}>{category}</Text>
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.locationText}>{location}</Text>
      </View>
      <Text style={styles.priceText}>{price}</Text>
    </View>
  </TouchableOpacity>
);

// Promo card component
const PromoCard = ({ title, subtitle, color, image }: PromoCardProps) => (
  <TouchableOpacity 
    style={[styles.promoCard, { backgroundColor: color }]}
  >
    <View style={styles.promoContent}>
      <Text style={styles.promoTitle}>{title}</Text>
      <Text style={styles.promoSubtitle}>{subtitle}</Text>
    </View>
  </TouchableOpacity>
);

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [userRole, setUserRole] = useState('client'); // 'client' or 'tasker'
  const [menuVisible, setMenuVisible] = useState(false);
  const blurOpacity = React.useRef(new Animated.Value(0)).current;
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [animatedWords, setAnimatedWords] = useState<AnimatedWord[]>([]);

  const words = ['خلّص', 'سير', 'كول', 'جيب', 'خلّص', 'خدم', 'خزّن', 'شري', 'تقدّى', 'طلب'];

  // Generate a new word with animation values
  const generateWord = (): AnimatedWord => {
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const randomX = Math.random() * (width - 200); // Random position within screen width
    const topPosition = -100; // Start above the screen
    
    const translateY = new Animated.Value(topPosition);
    const opacity = new Animated.Value(0);
    
    return {
      id: Date.now() + Math.random(),
      word: randomWord,
      translateY,
      opacity,
      xPosition: randomX,
    };
  };

  // Start a new word animation
  const startWordAnimation = (wordObj: AnimatedWord) => {
    const animDuration = 12000 + Math.random() * 5000; // 12-17 seconds
    
    Animated.parallel([
      Animated.timing(wordObj.translateY, {
        toValue: height + 100,
        duration: animDuration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(wordObj.opacity, {
          toValue: 0.7, // Match login page opacity
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(wordObj.opacity, {
          toValue: 0.7, // Match login page opacity
          duration: animDuration - 2000,
          useNativeDriver: true,
        }),
        Animated.timing(wordObj.opacity, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      // Remove this word from state when animation completes
      setAnimatedWords(current => current.filter(w => w.id !== wordObj.id));
    });
  };

  // Add a new word at intervals
  useEffect(() => {
    const addNewWord = () => {
      const newWord = generateWord();
      setAnimatedWords(current => [...current, newWord]);
      startWordAnimation(newWord);
    };

    // Add initial words
    for (let i = 0; i < 5; i++) {
      setTimeout(() => addNewWord(), i * 1200);
    }

    // Add new words periodically
    const interval = setInterval(() => {
      addNewWord();
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // Check authentication status on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Function to check if user is authenticated
  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(userToken !== null);
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
      setIsLoading(false);
    }
  };

  const handleContinueWithPhone = () => {
    // Hide the menu when navigating to register
    setMenuVisible(false);
    router.push('/register');
  };

  const handleContinueWithApple = () => {
    alert('Apple sign up coming soon!');
  };

  const handleContinueWithGoogle = () => {
    alert('Google sign up coming soon!');
  };

  const toggleUserRole = () => {
    setUserRole(userRole === 'client' ? 'tasker' : 'client');
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const handleCloseMenu = () => {
    setMenuVisible(false);
  };

  // Animate blur effect
  React.useEffect(() => {
    Animated.timing(blurOpacity, {
      toValue: menuVisible ? 1 : 0,
      duration: 300,
      useNativeDriver: Platform.OS === 'android',
    }).start();
  }, [menuVisible]);

  // On iOS we use the BlurView component, on Android we use a semi-transparent overlay
  const renderBlurOverlay = () => {
    if (!menuVisible) return null;
    
    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity 
          style={StyleSheet.absoluteFill} 
          activeOpacity={1}
          onPress={handleCloseMenu}
        >
          <Animated.View 
            style={[styles.overlayBase, { opacity: blurOpacity }]}
          >
            <BlurView 
              intensity={20}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
        </TouchableOpacity>
      );
    } else {
      // For Android, use a simple semi-transparent overlay
      return (
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleCloseMenu}
        >
          <Animated.View 
            style={[
              styles.overlayBase, 
              styles.androidBlur,
              { opacity: blurOpacity }
            ]}
          />
        </TouchableOpacity>
      );
    }
  };

  // Background Slideshow implementation
  const renderBackgroundSlideshow = () => {
    return (
      <View style={styles.backgroundContainer}>
        {animatedWords.map((item) => (
          <Animated.Text
            key={item.id}
            style={[
              styles.backgroundWord,
              {
                opacity: item.opacity,
                transform: [{ translateY: item.translateY }],
                left: item.xPosition,
              },
            ]}
          >
            {item.word}
          </Animated.Text>
        ))}
      </View>
    );
  };

  // Set status bar configuration for logged-in state
  useEffect(() => {
    if (isLoggedIn && Platform.OS === 'ios') {
      RNStatusBar.setBarStyle('dark-content');
    }
  }, [isLoggedIn]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3b8a7a" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      {!isLoggedIn ? (
        // Non-logged in view - Sign up screen
        <>
          <StatusBar style="light" translucent={true} />
          <LinearGradient
            colors={['#4a9e8a', '#3b8a7a', '#2c7466']}
            style={{ flex: 1 }}
          >
            {/* Background Slideshow */}
            {renderBackgroundSlideshow()}
            
            {/* Registration Form - at bottom */}
            <View style={styles.formContainerBottom}>
              <View style={styles.headerContainer}>
                <Text style={styles.title}>Sign up to continue</Text>
                <Text style={styles.subtitle}>In order to continue you need to create an account</Text>
              </View>
              
              {/* Continue with Phone Button */}
              <TouchableOpacity 
                style={styles.phoneButton} 
                onPress={handleContinueWithPhone}
              >
                <Text style={styles.phoneButtonText}>Continue with phone number</Text>
              </TouchableOpacity>
              
              {/* Continue with Apple Button */}
              <TouchableOpacity 
                style={styles.appleButton}
                onPress={handleContinueWithApple}
              >
                <Ionicons name="logo-apple" size={22} color="black" style={styles.buttonIcon} />
                <Text style={styles.appleButtonText}>Continue with Apple</Text>
              </TouchableOpacity>
              
              {/* Continue with Google Button */}
              <TouchableOpacity 
                style={styles.googleButton} 
                onPress={handleContinueWithGoogle}
              >
                <Ionicons name="logo-google" size={22} color="#4285F4" style={styles.buttonIcon} />
                <Text style={styles.googleButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              
              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => {
                  setMenuVisible(false);
                  router.push('/login');
                }}>
                  <Text style={styles.loginLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </>
      ) : (
        // Logged in view - Main app
        <View style={[styles.container, { paddingTop: 0 }]}>
          <StatusBar style="dark" translucent={true} />
          
          {/* Header - only show after logging in */}
          <View style={styles.header}>
            <View style={styles.headerLeftSpace} />
            
            <TouchableOpacity 
              style={styles.menuButton}
              onPress={toggleMenu}
            >
              <Ionicons name="menu-outline" size={28} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Service Categories Section */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.welcomeTitle}>Welcome back!</Text>
              <Text style={styles.welcomeSubtitle}>What service do you need today?</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesScrollContent}
              >
                <ServiceCategory 
                  icon="construct-outline" 
                  title="Handyman" 
                  onPress={() => {}} 
                />
                <ServiceCategory 
                  icon="home-outline" 
                  title="Cleaning" 
                  onPress={() => {}} 
                />
                <ServiceCategory 
                  icon="car-outline" 
                  title="Moving" 
                  onPress={() => {}} 
                />
                <ServiceCategory 
                  icon="brush-outline" 
                  title="Painting" 
                  onPress={() => {}} 
                />
              </ScrollView>
            </View>
            
            {/* Recommended Taskers Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>📣 Recommended Taskers near you</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.taskersScrollContent}
              >
                <TaskerCard 
                  name="John Smith"
                  rating="4.8"
                  category="Handyman"
                  location="2.5 miles away"
                  price="$25-45/hr"
                />
                <TaskerCard 
                  name="Sarah Johnson"
                  rating="4.9"
                  category="Cleaning"
                  location="3.1 miles away"
                  price="$20-35/hr"
                />
                <TaskerCard 
                  name="Mike Williams"
                  rating="4.7"
                  category="Moving"
                  location="1.8 miles away"
                  price="$30-50/hr"
                />
              </ScrollView>
            </View>
            
            {/* Trending Services Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🔥 Trending Services</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.taskersScrollContent}
              >
                <TaskerCard 
                  name="Home Cleaning"
                  rating="4.9"
                  category="Most booked"
                  location="15+ taskers available"
                  price="From $60"
                />
                <TaskerCard 
                  name="Furniture Assembly"
                  rating="4.8"
                  category="Popular"
                  location="10+ taskers available"
                  price="From $45"
                />
                <TaskerCard 
                  name="Yard Work"
                  rating="4.7"
                  category="Seasonal"
                  location="8+ taskers available"
                  price="From $40"
                />
              </ScrollView>
            </View>
            
            {/* Promo Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>🎁 Promo codes</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.promoScrollContent}
              >
                <PromoCard 
                  title="10% OFF"
                  subtitle="Your first task"
                  color="#5de8c3"
                />
                <PromoCard 
                  title="FREE DELIVERY"
                  subtitle="Use code: MEAKFREE"
                  color="#3b8a7a"
                />
              </ScrollView>
            </View>
            
            {/* Get More with MeakTask Section */}
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Get More with MeakTask</Text>
              <View style={styles.infoCardsContainer}>
                <TouchableOpacity style={styles.infoCard}>
                  <Ionicons name="person-add-outline" size={28} color="#1a5d4c" />
                  <Text style={styles.infoCardTitle}>Why become a Tasker?</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoCard}>
                  <Ionicons name="information-circle-outline" size={28} color="#1a5d4c" />
                  <Text style={styles.infoCardTitle}>How MeakTask Works</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoCard}>
                  <Ionicons name="grid-outline" size={28} color="#1a5d4c" />
                  <Text style={styles.infoCardTitle}>Explore Task Categories</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.infoCard}>
                  <Ionicons name="location-outline" size={28} color="#1a5d4c" />
                  <Text style={styles.infoCardTitle}>Hire Local, Fast</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          
          {/* Render the blur overlay */}
          {renderBlurOverlay()}
          
          {/* Menu must be on top of everything else */}
          <SlideMenu isVisible={menuVisible} onClose={handleCloseMenu} />
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  safeAreaContainer: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 0, // Ensure no extra padding at the top
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: STATUS_BAR_HEIGHT, // Account for status bar height
    height: STATUS_BAR_HEIGHT + 44, // Header height + status bar
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    zIndex: 1,
  },
  headerLeftSpace: {
    width: 28,
  },
  menuButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollViewContent: {
    backgroundColor: 'white',
    paddingBottom: 20,
  },
  overlayBase: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 997,
  },
  androidBlur: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  backgroundWord: {
    fontSize: 80,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.8)',
    position: 'absolute',
  },
  fullScreenGradient: {
    flex: 1,
  },
  formContainerBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 30,
    paddingTop: 35,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  headerContainer: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  phoneButton: {
    backgroundColor: '#00a67d',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  phoneButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
    borderColor: '#e1e1e1',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  appleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  googleButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    borderColor: '#e1e1e1',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 10,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666666',
    fontSize: 14,
  },
  loginLink: {
    color: '#00a67d',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    backgroundColor: 'white',
    paddingVertical: 16,
    marginBottom: 10,
  },
  categoriesScrollContent: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 24,
    width: 80,
  },
  categoryIconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e8f5f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  sectionContainer: {
    paddingVertical: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 16,
    color: '#333',
  },
  taskersScrollContent: {
    paddingHorizontal: 16,
  },
  taskerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: width * 0.7,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4,
    color: '#555',
  },
  taskerDetails: {
    gap: 6,
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1a5d4c',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  promoScrollContent: {
    paddingHorizontal: 16,
  },
  promoCard: {
    width: width * 0.6,
    height: 100,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    justifyContent: 'center',
  },
  promoContent: {
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  promoSubtitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  infoCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  infoCard: {
    backgroundColor: 'white',
    width: '48%',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  infoCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginTop: 8,
  },
  bottomPadding: {
    height: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginLeft: 16,
    marginTop: 16,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    marginLeft: 16,
  },
  informationText: {
    fontSize: 14,
    color: '#666',
    marginTop: 6,
    marginLeft: 16,
  },
}); 