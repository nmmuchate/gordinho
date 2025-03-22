import { Stack } from 'expo-router';
import { useAuthStore } from '@/stores/auth';
import { useEffect } from 'react';

export default function AuthLayout() {
  // Apenas observe o estado de autenticação, mas não tente navegar aqui
  // A navegação já está sendo tratada no _layout raiz
  const { user, isLoading } = useAuthStore();

  // Para propósitos de depuração
  useEffect(() => {
    console.log('AuthLayout - Auth state:', { user: !!user, isLoading });
  }, [user, isLoading]);

  // Simplesmente renderize as telas de autenticação
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
    </Stack>
  );
}