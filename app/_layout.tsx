import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useAuthStore } from '@/stores/auth';
import LoadingScreen from '@/components/LoadingScreen';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();
  const { user, isLoading, needsOnboarding } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  
  // Aguarda a navegação estar pronta
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Só processa redirecionamentos quando tudo estiver pronto
    if (!isNavigationReady || isLoading) return;
    
    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';
    const inOnboardingGroup = segments[0] === 'onboarding';
    
    // Lógica de redirecionamento baseada no estado de autenticação
    if (!user) {
      // Usuário não autenticado - deve estar em auth
      if (!inAuthGroup) {
        router.replace('/auth/sign-in');
      }
    } else {
      // Usuário autenticado
      if (needsOnboarding?.()) {
        // Precisa fazer onboarding
        if (!inOnboardingGroup) {
          router.replace('/onboarding');
        }
      } else {
        // Onboarding completo - deve estar nas tabs
        if (!inTabsGroup) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [user, isLoading, needsOnboarding, segments, isNavigationReady]);

  // Mostra loading enquanto não está pronto
  if (!isNavigationReady || isLoading) {
    return <LoadingScreen message="Loading, please wait..." />;
  }

  // Renderizar a estrutura de navegação
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