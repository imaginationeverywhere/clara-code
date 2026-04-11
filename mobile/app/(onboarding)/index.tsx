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
          <Text style={styles.tagline}>Your AI coding companion</Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
            onPress={() => router.push('/(onboarding)/voice-setup')}
            accessibilityRole="button"
            accessibilityLabel="Get started"
          >
            <Text style={styles.primaryButtonLabel}>Get Started</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
            onPress={() => router.push('/(onboarding)/connect')}
            accessibilityRole="button"
            accessibilityLabel="I have an API key"
          >
            <Text style={styles.secondaryButtonLabel}>I have an API key</Text>
          </Pressable>
        </View>
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
    gap: 20,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    color: CLARA.textMuted,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  actions: {
    gap: 12,
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
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
    backgroundColor: CLARA.surface,
  },
  secondaryPressed: {
    opacity: 0.88,
  },
  secondaryButtonLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: CLARA.text,
  },
});
