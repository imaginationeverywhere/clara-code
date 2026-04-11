import * as SecureStore from 'expo-secure-store';

import { CLARA_VOICE_PREFS_KEY } from '@/constants/storage';

export type VoicePrefs = {
  /** When true, play TTS audio after a voice turn (default true). */
  autoPlayTts: boolean;
};

const DEFAULT_PREFS: VoicePrefs = {
  autoPlayTts: true,
};

export async function loadVoicePrefs(): Promise<VoicePrefs> {
  try {
    const raw = await SecureStore.getItemAsync(CLARA_VOICE_PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<VoicePrefs>;
    return {
      autoPlayTts:
        typeof parsed.autoPlayTts === 'boolean' ? parsed.autoPlayTts : DEFAULT_PREFS.autoPlayTts,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export async function saveVoicePrefs(prefs: VoicePrefs): Promise<void> {
  await SecureStore.setItemAsync(CLARA_VOICE_PREFS_KEY, JSON.stringify(prefs), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED,
  });
}
