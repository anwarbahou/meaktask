import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Animated, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService, checkApiConnection } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Define the type for animated words
interface AnimatedWord {
  id: number;
  word: string;
  translateY: Animated.Value;
  opacity: Animated.Value;
  xPosition: number;
}

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const words = ['خلّص', 'سير', 'كول', 'جيب', 'خلّص', 'خدم', 'خزّن', 'شري', 'تقدّى', 'طلب'];
  const [animatedWords, setAnimatedWords] = useState<AnimatedWord[]>([]);

  // Check API connection when component mounts
  useEffect(() => {
    verifyApiConnection();
  }, []);

  // Hide any menu or slide menu when this screen is shown
  useEffect(() => {
    // This component will fully handle navigation UI itself
    // No headers or menus should be visible
    return () => {
      // Clean up on unmount if needed
    };
  }, []);

  // Function to verify API connection
  const verifyApiConnection = async () => {
    setIsCheckingConnection(true);
    const isConnected = await checkApiConnection();
    setIsCheckingConnection(false);
    
    if (!isConnected) {
      Alert.alert(
        "Connection Error",
        "Unable to connect to the server. The app may not function correctly. Please ensure your server is running and the IP address is correctly configured.",
        [{ text: "OK" }]
      );
    }
  };

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
    const animDuration = 6000 + Math.random() * 2000; // 6-8 seconds (was 12-17 seconds)
    
    Animated.parallel([
      Animated.timing(wordObj.translateY, {
        toValue: height + 100,
        duration: animDuration,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(wordObj.opacity, {
          toValue: 0.7,
          duration: 500, // Was 1000ms
          useNativeDriver: true,
        }),
        Animated.timing(wordObj.opacity, {
          toValue: 0.7,
          duration: animDuration - 1000, // Was 2000ms
          useNativeDriver: true,
        }),
        Animated.timing(wordObj.opacity, {
          toValue: 0,
          duration: 500, // Was 1000ms
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
      setTimeout(() => addNewWord(), i * 600); // Was 1200ms
    }

    // Add new words periodically
    const interval = setInterval(() => {
      addNewWord();
    }, 1500); // Was 2500ms

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    // Reset error
    setError('');
    
    // Validate inputs
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setIsLoading(true);
      
      // Check connection first
      const isConnected = await checkApiConnection();
      if (!isConnected) {
        setError('Cannot connect to server. Please check your network connection and server status.');
        return;
      }
      
      // Call API endpoint for login
      const response = await authService.login({
        email,
        password
      });
      
      // Ensure token exists before storing
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Store the token in AsyncStorage
      await AsyncStorage.setItem('userToken', response.token);
      
      // Only store user data if it exists
      if (response.user) {
        await AsyncStorage.setItem('userData', JSON.stringify(response.user));
      }
      
      // Navigate to the main app after successful login
      router.replace('/');
    } catch (err: any) {
      setError(err.toString());
      console.error('Login failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#4a9e8a', '#3b8a7a', '#2c7466']}
      style={styles.container}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      {/* Background Slideshow */}
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

      {/* Login Form */}
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Log in to your account</Text>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="example@email.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity style={styles.forgotPassword} onPress={() => alert('Reset password functionality coming soon')}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.loginButtonText}>Log In</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  formContainer: {
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
  errorText: {
    color: '#E53935',
    marginBottom: 15,
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#00a67d',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#00a67d',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  loginButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#666666',
    fontSize: 14,
  },
  signupLink: {
    color: '#00a67d',
    fontSize: 14,
    fontWeight: '500',
  },
}); 