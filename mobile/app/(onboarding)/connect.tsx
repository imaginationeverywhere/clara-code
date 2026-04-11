import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CLARA_API_KEY_STORAGE_KEY } from '@/constants/storage';
import { CLARA } from '@/constants/theme';

export default function ConnectScreen() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onSave = useCallback(async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('Enter your API key from claracode.ai.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await SecureStore.setItemAsync(CLARA_API_KEY_STORAGE_KEY, trimmed, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
      router.replace('/(tabs)');
    } catch {
      setError('Could not save your key securely. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [apiKey, router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.body}>
          <View style={styles.copy}>
            <Text style={styles.title}>Connect</Text>
            <Text style={styles.lead}>
              Add your Clara Code API key so this app can reach claracode.ai on your behalf. You can
              rotate keys from your account on the web.
            </Text>
            <Text style={styles.label}>API key</Text>
            <TextInput
              style={styles.input}
              value={apiKey}
              onChangeText={(t) => {
                setApiKey(t);
                if (error) setError(null);
              }}
              placeholder="sk-…"
              placeholderTextColor={CLARA.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              textContentType="password"
              accessibilityLabel="API key"
              editable={!isSaving}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
              isSaving && styles.primaryDisabled,
            ]}
            onPress={onSave}
            disabled={isSaving}
            accessibilityRole="button"
            accessibilityLabel="Save and continue"
          >
            <Text style={styles.primaryLabel}>{isSaving ? 'Saving…' : 'Save and continue'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: CLARA.background,
  },
  flex: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  copy: {
    flex: 1,
    paddingTop: 8,
    gap: 12,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: CLARA.text,
    marginBottom: 4,
  },
  lead: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: CLARA.textMuted,
    marginBottom: 8,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: CLARA.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
  },
  input: {
    marginTop: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: CLARA.text,
    backgroundColor: CLARA.surface,
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#F85149',
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: CLARA.accent,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryDisabled: {
    opacity: 0.75,
  },
  pressed: {
    opacity: 0.88,
  },
  primaryLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: CLARA.background,
  },
});
