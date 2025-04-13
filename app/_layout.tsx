import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/auth';
import LoadingScreen from '@/components/LoadingScreen'; // Import the LoadingScreen component

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { user, isLoading, needsOnboarding } = useAuthStore();
  const router = useRouter();
  
  // Efeito para controlar redirecionamentos baseados em autenticação
  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        // Usuário não está autenticado, redirecionar para login
        router.push('/auth/sign-in');
      } else if(needsOnboarding?.()) {
        router.push('/onboarding');
      }else {
        // Usuário autenticado e onboarding completo
        router.push('/(tabs)');
      }
    }
  }, [user, isLoading, needsOnboarding]);

  if (isLoading) {
    return <LoadingScreen message="Loading, please wait..." />;
  }

  // Renderizar a estrutura de navegação sem redirecionamentos condicionais
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
