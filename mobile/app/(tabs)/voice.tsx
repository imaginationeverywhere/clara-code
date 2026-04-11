import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceMicButton } from '@/components/VoiceMicButton';
import { VoiceWaveform } from '@/components/VoiceWaveform';
import { useClaraApiKey } from '@/hooks/useClaraApiKey';
import { postChat, postVoiceStt, postVoiceTts, type ChatMessage } from '@/lib/clara-api';
import { loadVoicePrefs } from '@/lib/voice-prefs';
import { CLARA } from '@/constants/theme';

export default function VoiceScreen() {
  const { apiKey, loading: keyLoading } = useClaraApiKey();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const autoPlayRef = useRef(true);
  const threadRef = useRef<ChatMessage[]>([]);

  useEffect(() => {
    threadRef.current = thread;
  }, [thread]);

  const refreshVoicePrefs = useCallback(() => {
    void loadVoicePrefs().then((p) => {
      autoPlayRef.current = p.autoPlayTts;
    });
  }, []);

  useEffect(() => {
    refreshVoicePrefs();
  }, [refreshVoicePrefs]);

  useFocusEffect(
    useCallback(() => {
      refreshVoicePrefs();
    }, [refreshVoicePrefs])
  );

  useEffect(() => {
    return () => {
      void recordingRef.current?.stopAndUnloadAsync();
      void soundRef.current?.unloadAsync();
    };
  }, []);

  const stopPlayback = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch {
      soundRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  const playResponse = useCallback(
    async (text: string) => {
      if (!apiKey || !text.trim()) return;
      if (!autoPlayRef.current) return;

      await stopPlayback();
      setIsSpeaking(true);
      try {
        const { audioUri } = await postVoiceTts(apiKey, text);
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
        });
        const { sound } = await Audio.Sound.createAsync({ uri: audioUri });
        soundRef.current = sound;
        sound.setOnPlaybackStatusUpdate((status) => {
          if (!status.isLoaded) return;
          if (status.didJustFinish) {
            setIsSpeaking(false);
            void sound.unloadAsync();
            soundRef.current = null;
          }
        });
        await sound.playAsync();
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Playback failed';
        setError(msg);
        setIsSpeaking(false);
      }
    },
    [apiKey, stopPlayback]
  );

  const startRecording = useCallback(async () => {
    if (!apiKey || isProcessing || isSpeaking) return;
    setError(null);
    await stopPlayback();

    try {
      const perm = await Audio.getPermissionsAsync();
      if (!perm.granted) {
        const req = await Audio.requestPermissionsAsync();
        if (!req.granted) {
          setError('Microphone permission is required for voice.');
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not start recording';
      setError(msg);
      setIsRecording(false);
    }
  }, [apiKey, isProcessing, isSpeaking, stopPlayback]);

  const finishRecording = useCallback(async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) return;

    setIsRecording(false);
    setIsProcessing(true);
    setError(null);

    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri || !apiKey) {
        throw new Error('No recording available');
      }

      const text = await postVoiceStt(apiKey, uri);
      setTranscript(text);

      const userMsg: ChatMessage = { role: 'user', content: text };
      const nextThread: ChatMessage[] = [...threadRef.current, userMsg];
      const reply = await postChat(apiKey, nextThread);
      setAssistantReply(reply);
      const assistantMsg: ChatMessage = { role: 'assistant', content: reply };
      const updated: ChatMessage[] = [...nextThread, assistantMsg];
      setThread(updated);
      threadRef.current = updated;

      await playResponse(reply);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Voice request failed';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, playResponse]);

  const onMicPress = useCallback(() => {
    if (keyLoading || !apiKey) return;
    if (isProcessing) return;
    if (isSpeaking) {
      void stopPlayback();
      return;
    }
    if (isRecording) {
      void finishRecording();
      return;
    }
    void startRecording();
  }, [
    apiKey,
    keyLoading,
    isProcessing,
    isSpeaking,
    isRecording,
    startRecording,
    finishRecording,
    stopPlayback,
  ]);

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
          <Text style={styles.muted}>Add an API key in onboarding to use voice.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const micLabel = isRecording
    ? 'Stop recording'
    : isProcessing
      ? 'Processing'
      : isSpeaking
        ? 'Stop playback'
        : 'Start recording';

  const pulsing = isRecording || isSpeaking;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Voice</Text>
        <Text style={styles.subtitle}>Talk with Clara</Text>

        <View style={styles.center}>
          <VoiceMicButton
            onPress={onMicPress}
            isPulsing={pulsing}
            accessibilityLabel={micLabel}
          />
          {isProcessing ? (
            <View style={styles.processingRow}>
              <ActivityIndicator color={CLARA.accent} size="small" />
              <Text style={styles.processingText}>Transcribing and thinking…</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.waveSection}>
          <Text style={styles.waveLabel}>
            {isRecording
              ? 'Listening…'
              : isSpeaking
                ? 'Clara is speaking'
                : isProcessing
                  ? 'Working…'
                  : ' '}
          </Text>
          <VoiceWaveform isSpeaking={isSpeaking} isRecording={isRecording} />
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transcript</Text>
          <Text style={styles.transcript}>{transcript || 'Your speech will appear here.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Clara</Text>
          <Text style={styles.transcript}>
            {assistantReply || 'Clara’s reply will appear after each voice turn.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CLARA.background },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 16,
  },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  muted: {
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
    marginBottom: 8,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  processingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  processingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: CLARA.textMuted,
  },
  waveSection: {
    gap: 8,
    alignItems: 'center',
  },
  waveLabel: {
    minHeight: 18,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: CLARA.accent,
  },
  error: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#F85149',
    textAlign: 'center',
  },
  card: {
    marginTop: 4,
    padding: 16,
    borderRadius: 12,
    backgroundColor: CLARA.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CLARA.border,
  },
  cardTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: CLARA.textMuted,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  transcript: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
    color: CLARA.text,
  },
});
