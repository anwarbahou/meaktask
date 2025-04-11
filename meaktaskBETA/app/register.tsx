import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Animated, ActivityIndicator, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { authService } from '../utils/api';
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

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false);
  const router = useRouter();
  const words = ['خلّص', 'سير', 'كول', 'جيب', 'خلّص', 'خدم', 'خزّن', 'شري', 'تقدّى', 'طلب'];
  const [animatedWords, setAnimatedWords] = useState<AnimatedWord[]>([]);

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
          useNativeDriver: false, // Changed to false to fix warning
        }),
        Animated.sequence([
          Animated.timing(newWord.opacity, {
            toValue: 0.8, // Fade in
            duration: 1000,
            useNativeDriver: false, // Changed to false to fix warning
          }),
          Animated.delay(6000 + Math.random() * 4000), // Random delay
          Animated.timing(newWord.opacity, {
            toValue: 0, // Fade out
            duration: 1000,
            useNativeDriver: false, // Changed to false to fix warning
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

  const handleRegister = async () => {
    // Reset error
    setError('');

    try {
      // Input validation with specific error messages
      if (!name.trim()) {
        setError('Please enter your full name');
        return;
      }

      if (!email.trim()) {
        setError('Please enter your email address');
        return;
      }

      if (!password) {
        setError('Please enter a password');
        return;
      }

      if (!confirmPassword) {
        setError('Please confirm your password');
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }

      // Enhanced password validation
      if (!/(?=.*[A-Za-z])(?=.*\d)/.test(password)) {
        setError('Password must contain both letters and numbers');
        return;
      }

      // Email validation with detailed feedback
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }

      setIsLoading(true);
      setError('');

      console.log('Starting registration process...');
      const result = await authService.register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password
      });

      console.log('Registration completed:', result);

      if (result.user) {
        // Store user data
        await AsyncStorage.setItem('userData', JSON.stringify(result.user));
        
        if (result.emailConfirmationSent) {
          console.log('Email confirmation was sent');
          setEmailConfirmationSent(true);
          setRegistrationSuccess(true);
        } else if (result.session) {
          console.log('User is already confirmed, redirecting to main app');
          // If we have a session, the user is already confirmed
          router.replace('/(tabs)');
        } else {
          console.error('Registration completed but no session was created');
          setError('Registration completed but no session was created. Please try logging in.');
        }
      } else {
        console.error('Registration failed - no user data returned');
        setError('Registration failed. Please try again.');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle specific Supabase error messages
      if (error.message?.toLowerCase().includes('email')) {
        if (error.message.toLowerCase().includes('taken')) {
          setError('This email address is already registered. Please try logging in instead.');
        } else {
          setError('Please enter a valid email address.');
        }
      } else if (error.message?.toLowerCase().includes('password')) {
        setError('Password error: ' + error.message);
      } else if (error.message?.toLowerCase().includes('network')) {
        setError('Network error. Please check your internet connection and try again.');
      } else if (error.message?.toLowerCase().includes('rate limit')) {
        setError('Too many attempts. Please wait a few minutes and try again.');
      } else if (error.message?.toLowerCase().includes('profile')) {
        setError('Error creating user profile: ' + error.message);
      } else {
        setError(error.message || 'Registration failed. Please try again.');
      }
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

  const handleLoginInstead = () => {
    router.push('/login');
  };

  // If registration was successful and email confirmation was sent
  if (registrationSuccess && emailConfirmationSent) {
    return (
      <LinearGradient
        colors={['#4a9e8a', '#3b8a7a', '#2c7466']}
        style={styles.container}
      >
        <Stack.Screen options={{ headerShown: false }} />
        
        <View style={styles.successContainer}>
          <View style={styles.successCard}>
            <Ionicons name="mail-outline" size={80} color="#4a9e8a" style={styles.successIcon} />
            <Text style={styles.successTitle}>Check Your Email</Text>
            <Text style={styles.successText}>
              We've sent a confirmation email to {email}. Please check your inbox and click the confirmation link to complete your registration.
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
              style={styles.loginInsteadButton} 
              onPress={handleLoginInstead}
            >
              <Text style={styles.loginInsteadText}>Already confirmed? Log in</Text>
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
      
      {/* Registration Form */}
      <View style={styles.formContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Please fill in your details</Text>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="John Doe"
            value={name}
            onChangeText={setName}
          />
        </View>
        
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
            placeholder="Minimum 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Log In</Text>
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
    top: '25%', // Start higher on the screen - 25% from top
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 30,
    paddingTop: 35,
    paddingBottom: 50,
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
    marginBottom: 8,
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
  button: {
    backgroundColor: '#00a67d',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
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
  // Success screen styles
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
  loginInsteadButton: {
    paddingVertical: 10,
  },
  loginInsteadText: {
    color: '#00a67d',
    fontSize: 14,
    fontWeight: '500',
  },
}); 