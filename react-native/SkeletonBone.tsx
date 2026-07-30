/**
 * SkeletonBone — кістка скелетона.
 * Figma: _Skeleton Bone 17789:102805 (вісь Phase A/B — це два кадри шимера для доксів)
 *
 * Структура повторює майстер: root — прозорий кліпер, усередині Base із
 * opacity/40 і Shine на повну. Саме тому шимер лишається помітним, хоча база
 * приглушена: якщо поставити opacity на root, згасне і шимер.
 *
 * Правка 2026-07-30: база опущена до opacity/40 — на повному bg/brand-disabled
 * у темній темі скелетон світив яскравіше за реальний контент.
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, cancelAnimation,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { OPACITY, RADIUS, TOKENS, ThemeName } from './tokens';

export type SkeletonBoneProps = {
  width: DimensionValue;
  height: number;
  radius?: number;
  theme?: ThemeName;
  /** Вимкнути рух під «Reduce motion» */
  animate?: boolean;
};

const SHINE_MS = 1500;

export default function SkeletonBone({
  width, height, radius = RADIUS.r8, theme = 'dark', animate = true,
}: SkeletonBoneProps) {
  const t = TOKENS[theme];
  const p = useSharedValue(0);

  useEffect(() => {
    if (!animate) return;
    p.value = 0;
    p.value = withRepeat(withTiming(1, { duration: SHINE_MS, easing: Easing.bezier(0.4, 0, 0.2, 1) }), -1, false);
    return () => cancelAnimation(p);
  }, [animate, p]);

  const shine = useAnimatedStyle(() => ({
    transform: [{ translateX: (p.value * 2 - 1) * 200 }],
  }));

  return (
    <View style={[{ width, height, borderRadius: radius }, styles.clip]}>
      {/* Base — bg/brand-disabled на opacity/40 */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: t.bgBrandDisabled, opacity: OPACITY.o40 }]} />

      {/* Shine — градієнт прозорий → світлий → прозорий, їде злива направо */}
      {animate ? (
        <Animated.View style={[StyleSheet.absoluteFill, shine]}>
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={t.bgInverse} stopOpacity={0} />
                <Stop offset="0.5" stopColor={t.bgInverse} stopOpacity={theme === 'dark' ? 0.16 : 0.6} />
                <Stop offset="1" stopColor={t.bgInverse} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Rect x="0" y="0" width="100%" height="100%" fill="url(#shine)" />
          </Svg>
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { overflow: 'hidden' },
});
