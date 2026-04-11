import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClaraLogo } from '@/components/ClaraLogo';
import { CLARA } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.hero}>
          <ClaraLogo size={140} />
          <Text style={styles.title}>Clara Code</Text>
          <Text style={styles.tagline}>Your AI coding companion</Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          onPress={() => router.push('/(onboarding)/voice-setup')}
          accessibilityRole="button"
          accessibilityLabel="Get started"
        >
          <Text style={styles.primaryButtonLabel}>Get Started</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: CLARA.background,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 32,
    color: CLARA.text,
    marginTop: 8,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: CLARA.textMuted,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: CLARA.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonPressed: {
    opacity: 0.88,
  },
  primaryButtonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: CLARA.background,
  },
});
