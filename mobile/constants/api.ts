/** Clara Code backend — override via EAS / app.config for non-dev builds */
export const CLARA_API_BASE =
  process.env.EXPO_PUBLIC_CLARA_API_BASE ??
  'https://clara-code-backend-dev.ngrok.quiknation.com';

export function chatUrl(): string {
  return `${CLARA_API_BASE}/api/chat`;
}

export function voiceSttUrl(): string {
  return `${CLARA_API_BASE}/api/voice/stt`;
}

export function voiceTtsUrl(): string {
  return `${CLARA_API_BASE}/api/voice/tts`;
}
