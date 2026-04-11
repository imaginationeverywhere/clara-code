import { Audio } from 'expo-av';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLARA } from '@/constants/theme';

export default function VoiceSetupScreen() {
  const router = useRouter();
  const [isRequesting, setIsRequesting] = useState(false);

  const requestMic = useCallback(async () => {
    setIsRequesting(true);
    try {
      await Audio.requestPermissionsAsync();
    } catch {
      // User can enable later in Settings; continue onboarding.
    } finally {
      setIsRequesting(false);
      router.push('/(onboarding)/connect');
    }
  }, [router]);

  const skip = useCallback(() => {
    router.push('/(onboarding)/connect');
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.copy}>
          <Text style={styles.title}>Voice</Text>
          <Text style={styles.lead}>
            Clara can hear you when you describe bugs, refactors, and ideas out loud. We need
            microphone access for voice sessions.
          </Text>
          <Text style={styles.detail}>
            Audio is used only when you start a voice turn. You can change this anytime in system
            settings.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (pressed || isRequesting) && styles.pressed,
              isRequesting && styles.primaryDisabled,
            ]}
            onPress={requestMic}
            disabled={isRequesting}
            accessibilityRole="button"
            accessibilityLabel="Enable microphone"
            accessibilityState={{ disabled: isRequesting }}
          >
            {isRequesting ? (
              <ActivityIndicator color={CLARA.background} />
            ) : (
              <Text style={styles.primaryLabel}>Enable microphone</Text>
            )}
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
            onPress={skip}
            disabled={isRequesting}
            accessibilityRole="button"
            accessibilityLabel="Skip for now"
          >
            <Text style={styles.secondaryLabel}>Skip for now</Text>
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
  copy: {
    flex: 1,
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: CLARA.text,
  },
  lead: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    lineHeight: 26,
    color: CLARA.text,
  },
  detail: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: CLARA.textMuted,
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: CLARA.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 54,
    justifyContent: 'center',
  },
  primaryDisabled: {
    opacity: 0.85,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
  },
  pressed: {
    opacity: 0.88,
  },
  primaryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: CLARA.background,
  },
  secondaryLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: CLARA.textMuted,
  },
});
