import { Stack } from 'expo-router';

import { CLARA } from '@/constants/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: CLARA.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="voice-setup" />
      <Stack.Screen name="connect" />
    </Stack>
  );
}
