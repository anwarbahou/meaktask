// Import these libraries with skipLibCheck enabled to avoid type errors
import { ThemeProvider } from '@react-navigation/native';
import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StatusBar as RNStatusBar, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  React.useEffect(() => {
    if (error) throw error;
  }, [error]);

  React.useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Set the status bar to be properly integrated on both iOS and Android
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      RNStatusBar.setTranslucent(true);
      RNStatusBar.setBackgroundColor('transparent');
    } else if (Platform.OS === 'ios') {
      // On iOS, ensure the status bar is properly integrated
      RNStatusBar.setBarStyle('dark-content');
    }
  }, []);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ 
        flex: 1, 
        backgroundColor: 'white',
      }}>
        {/* Configure transparent status bar to create seamless look */}
        <StatusBar 
          style="dark" 
          translucent={true} 
          backgroundColor="transparent" 
        />
        <Stack 
          initialRouteName="index"
          screenOptions={{
            headerShown: false, // Hide all headers by default
            animation: "slide_from_right",
            contentStyle: { 
              backgroundColor: 'white',
            }
          }}
        >
          {/* Auth group */}
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          
          {/* Main group */}
          <Stack.Screen name="index" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="tasks" />
          
          {/* Error screens */}
          <Stack.Screen name="+not-found" options={{ headerShown: true }} />
        </Stack>
      </View>
    </ThemeProvider>
  );
}
