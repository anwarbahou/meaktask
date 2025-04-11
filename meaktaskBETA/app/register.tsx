import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Animated, ActivityIndicator } from 'react-native';
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

  // Hide any menu or slide menu when this screen is shown
  useEffect(() => {
    // This component will fully handle navigation UI itself
    // No headers or menus should be visible
    return () => {
      // Clean up on unmount if needed
    };
  }, []);

  const handleRegister = async () => {
    // Reset error state
    setError('');
    
    try {
      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }
      
      // Email validation using regex
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        return;
      }
      
      setIsLoading(true);
      
      console.log('Attempting to register with:', { name, email, password: '********' });
      
      // Call API to register user
      const response = await authService.register({
        name,
        email,
        password
      });
      
      console.log('Registration successful response:', response);
      
      // Ensure token exists before storing
      if (!response || !response.token) {
        throw new Error('Invalid response from server');
      }
      
      // Store the token in AsyncStorage
      await AsyncStorage.setItem('userToken', response.token);
      
      // Store user data for profile access
      if (response.user) {
        // Make sure it includes name and email
        const userData = {
          ...response.user,
          name: name, // Ensure name is always available
          email: email // Ensure email is always available
        };
        console.log('Storing user data:', userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      } else {
        // If no user object in response, create user data from registration info
        const userData = { name, email };
        console.log('Creating user data from registration details:', userData);
        await AsyncStorage.setItem('userData', JSON.stringify(userData));
      }
      
      // Navigate to the main screen after successful registration
      router.replace('/');
    } catch (err: any) {
      console.error('Registration error details:', err);
      
      // Handle different types of errors more gracefully
      if (typeof err === 'string') {
        setError(err);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again later.');
      }
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
            placeholder="Minimum 8 characters"
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
}); 