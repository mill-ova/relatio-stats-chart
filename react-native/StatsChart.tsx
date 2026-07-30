/**
 * StatsChart — обгортка блоку статистики.
 * Figma: Stats Chart 18360:92367 (два слоти: Header + Chart, без власної осі State)
 *
 * Структура: Header → Range Switch → Period Nav → Chart. Гап між зонами space/24.
 * Картки немає — блок живе прямо на bg/default.
 *
 * Стан НЕ один на весь блок: Loading і Empty приходять окремо на верх і на
 * полотно (у Figma це два інстанси). Причина — у продукті метрика й серія точок
 * тягнуться різними запитами, і верх часто готовий раніше за графік.
 *
 * Range Switch і Period Nav лишаються активними в усіх станах: користувач може
 * перемикати період, поки дані ще їдуть.
 *
 * Сегменти й стрілки тут — заглушки на токенах. У проді підставити Button/Small
 * і Icon Button/Ghost із DS (див. docs/anatomy.md).
 */

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import StatsHeader, { HeaderState } from './StatsHeader';
import ChartPlot, { PlotState } from './ChartPlot';
import { DATA, RangeKey } from './chartGeometry';
import { OPACITY, RADIUS, SPACE, TOKENS, TYPE, ThemeName } from './tokens';

export type StatsChartProps = {
  range: RangeKey;
  onRangeChange: (r: RangeKey) => void;
  /** Підпис періоду: «Last 7 days» · «This month» · «All time» */
  periodLabel: string;
  onPrevPeriod?: () => void;
  onNextPeriod?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;

  headerState?: HeaderState;
  plotState?: PlotState;

  heroValue: string;
  insight?: { text: string; accent?: string };
  showSecondMetric?: boolean;
  secondValue?: string;

  values?: number[];
  monthShort?: string;

  showRangeSwitch?: boolean;
  showPeriodNav?: boolean;

  theme?: ThemeName;
  reduceMotion?: boolean;
  BlurComponent?: React.ComponentType<any>;
};

const SEGMENTS: { key: RangeKey; label: string }[] = [
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
  { key: 'all', label: 'All time' },
];

export default function StatsChart({
  range, onRangeChange, periodLabel, onPrevPeriod, onNextPeriod,
  canGoPrev = true, canGoNext = false,
  headerState = 'default', plotState = 'default',
  heroValue, insight, showSecondMetric = false, secondValue,
  values, monthShort, showRangeSwitch = true, showPeriodNav = true,
  theme = 'dark', reduceMotion = false, BlurComponent,
}: StatsChartProps) {
  const t = TOKENS[theme];
  const cfg = DATA[range];
  const navVisible = showPeriodNav && cfg.hasPeriodNav;

  return (
    <View style={styles.root}>
      <StatsHeader
        state={headerState}
        value={heroValue}
        insight={insight}
        showSecondMetric={showSecondMetric}
        secondValue={secondValue}
        theme={theme}
        reduceMotion={reduceMotion}
      />

      {showRangeSwitch ? (
        <View style={styles.switchRow} accessibilityRole="tablist">
          {SEGMENTS.map((s) => {
            const active = s.key === range;
            return (
              <Pressable
                key={s.key}
                onPress={() => onRangeChange(s.key)}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                style={styles.segment}
              >
                <View
                  style={[
                    StyleSheet.absoluteFill,
                    {
                      borderRadius: RADIUS.full,
                      backgroundColor: active ? t.bgInverse : t.bgSecondary,
                      opacity: active ? OPACITY.o95 : OPACITY.o60,
                    },
                  ]}
                />
                <Text style={[TYPE.segment, { color: active ? t.textInverse : t.textDefault }]}>
                  {s.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {navVisible ? (
        <View style={styles.navRow}>
          <Chevron dir="left" color={t.iconSecondary} onPress={onPrevPeriod} disabled={!canGoPrev} />
          <Text
            style={[TYPE.period, styles.period, { color: t.textSecondary }]}
            accessibilityLiveRegion="polite"
          >
            {periodLabel}
          </Text>
          <Chevron dir="right" color={t.iconSecondary} onPress={onNextPeriod} disabled={!canGoNext} />
        </View>
      ) : null}

      <ChartPlot
        range={range}
        state={plotState}
        values={values}
        monthShort={monthShort}
        theme={theme}
        reduceMotion={reduceMotion}
        BlurComponent={BlurComponent}
      />
    </View>
  );
}

/** Icon Button / Ghost, мод Sizing = Small (40). Іконка — chevron із DS. */
function Chevron({
  dir, color, onPress, disabled,
}: { dir: 'left' | 'right'; color: string; onPress?: () => void; disabled?: boolean }) {
  const d =
    'M 6.29 0.29 C 6.68 -0.1 7.32 -0.1 7.71 0.29 C 8.1 0.68 8.1 1.32 7.71 1.71 ' +
    'L 2.41 7 L 7.71 12.29 C 8.1 12.68 8.1 13.32 7.71 13.71 C 7.32 14.1 6.68 14.1 6.29 13.71 ' +
    'L 0.29 7.71 C -0.1 7.32 -0.1 6.68 0.29 6.29 L 6.29 0.29 Z';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={dir === 'left' ? 'Попередній період' : 'Наступний період'}
      style={[styles.iconBtn, disabled && { opacity: 0.28 }]}
    >
      <Svg width={24} height={24} viewBox="0 0 24 24">
        <Path
          d={d}
          fill={color}
          transform={dir === 'left' ? 'translate(8,5)' : 'translate(16,5) scale(-1,1)'}
        />
      </Svg>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { width: 408, gap: SPACE.s24 },
  switchRow: { flexDirection: 'row', gap: SPACE.s8 },
  segment: {
    height: 40,
    paddingHorizontal: SPACE.s16,
    borderRadius: RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  navRow: { height: 40, flexDirection: 'row', alignItems: 'center', gap: SPACE.s8 },
  period: { flex: 1, textAlign: 'center' },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.full },
});
