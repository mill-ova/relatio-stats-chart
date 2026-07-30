/**
 * ChartPlot — полотно графіка.
 * Figma: Chart Plot 18360:88565 — Range (Week · Month · All time) × State (Default · Loading · Empty)
 *        + boolean Show pointer
 *
 * Що тут важливо не «оптимізувати»:
 * 1. Крива — сплайн із chartGeometry.spline(). Плечі 1/6 на кінцях і 1/3 у
 *    середині дають ту саму геометрію, що в макеті. Інша інтерполяція = інша крива.
 * 2. Area не тримає прозорість руками: це градієнт із ДВОХ семантичних токенів
 *    (bg/brand-subtle → bg/default) на opacity/40. Другий стоп дорівнює фону
 *    екрана, тому фейд виглядає як зникнення, лишаючись на токенах.
 * 3. Глоу — це дубль лінії під нею, а не тінь. Власних тіней у компоненті немає.
 * 4. Крапок на точках немає. Крапка зʼявляється тільки під пальцем.
 */

import React, { useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent } from 'react-native';
import Svg, {
  Defs, LinearGradient, Stop, Path, Line, Circle, Text as SvgText, Filter, FeGaussianBlur, G,
} from 'react-native-svg';
import {
  CANVAS, DATA, EMPTY_DEMO, RangeKey, areaPath, minY, nearestIndex, spline, toPoints,
} from './chartGeometry';
import { BORDER_WIDTH, OPACITY, SPACE, TOKENS, TYPE, ThemeName } from './tokens';
import Pill from './Pill';
import SkeletonBone from './SkeletonBone';

export type PlotState = 'default' | 'loading' | 'empty';

export type ChartPlotProps = {
  range: RangeKey;
  state?: PlotState;
  /** Значення періоду. Якщо не передати — беруться демо-дані з макета. */
  values?: number[];
  /** Скорочення місяця для підписів точок у Month («Jul») */
  monthShort?: string;
  theme?: ThemeName;
  /** Скраб. false — полотно не реагує на дотик (Loading / Empty вимикають самі) */
  scrubEnabled?: boolean;
  onScrub?: (index: number | null) => void;
  BlurComponent?: React.ComponentType<any>;
  reduceMotion?: boolean;
};

export default function ChartPlot({
  range, state = 'default', values, monthShort, theme = 'dark',
  scrubEnabled = true, onScrub, BlurComponent, reduceMotion = false,
}: ChartPlotProps) {
  const t = TOKENS[theme];
  const cfg = DATA[range];
  const vals = values ?? cfg.values;

  const [scrubIndex, setScrubIndex] = useState<number | null>(null);
  const [boxWidth, setBoxWidth] = useState<number>(CANVAS.width);
  const scale = boxWidth / CANVAS.width;          // px екрана на одиницю viewBox

  const pts = useMemo(() => toPoints(vals, cfg.max), [vals, cfg.max]);
  const lineD = useMemo(() => spline(pts), [pts]);
  const areaD = useMemo(() => areaPath(lineD), [lineD]);
  const demoD = useMemo(() => spline(EMPTY_DEMO), []);
  const gradTop = useMemo(() => minY(pts), [pts]);

  const canScrub = scrubEnabled && state === 'default';

  const setIndex = useCallback((i: number | null) => {
    setScrubIndex(i);
    onScrub?.(i);
  }, [onScrub]);

  /* Скраб на PanResponder — без зовнішніх залежностей. Якщо потрібні 60 fps на
     30 точках, переносити на react-native-gesture-handler + Reanimated. */
  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => canScrub,
      onMoveShouldSetPanResponder: () => canScrub,
      onPanResponderGrant: (e) => {
        const x = e.nativeEvent.locationX / (boxWidth / CANVAS.width);
        setIndex(nearestIndex(x, vals.length));
      },
      onPanResponderMove: (e) => {
        const x = e.nativeEvent.locationX / (boxWidth / CANVAS.width);
        setIndex(nearestIndex(x, vals.length));
      },
      onPanResponderRelease: () => setIndex(null),
      onPanResponderTerminate: () => setIndex(null),
    }),
  ).current;

  const onLayout = (e: LayoutChangeEvent) => setBoxWidth(e.nativeEvent.layout.width);

  /* ── Loading: кістки замість полотна й підписів ── */
  if (state === 'loading') {
    return (
      <View accessibilityLabel="Графік завантажується" accessible accessibilityState={{ busy: true }}>
        <View style={{ height: CANVAS.height }}>
          <View style={{ position: 'absolute', left: 0, top: 40 }}>
            <SkeletonBone width={CANVAS.plotWidth} height={150} radius={8} theme={theme} animate={!reduceMotion} />
          </View>
          {CANVAS.gridlines.map((y, i) => (
            <View key={i} style={{ position: 'absolute', left: 380, top: y - 5 }}>
              <SkeletonBone width={28} height={10} radius={4} theme={theme} animate={!reduceMotion} />
            </View>
          ))}
        </View>
        <View style={styles.xRow}>
          {cfg.xLabels.map((_, i) => (
            <SkeletonBone key={i} width={34} height={10} radius={4} theme={theme} animate={!reduceMotion} />
          ))}
        </View>
      </View>
    );
  }

  const isEmpty = state === 'empty';
  const p = scrubIndex != null ? pts[scrubIndex] : null;

  return (
    <View>
      <View onLayout={onLayout} {...(canScrub ? pan.panHandlers : {})} style={{ height: CANVAS.height }}>
        <Svg width="100%" height={CANVAS.height} viewBox={`0 0 ${CANVAS.width} ${CANVAS.height}`}>
          <Defs>
            {/* Area: bg/brand-subtle → bg/default, від вершини кривої до бейзлайну */}
            <LinearGradient id="area" x1="0" y1={gradTop} x2="0" y2={CANVAS.base} gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={t.bgBrandSubtle} />
              <Stop offset="1" stopColor={t.bgDefault} />
            </LinearGradient>
            {/* Лінія: brand/from → brand/to, горизонтально по всій ширині графіка */}
            <LinearGradient id="line" x1="0" y1="0" x2={CANVAS.plotWidth} y2="0" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={t.brandFrom} />
              <Stop offset="1" stopColor={t.brandTo} />
            </LinearGradient>
            {/* Глоу. Якщо на Android фільтр важкий — замінити на 2–3 стеки строуків
                зростаючої товщини з малою прозорістю (див. docs/data-and-geometry.md) */}
            <Filter id="glow" x="-20%" y="-50%" width="140%" height="200%">
              <FeGaussianBlur stdDeviation="5" />
            </Filter>
          </Defs>

          {/* Гридлайни */}
          {CANVAS.gridlines.map((y, i) => (
            <Line key={i} x1={0} x2={CANVAS.plotWidth} y1={y} y2={y}
                  stroke={t.borderDivider} strokeWidth={BORDER_WIDTH.w1} />
          ))}

          {isEmpty ? (
            <>
              {/* Демо-крива: позначає місце, не дані. Без area й без глоу */}
              <Path d={demoD} fill="none" stroke={t.borderStrong}
                    strokeWidth={BORDER_WIDTH.w2} strokeLinecap="round" />
              <SvgText x={CANVAS.plotWidth / 2} y={55} textAnchor="middle"
                       fill={t.textTertiary} fontSize={TYPE.axis.fontSize}
                       fontFamily={TYPE.axis.fontFamily}>
                Your line starts here
              </SvgText>
            </>
          ) : (
            <>
              <Path d={areaD} fill="url(#area)" fillOpacity={OPACITY.o40} />
              <G opacity={OPACITY.o80}>
                <Path d={lineD} fill="none" stroke="url(#line)" strokeWidth={BORDER_WIDTH.w3}
                      strokeLinecap="round" filter="url(#glow)" />
              </G>
              <Path d={lineD} fill="none" stroke="url(#line)" strokeWidth={BORDER_WIDTH.w2}
                    strokeLinecap="round" />
            </>
          )}

          {/* Поінтер */}
          {p ? (
            <>
              <Line x1={p.x} x2={p.x} y1={CANVAS.top} y2={CANVAS.base}
                    stroke={t.borderStrong} strokeWidth={BORDER_WIDTH.w1} />
              <Circle cx={p.x} cy={p.y} r={9} fill="url(#line)" opacity={OPACITY.o40} filter="url(#glow)" />
              <Circle cx={p.x} cy={p.y} r={4.5} fill="url(#line)" />
            </>
          ) : null}

          {/* Підписи Y */}
          {cfg.ticks.map((label, i) => (
            <SvgText key={label + i} x={CANVAS.yLabelRight} y={CANVAS.gridlines[i] + 4} textAnchor="end"
                     fill={t.textTertiary} fontSize={TYPE.axis.fontSize} fontFamily={TYPE.axis.fontFamily}>
              {label}
            </SvgText>
          ))}
        </Svg>

        {/* Піл — поверх SVG, бо йому потрібне справжнє скло й авто-ширина */}
        {p ? (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              left: p.x * scale,
              top: p.y * scale - 8,
              transform: [{ translateX: -40 }, { translateY: -22 }],
            }}
          >
            <Pill
              label={cfg.pointLabel(scrubIndex!, monthShort)}
              value={`${vals[scrubIndex!].toFixed(1)}%`}
              theme={theme}
              BlurComponent={BlurComponent}
            />
          </View>
        ) : null}
      </View>

      {/* Підписи X */}
      <View style={styles.xRow}>
        {cfg.xLabels.map((label) => (
          <Text key={label} style={[TYPE.axis, { color: t.textTertiary }]}>{label}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  xRow: {
    width: CANVAS.plotWidth,
    height: CANVAS.xLabelsHeight,
    marginTop: SPACE.s8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
