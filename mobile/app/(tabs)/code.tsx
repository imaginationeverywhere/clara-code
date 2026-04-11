import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Audio } from 'expo-av';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SyntaxBlock } from '@/components/SyntaxBlock';
import { CLARA } from '@/constants/theme';

const SAMPLE_CODE = `import { useMemo } from "react";

export function useClaraSummary(path: string) {
  // Clara will attach review notes per line in Phase 3.
  return useMemo(() => ({ path, ready: false }), [path]);
}`;

const INLINE_COMMENTS: { line: number; body: string }[] = [
  {
    line: 4,
    body: 'When the backend is ready, hydrate this hook from the Clara review service instead of a static flag.',
  },
  {
    line: 5,
    body: 'Consider memoizing with a stable project id from workspace context.',
  },
];

export default function CodeScreen() {
  const [lastStubLog, setLastStubLog] = useState<string | null>(null);

  const playStub = useCallback(async (label: string) => {
    setLastStubLog(`${label}: playback stub (expo-av ready, no remote audio)`);
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });
    } catch {
      // Stub only — ignore failures in scaffold.
    }
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Code review</Text>
        <Text style={styles.subtitle}>Syntax-highlighted diff context</Text>

        <View style={styles.filePill}>
          <FontAwesome name="file-code-o" size={16} color={CLARA.accent} />
          <Text style={styles.filePillText}>src/hooks/useClaraSummary.ts</Text>
        </View>

        <View style={styles.codeCard}>
          <SyntaxBlock code={SAMPLE_CODE} />
        </View>

        <Text style={styles.sectionLabel}>Clara comments</Text>
        {INLINE_COMMENTS.map((c) => (
          <View key={c.line} style={styles.commentRow}>
            <View style={styles.commentBadge}>
              <Text style={styles.commentBadgeText}>L{c.line}</Text>
            </View>
            <View style={styles.commentBody}>
              <Text style={styles.commentText}>{c.body}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Play voice note for line ${c.line}`}
                onPress={() => playStub(`Line ${c.line}`)}
                style={({ pressed }) => [styles.playBtn, pressed && styles.playBtnPressed]}
              >
                <FontAwesome name="play" size={14} color={CLARA.background} />
                <Text style={styles.playLabel}>Play</Text>
              </Pressable>
            </View>
          </View>
        ))}

        {lastStubLog ? <Text style={styles.stub}>{lastStubLog}</Text> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CLARA.background },
  scroll: { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },
  title: {
    marginTop: 8,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 28,
    color: CLARA.text,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: CLARA.textMuted,
  },
  filePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: CLARA.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
  },
  filePillText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: CLARA.text,
  },
  codeCard: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0d1117',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
  },
  sectionLabel: {
    marginTop: 4,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: CLARA.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  commentRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  commentBadge: {
    marginTop: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(123, 200, 216, 0.15)',
  },
  commentBadgeText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: CLARA.accent,
  },
  commentBody: {
    flex: 1,
    gap: 10,
  },
  commentText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: CLARA.text,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: CLARA.accent,
  },
  playBtnPressed: { opacity: 0.85 },
  playLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: CLARA.background,
  },
  stub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: CLARA.textMuted,
    fontStyle: 'italic',
  },
});
