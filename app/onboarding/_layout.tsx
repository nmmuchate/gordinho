import { Stack } from 'expo-router';
import { useAuthStore } from '../../stores/auth';
import { useRouter } from 'expo-router';

export default function OnboardingLayout() {
  const { user } = useAuthStore();



  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
    </Stack>
  );
}