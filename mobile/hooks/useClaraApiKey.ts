import * as SecureStore from 'expo-secure-store';
import { useEffect, useState } from 'react';

import { CLARA_API_KEY_STORAGE_KEY } from '@/constants/storage';

export function useClaraApiKey() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const k = await SecureStore.getItemAsync(CLARA_API_KEY_STORAGE_KEY);
        if (!cancelled) {
          setApiKey(k?.trim() ? k : null);
        }
      } catch {
        if (!cancelled) setApiKey(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { apiKey, loading };
}
