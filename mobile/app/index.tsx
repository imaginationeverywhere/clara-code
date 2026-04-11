import * as SecureStore from 'expo-secure-store';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CLARA_API_KEY_STORAGE_KEY } from '@/constants/storage';
import { CLARA } from '@/constants/theme';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const key = await SecureStore.getItemAsync(CLARA_API_KEY_STORAGE_KEY);
        if (!cancelled) {
          setHasApiKey(Boolean(key?.trim()));
        }
      } catch {
        if (!cancelled) setHasApiKey(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.boot} accessibilityLabel="Loading">
        <ActivityIndicator color={CLARA.accent} size="large" />
      </View>
    );
  }

  if (hasApiKey) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(onboarding)" />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: CLARA.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
