import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { CLARA } from '@/constants/theme';

const BAR_COUNT = 28;

function WaveBar({
  phase,
  index,
  active,
}: {
  phase: SharedValue<number>;
  index: number;
  active: SharedValue<number>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    const on = active.value;
    const amp = on
      ? 6 + 26 * (0.5 + 0.5 * Math.sin(phase.value * Math.PI * 2 + index * 0.42))
      : 4;
    return {
      height: amp,
      opacity: on ? 0.9 : 0.35,
    };
  });

  return <Animated.View style={[styles.bar, animatedStyle]} />;
}

export function VoiceWaveform({ isSpeaking }: { isSpeaking: boolean }) {
  const phase = useSharedValue(0);
  const active = useSharedValue(0);

  useEffect(() => {
    active.value = isSpeaking ? 1 : 0;
  }, [isSpeaking, active]);

  useEffect(() => {
    if (isSpeaking) {
      phase.value = withRepeat(
        withTiming(1, { duration: 1100, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      cancelAnimation(phase);
      phase.value = withTiming(0, { duration: 180 });
    }
  }, [isSpeaking, phase]);

  return (
    <View style={styles.row} accessibilityRole="none">
      {Array.from({ length: BAR_COUNT }).map((_, index) => (
        <WaveBar key={index} phase={phase} index={index} active={active} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    gap: 3,
  },
  bar: {
    width: 3,
    borderRadius: 2,
    backgroundColor: CLARA.accent,
  },
});
