/**
 * StatsHeader — верхній текстовий блок Stats Chart.
 * Figma: Stats Header 18360:92366 — вісь State (Default · Loading · Empty)
 *
 * Правила, які тут не косметика:
 * 1. Hero-цифра залита brand-градієнтом. У RN текст не приймає градієнт напряму,
 *    тому це SVG-текст із LinearGradient (альтернатива — MaskedView + LinearGradient).
 * 2. Одиниця живе в лейблі, не в значенні: «ACTIVE DAYS» / «12», не «12 days».
 * 3. В Empty друга метрика ВИМКНЕНА: нуль на видному місці демотивує сильніше,
 *    ніж його відсутність.
 * 4. Інсайт — одне число, і саме те, якого немає на екрані (кількість вправ).
 *    Акцент робиться на числі, не на всьому реченні.
 * 5. Hero НЕ змінюється під час скраба — вона про період, точка про день.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Text as SvgText } from 'react-native-svg';
import { SPACE, TOKENS, TYPE, ThemeName } from './tokens';
import SkeletonBone from './SkeletonBone';

export type HeaderState = 'default' | 'loading' | 'empty';

export type StatsHeaderProps = {
  state?: HeaderState;
  /** «+8%» — рахується з даних періоду, не хардкод */
  value: string;
  metricLabel?: string;
  showSecondMetric?: boolean;
  secondLabel?: string;
  secondValue?: string;
  /** Речення-інсайт. accent — фрагмент, який виділяється Semibold (кількість вправ) */
  insight?: { text: string; accent?: string };
  theme?: ThemeName;
  reduceMotion?: boolean;
};

const HERO_W = 200;   // запасу вистачає на «+14%»; SVG обрізає по цій ширині

export default function StatsHeader({
  state = 'default', value, metricLabel = 'IN CONTROL',
  showSecondMetric = false, secondLabel = 'ACTIVE DAYS', secondValue = '12',
  insight, theme = 'dark', reduceMotion = false,
}: StatsHeaderProps) {
  const t = TOKENS[theme];

  if (state === 'loading') {
    return (
      <View style={styles.root} accessible accessibilityState={{ busy: true }} accessibilityLabel="Дані завантажуються">
        <View style={{ gap: SPACE.s8 }}>
          <SkeletonBone width={120} height={40} radius={8} theme={theme} animate={!reduceMotion} />
          <SkeletonBone width={88} height={12} radius={4} theme={theme} animate={!reduceMotion} />
        </View>
        <View style={{ gap: SPACE.s8 }}>
          <SkeletonBone width="100%" height={14} radius={4} theme={theme} animate={!reduceMotion} />
          <SkeletonBone width={220} height={14} radius={4} theme={theme} animate={!reduceMotion} />
        </View>
      </View>
    );
  }

  const isEmpty = state === 'empty';
  const heroColor = isEmpty ? t.textTertiary : undefined;

  return (
    <View style={styles.root}>
      <View style={styles.row}>
        <View style={styles.metric}>
          {/* Hero: у Empty це «—» суцільним text/tertiary, інакше — градієнт */}
          <Svg width={HERO_W} height={TYPE.hero.lineHeight}>
            <Defs>
              <LinearGradient id="hero" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={t.brandFrom} />
                <Stop offset="1" stopColor={t.brandTo} />
              </LinearGradient>
            </Defs>
            <SvgText
              x={0}
              y={TYPE.hero.fontSize}
              fontSize={TYPE.hero.fontSize}
              fontFamily={TYPE.hero.fontFamily}
              fill={heroColor ?? 'url(#hero)'}
            >
              {isEmpty ? '—' : value}
            </SvgText>
          </Svg>
          <Text style={[TYPE.label, { color: t.textTertiary }]}>{metricLabel}</Text>
        </View>

        {showSecondMetric && !isEmpty ? (
          <View style={styles.second}>
            <Text style={[TYPE.label, { color: t.textTertiary }]}>{secondLabel}</Text>
            <Text style={[TYPE.secondValue, { color: t.textDefault }]}>{secondValue}</Text>
          </View>
        ) : null}
      </View>

      {insight ? (
        <Text style={[TYPE.insight, { color: t.textDefault }]}>
          {splitAccent(insight).map((part, i) =>
            part.accent
              ? <Text key={i} style={TYPE.insightAccent}>{part.text}</Text>
              : <Text key={i}>{part.text}</Text>,
          )}
        </Text>
      ) : null}
    </View>
  );
}

/** Ділить речення на частини, щоб виділити тільки число вправ. */
function splitAccent({ text, accent }: { text: string; accent?: string }) {
  if (!accent || !text.includes(accent)) return [{ text, accent: false }];
  const [before, after] = text.split(accent);
  return [{ text: before, accent: false }, { text: accent, accent: true }, { text: after, accent: false }];
}

const styles = StyleSheet.create({
  root: { gap: SPACE.s16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACE.s16 },
  metric: { flex: 1, gap: SPACE.s2 },
  second: { alignItems: 'flex-end', gap: SPACE.s2 },
});
