import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { CLARA } from '@/constants/theme';

type VoiceMicButtonProps = {
  onPress: () => void;
  /** When true, shows a soft pulse (e.g. listening). */
  isPulsing: boolean;
  accessibilityLabel?: string;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function VoiceMicButton({
  onPress,
  isPulsing,
  accessibilityLabel = 'Voice input',
}: VoiceMicButtonProps) {
  const pulse = useSharedValue(0);

  const ringStyle = useAnimatedStyle(() => {
    const scale = 1 + pulse.value * 0.12;
    return {
      transform: [{ scale }],
      opacity: 0.35 + pulse.value * 0.35,
    };
  });

  const innerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  useEffect(() => {
    if (isPulsing) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withTiming(0, { duration: 200 });
    }
  }, [isPulsing, pulse]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.ring, ringStyle]} pointerEvents="none" />
      <AnimatedPressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={[styles.button, innerStyle]}
      >
        <FontAwesome name="microphone" size={44} color={CLARA.background} />
      </AnimatedPressable>
    </View>
  );
}

const SIZE = 132;

const styles = StyleSheet.create({
  wrap: {
    width: SIZE + 36,
    height: SIZE + 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: SIZE + 28,
    height: SIZE + 28,
    borderRadius: (SIZE + 28) / 2,
    backgroundColor: CLARA.accent,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: CLARA.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: CLARA.accent,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
});
