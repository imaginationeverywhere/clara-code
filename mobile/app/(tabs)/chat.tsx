import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useClaraApiKey } from '@/hooks/useClaraApiKey';
import { postChat, type ChatMessage } from '@/lib/clara-api';
import { CLARA } from '@/constants/theme';

type Row = { id: string; role: 'user' | 'assistant'; content: string };

function makeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function ChatScreen() {
  const { apiKey, loading: keyLoading } = useClaraApiKey();
  const [messages, setMessages] = useState<Row[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList<Row>>(null);

  useEffect(() => {
    if (messages.length === 0) return;
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [messages.length, sending]);

  const onSend = useCallback(async () => {
    const text = input.trim();
    if (!text || !apiKey || sending) return;

    setError(null);
    const userMsg: Row = { id: makeId(), role: 'user', content: text };
    setInput('');
    setMessages((prev) => [...prev, userMsg]);
    setSending(true);

    const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const reply = await postChat(apiKey, history);
      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: 'assistant', content: reply },
      ]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Request failed';
      setError(msg);
    } finally {
      setSending(false);
    }
  }, [apiKey, input, messages, sending]);

  if (keyLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <ActivityIndicator color={CLARA.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (!apiKey) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.centered}>
          <Text style={styles.missingKey}>Add an API key in onboarding to use chat.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <Text style={styles.title}>Chat</Text>
        <Text style={styles.subtitle}>Message Clara</Text>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.bubbleUser : styles.bubbleAssistant,
              ]}
            >
              <Text style={styles.bubbleMeta}>{item.role === 'user' ? 'You' : 'Clara'}</Text>
              <Text style={styles.bubbleText}>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Ask a coding question to get started. Messages are sent to Clara&apos;s chat API.
            </Text>
          }
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message…"
            placeholderTextColor={CLARA.textMuted}
            multiline
            editable={!sending}
            accessibilityLabel="Message input"
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendBtn,
              (!input.trim() || sending) && styles.sendDisabled,
              pressed && styles.sendPressed,
            ]}
            onPress={onSend}
            disabled={!input.trim() || sending}
            accessibilityRole="button"
            accessibilityLabel="Send"
          >
            {sending ? (
              <ActivityIndicator color={CLARA.background} size="small" />
            ) : (
              <Text style={styles.sendLabel}>Send</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CLARA.background },
  flex: { flex: 1, paddingHorizontal: 20, paddingBottom: 8 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  missingKey: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: CLARA.textMuted,
    textAlign: 'center',
  },
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
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
    gap: 10,
    flexGrow: 1,
  },
  bubble: {
    maxWidth: '92%',
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: 'rgba(123, 200, 216, 0.12)',
    borderColor: CLARA.border,
  },
  bubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: CLARA.surface,
    borderColor: CLARA.border,
  },
  bubbleMeta: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: CLARA.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bubbleText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 22,
    color: CLARA.text,
  },
  empty: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: CLARA.textMuted,
    textAlign: 'center',
    marginTop: 32,
    paddingHorizontal: 12,
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: '#F85149',
    marginBottom: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: CLARA.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: CLARA.text,
    backgroundColor: CLARA.surface,
  },
  sendBtn: {
    backgroundColor: CLARA.accent,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 72,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  sendDisabled: {
    opacity: 0.5,
  },
  sendPressed: {
    opacity: 0.88,
  },
  sendLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: CLARA.background,
  },
});
