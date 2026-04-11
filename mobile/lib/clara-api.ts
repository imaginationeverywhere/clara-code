import * as FileSystem from 'expo-file-system';

import { chatUrl, voiceSttUrl, voiceTtsUrl } from '@/constants/api';

export type ChatMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

function parseAssistantText(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    return '';
  }
  const rec = data as Record<string, unknown>;

  const direct =
    typeof rec.reply === 'string'
      ? rec.reply
      : typeof rec.content === 'string'
        ? rec.content
        : typeof rec.message === 'string'
          ? rec.message
          : typeof rec.response === 'string'
            ? rec.response
            : null;
  if (direct) return direct;

  const choices = rec.choices;
  if (Array.isArray(choices) && choices[0] && typeof choices[0] === 'object') {
    const c0 = choices[0] as Record<string, unknown>;
    const msg = c0.message;
    if (msg && typeof msg === 'object') {
      const m = msg as Record<string, unknown>;
      if (typeof m.content === 'string') return m.content;
    }
    if (typeof c0.text === 'string') return c0.text;
  }

  return '';
}

export async function postChat(
  apiKey: string,
  messages: ChatMessage[]
): Promise<string> {
  const res = await fetch(chatUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ messages }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Chat failed (${res.status})`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    throw new Error('Chat response was not JSON');
  }

  const out = parseAssistantText(data);
  if (!out) {
    throw new Error('Unexpected chat response shape');
  }
  return out;
}

function parseSttTranscript(data: unknown): string {
  if (typeof data !== 'object' || data === null) return '';
  const rec = data as Record<string, unknown>;
  if (typeof rec.transcript === 'string') return rec.transcript;
  if (typeof rec.text === 'string') return rec.text;
  if (typeof rec.transcription === 'string') return rec.transcription;
  return '';
}

export async function postVoiceStt(
  apiKey: string,
  audioUri: string
): Promise<string> {
  const form = new FormData();
  form.append('file', {
    uri: audioUri,
    name: 'recording.m4a',
    type: 'audio/m4a',
  } as unknown as Blob);

  const res = await fetch(voiceSttUrl(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: form,
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(text || `Speech-to-text failed (${res.status})`);
  }

  let data: unknown;
  try {
    data = JSON.parse(text) as unknown;
  } catch {
    return text.trim();
  }

  const transcript = parseSttTranscript(data);
  return transcript || text.trim();
}

export type TtsResult = { audioUri: string; mimeType: string };

export async function postVoiceTts(
  apiKey: string,
  text: string
): Promise<TtsResult> {
  const res = await fetch(voiceTtsUrl(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(errBody || `TTS failed (${res.status})`);
  }

  const contentType = res.headers.get('content-type') ?? '';
  const cacheDir = FileSystem.cacheDirectory;
  if (!cacheDir) {
    throw new Error('No cache directory for TTS audio');
  }

  if (contentType.includes('application/json')) {
    const data = (await res.json()) as Record<string, unknown>;
    const url =
      typeof data.url === 'string'
        ? data.url
        : typeof data.audioUrl === 'string'
          ? data.audioUrl
          : null;
    if (url) {
      return { audioUri: url, mimeType: 'audio/mpeg' };
    }
    const b64 =
      typeof data.audio === 'string'
        ? data.audio
        : typeof data.audioBase64 === 'string'
          ? data.audioBase64
          : null;
    if (b64) {
      const ext = contentType.includes('wav') ? 'wav' : 'mp3';
      const path = `${cacheDir}clara-tts.${ext}`;
      await FileSystem.writeAsStringAsync(path, b64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return { audioUri: path, mimeType: contentType || 'audio/mpeg' };
    }
    throw new Error('TTS JSON missing audio url or base64');
  }

  const buf = await res.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  const b64 = btoa(binary);
  const path = `${cacheDir}clara-tts.audio`;
  await FileSystem.writeAsStringAsync(path, b64, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { audioUri: path, mimeType: contentType || 'audio/mpeg' };
}
