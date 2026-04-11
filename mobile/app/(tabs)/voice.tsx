import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceMicButton } from '@/components/VoiceMicButton';
import { VoiceWaveform } from '@/components/VoiceWaveform';
import { CLARA } from '@/constants/theme';

export default function VoiceScreen() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState(
    'Tap the microphone to start a stubbed session. No audio is sent yet.'
  );

  const onMicPress = useCallback(() => {
    if (isSpeaking) return;

    if (isListening) {
      setIsListening(false);
      setIsSpeaking(true);
      setTranscript(
        'Clara: I heard your request. Voice streaming is not connected yet; this is placeholder text for layout and review.'
      );
      setTimeout(() => setIsSpeaking(false), 3800);
      return;
    }

    setIsListening(true);
    setTranscript('Listening… (microphone capture is stubbed in Phase 2.)');
  }, [isListening, isSpeaking]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Voice</Text>
        <Text style={styles.subtitle}>Talk with Clara</Text>

        <View style={styles.center}>
          <VoiceMicButton
            onPress={onMicPress}
            isPulsing={isListening}
            accessibilityLabel={isListening ? 'Stop listening' : 'Start listening'}
          />
        </View>

        <View style={styles.waveSection}>
          <Text style={styles.waveLabel}>{isSpeaking ? 'Clara is speaking' : ' '}</Text>
          <VoiceWaveform isSpeaking={isSpeaking} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Transcript</Text>
          <Text style={styles.transcript}>{transcript}</Text>
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
  card: {
    marginTop: 8,
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
