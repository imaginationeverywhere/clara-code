/** Clara Code dev backend (ngrok) */
export const CLARA_API_BASE = 'https://clara-code-backend-dev.ngrok.quiknation.com';

export function chatUrl(): string {
  return `${CLARA_API_BASE}/api/chat`;
}

export function voiceSttUrl(): string {
  return `${CLARA_API_BASE}/api/voice/stt`;
}

export function voiceTtsUrl(): string {
  return `${CLARA_API_BASE}/api/voice/tts`;
}
