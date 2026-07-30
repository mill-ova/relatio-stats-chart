/**
 * Pill — піл значення для скраба графіка.
 * Figma: _Pill 18442:93992 (стор. «↪ Badges & Tags»)
 *
 * Три шари під текстом, як у Button:
 *   Tint  — bg/inverse на opacity/90
 *   Glass — ефект Glass/Glass (у RN — BlurView, необовʼязково)
 *   текст — Label (Body/Small/Regular) · Value (Body/Small/Medium), обидва text/inverse
 *
 * Інтерпункт «·» зашитий у компонент: у Figma це окремий текст-нод, бо мішані
 * ваги в одному text-пропі неможливі.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OPACITY, RADIUS, SPACE, TYPE, TOKENS, ThemeName } from './tokens';

export type PillProps = {
  label: string;               // «Thu», «14 Jul», «Jan 26» — sentence case, як вісь X
  value: string;               // «6.0%»
  theme?: ThemeName;
  /** Скло. Вимагає expo-blur / @react-native-community/blur.
   *  Без нього піл лишається читабельним — tint на 90 % тримає контраст. */
  BlurComponent?: React.ComponentType<{ style?: any; intensity?: number; tint?: string }>;
};

export default function Pill({ label, value, theme = 'dark', BlurComponent }: PillProps) {
  const t = TOKENS[theme];
  return (
    <View style={styles.root} pointerEvents="none">
      {/* Tint */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: t.bgInverse, opacity: OPACITY.o90, borderRadius: RADIUS.full },
        ]}
      />
      {/* Glass */}
      {BlurComponent ? (
        <BlurComponent
          style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.full, overflow: 'hidden' }]}
          intensity={12}
          tint={theme === 'dark' ? 'light' : 'dark'}
        />
      ) : null}

      <Text style={[TYPE.axis, { color: t.textInverse }]}>{label}</Text>
      <Text style={[TYPE.axis, { color: t.textInverse }]}>·</Text>
      <Text style={[TYPE.label, { color: t.textInverse }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE.s4,
    paddingVertical: SPACE.s2,
    paddingHorizontal: SPACE.s8,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
});
