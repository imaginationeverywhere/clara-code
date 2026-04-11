import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ClaraLogo } from '@/components/ClaraLogo';
import { CLARA_API_KEY_STORAGE_KEY } from '@/constants/storage';
import { CLARA } from '@/constants/theme';
import { loadVoicePrefs, saveVoicePrefs, type VoicePrefs } from '@/lib/voice-prefs';

function maskKey(key: string): string {
  const t = key.trim();
  if (t.length <= 8) return '••••••••';
  return `${t.slice(0, 4)}…${t.slice(-4)}`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [apiKeyPreview, setApiKeyPreview] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<VoicePrefs | null>(null);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const k = await SecureStore.getItemAsync(CLARA_API_KEY_STORAGE_KEY);
        const p = await loadVoicePrefs();
        if (!cancelled) {
          setApiKeyPreview(k?.trim() ? maskKey(k) : null);
          setPrefs(p);
        }
      } catch {
        if (!cancelled) {
          setApiKeyPreview(null);
          setPrefs({ autoPlayTts: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const onToggleAutoPlay = useCallback(
    async (value: boolean) => {
      const next: VoicePrefs = { autoPlayTts: value };
      setPrefs(next);
      try {
        await saveVoicePrefs(next);
      } catch {
        setPrefs((p) => p);
      }
    },
    []
  );

  const onClearKey = useCallback(async () => {
    setClearing(true);
    try {
      await SecureStore.deleteItemAsync(CLARA_API_KEY_STORAGE_KEY);
      setApiKeyPreview(null);
    } catch {
      // ignore
    } finally {
      setClearing(false);
    }
  }, []);

  const onSignOut = useCallback(async () => {
    setClearing(true);
    try {
      await SecureStore.deleteItemAsync(CLARA_API_KEY_STORAGE_KEY);
      router.replace('/(onboarding)');
    } catch {
      router.replace('/(onboarding)');
    } finally {
      setClearing(false);
    }
  }, [router]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.brandRow}>
          <ClaraLogo size={56} />
          <View>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Account and voice</Text>
          </View>
        </View>

        <Text style={styles.section}>API key</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Stored key</Text>
          <Text style={styles.value} accessibilityLabel="Masked API key">
            {apiKeyPreview ?? 'Not set'}
          </Text>
          <Pressable
            style={({ pressed }) => [styles.dangerOutline, pressed && styles.pressed]}
            onPress={onClearKey}
            disabled={!apiKeyPreview || clearing}
            accessibilityRole="button"
            accessibilityLabel="Clear API key from device"
          >
            <Text style={styles.dangerOutlineLabel}>Clear API key</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>Voice</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={styles.rowText}>
              <Text style={styles.prefTitle}>Auto-play responses</Text>
              <Text style={styles.prefBody}>Speak Clara&apos;s reply after a voice turn</Text>
            </View>
            <Switch
              value={prefs?.autoPlayTts ?? true}
              onValueChange={onToggleAutoPlay}
              trackColor={{ false: CLARA.border, true: 'rgba(123, 200, 216, 0.45)' }}
              thumbColor={CLARA.accent}
              disabled={prefs === null}
            />
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
          onPress={onSignOut}
          disabled={clearing}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutLabel}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CLARA.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: CLARA.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: CLARA.textMuted,
  },
  section: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: CLARA.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 8,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: CLARA.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
    gap: 10,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: CLARA.textMuted,
  },
  value: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: CLARA.text,
  },
  dangerOutline: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#F85149',
    alignItems: 'center',
  },
  dangerOutlineLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: '#F85149',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowText: { flex: 1, gap: 4 },
  prefTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: CLARA.text,
  },
  prefBody: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: CLARA.textMuted,
    lineHeight: 20,
  },
  signOut: {
    marginTop: 12,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: CLARA.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
    alignItems: 'center',
  },
  signOutLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    color: CLARA.text,
  },
  pressed: { opacity: 0.88 },
});
