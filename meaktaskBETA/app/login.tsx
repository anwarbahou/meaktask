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
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false);
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
        'Connection Error',
        'Unable to connect to the server. Please check your internet connection and try again.',
        [{ text: 'OK' }]
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

  // Start the animation loop
  useEffect(() => {
    const startAnimation = () => {
      // Create a new word
      const newWord = generateWord();
      setAnimatedWords(prev => [...prev, newWord]);
      
      // Animate the word
      Animated.parallel([
        Animated.timing(newWord.translateY, {
          toValue: height + 100, // Move to bottom of screen
          duration: 8000 + Math.random() * 4000, // Random duration between 8-12 seconds
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(newWord.opacity, {
            toValue: 0.8, // Fade in
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.delay(6000 + Math.random() * 4000), // Random delay
          Animated.timing(newWord.opacity, {
            toValue: 0, // Fade out
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        // Remove the word after animation completes
        setAnimatedWords(prev => prev.filter(word => word.id !== newWord.id));
      });
    };
    
    // Start with a few words
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        startAnimation();
      }, i * 2000); // Stagger the start times
    }
    
    // Continue adding new words
    const interval = setInterval(startAnimation, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await authService.login({ email, password });
      
      if (result.user) {
        // Check if email is not confirmed
        if (result.emailNotConfirmed) {
          setEmailNotConfirmed(true);
          return;
        }
        
        // Navigate to the main app
        router.replace('/(tabs)');
      } else {
        setError('Login failed. Please check your credentials and try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setIsLoading(true);
    try {
      const result = await authService.resendConfirmationEmail();
      if (result.success) {
        Alert.alert(
          'Confirmation Email Sent',
          'Please check your email for the confirmation link.',
          [{ text: 'OK' }]
        );
      } else {
        setError(result.error || 'Failed to resend confirmation email');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to resend confirmation email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  // If email is not confirmed
  if (emailNotConfirmed) {
    return (
      <LinearGradient
        colors={['#4a9e8a', '#3b8a7a', '#2c7466']}
        style={styles.container}
      >
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <Ionicons name="mail-outline" size={80} color="#4a9e8a" style={styles.successIcon} />
            <Text style={styles.successTitle}>Email Not Confirmed</Text>
            <Text style={styles.successText}>
              Your email address has not been confirmed yet. Please check your inbox and click the confirmation link to complete your registration.
            </Text>
            <Text style={styles.successNote}>
              If you don't see the email, check your spam folder.
            </Text>
            
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleResendConfirmation}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.resendButtonText}>Resend Confirmation Email</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.registerButton} 
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Create a new account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    );
  }

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
          <TouchableOpacity onPress={() => router.push('/register')}>
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
  // Email confirmation screen styles
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  successIcon: {
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 15,
    textAlign: 'center',
  },
  successText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  successNote: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 25,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resendButton: {
    backgroundColor: '#00a67d',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    width: '100%',
    marginBottom: 15,
  },
  resendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    paddingVertical: 10,
  },
  registerButtonText: {
    color: '#00a67d',
    fontSize: 14,
    fontWeight: '500',
  },
}); 