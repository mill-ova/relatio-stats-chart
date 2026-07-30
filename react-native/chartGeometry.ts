/**
 * Геометрія й дані Chart Plot.
 *
 * Числа не «на око»: усі витягнуті з Figma (Chart Plot 18360:88565) —
 * vectorPaths кривих переведені у відсотки за шкалою кожного періоду.
 * spline() відтворює ті самі криві побайтово: якщо підставити DATA нижче,
 * вийде рівно той d, що лежить у макеті.
 */

/* ──────────────────────────────────────────────────────────────────────────
   ПОЛОТНО (координати як у Figma, viewBox 408 × 200)
   ────────────────────────────────────────────────────────────────────────── */
export const CANVAS = {
  width: 408,          // повна ширина: 360 графік + 12 гап + 36 колонка Y-підписів
  height: 200,
  plotWidth: 360,      // крива живе в 0…360
  top: 8,              // верхня гридлайна = максимум осі
  base: 190,           // нижня гридлайна = 0 %
  gridlines: [8, 68.67, 129.33, 190],
  yLabelRight: 408,    // Y-підписи вирівняні по правому краю
  xLabelsHeight: 18,
  gapToXLabels: 8,
} as const;

export type RangeKey = 'week' | 'month' | 'all';

export type RangeConfig = {
  /** максимум осі Y у відсотках */
  max: number;
  /** підписи Y згори вниз */
  ticks: string[];
  /** підписи осі X (space-between по 360) */
  xLabels: string[];
  /** значення точок у відсотках */
  values: number[];
  /** підпис точки під пальцем — те, чого немає на осі X. Sentence case, як вісь */
  pointLabel: (i: number, monthShort?: string) => string;
  /** чи можна крокувати періодами */
  hasPeriodNav: boolean;
};

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const DATA: Record<RangeKey, RangeConfig> = {
  week: {
    max: 9,
    ticks: ['9%', '6%', '3%', '0%'],
    xLabels: WEEKDAYS,
    values: [4.4, 5.2, 4.9, 6, 6.5, 7.2, 8],
    pointLabel: (i) => WEEKDAYS[i],
    hasPeriodNav: true,
  },
  month: {
    max: 12,
    ticks: ['12%', '8%', '4%', '0%'],
    xLabels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    // 30 днів: вісь показує тижні, дані — денні
    values: [
      2.4, 4.46, 2.6, 2.92, 5.17, 3.42, 1.97, 4.33, 4.29, 2.57,
      4.91, 6.66, 4.72, 5.39, 7.48, 5.46, 4.34, 6.76, 6.36, 4.83,
      7.42, 8.82, 6.85, 7.87, 9.75, 7.51, 6.74, 9.16, 8.43, 7.13,
    ],
    pointLabel: (i, monthShort = 'Jul') => `${i + 1} ${monthShort}`,
    hasPeriodNav: true,
  },
  all: {
    max: 15,
    ticks: ['15%', '10%', '5%', '0%'],
    xLabels: ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec'],
    // 24 місяці, останній = поточний
    values: [
      0.5, 1.02, 1.18, 1.03, 1.07, 1.72, 2.85, 3.87, 4.42, 4.69, 5.24, 6.35,
      7.72, 8.76, 9.24, 9.52, 10.15, 11.23, 12.33, 12.9, 12.89, 12.77, 13.03, 13.58,
    ],
    pointLabel: (i) => {
      // 24 точки, що закінчуються поточним місяцем
      const now = new Date();
      const m = now.getFullYear() * 12 + now.getMonth() - (23 - i);
      return `${MONTHS[((m % 12) + 12) % 12]} ${String(Math.floor(m / 12)).slice(2)}`;
    },
    hasPeriodNav: false, // в All time крокувати нікуди
  },
};

/** Демо-крива порожнього стану. Геометрія однакова для всіх періодів — вона
 *  позначає місце, а не дані. Координати вже в системі полотна. */
export const EMPTY_DEMO: Point[] = [
  { x: 0, y: 168.16 }, { x: 90, y: 155.42 }, { x: 180, y: 162.7 },
  { x: 270, y: 146.32 }, { x: 360, y: 139.04 },
];

export type Point = { x: number; y: number };

/** Значення у відсотках → точки полотна. */
export function toPoints(values: number[], max: number): Point[] {
  const step = CANVAS.plotWidth / (values.length - 1);
  const h = CANVAS.base - CANVAS.top;
  return values.map((v, i) => ({ x: i * step, y: CANVAS.base - (v / max) * h }));
}

/**
 * Крива через точки — Catmull-Rom із плечима 1/6 на кінцях і 1/3 у середині.
 * Саме ця формула дала vectorPaths у Figma; змінювати плечі не варто —
 * крива поїде відносно макета.
 */
export function spline(pts: Point[]): string {
  const n = pts.length;
  if (n < 2) return '';
  const m = pts.map((_, i) => {
    if (i === 0) return (pts[1].y - pts[0].y) / (pts[1].x - pts[0].x);
    if (i === n - 1) return (pts[n - 1].y - pts[n - 2].y) / (pts[n - 1].x - pts[n - 2].x);
    return (pts[i + 1].y - pts[i - 1].y) / (pts[i + 1].x - pts[i - 1].x);
  });
  const r = (v: number) => Math.round(v * 100) / 100;
  let d = `M ${r(pts[0].x)} ${r(pts[0].y)}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i], p1 = pts[i + 1], dx = p1.x - p0.x;
    const a1 = i === 0 ? dx / 6 : dx / 3;
    const a2 = i === n - 2 ? dx / 6 : dx / 3;
    d += ` C ${r(p0.x + a1)} ${r(p0.y + m[i] * a1)} ${r(p1.x - a2)} ${r(p1.y - m[i + 1] * a2)} ${r(p1.x)} ${r(p1.y)}`;
  }
  return d;
}

/** Area = та сама крива, замкнена на бейзлайн. */
export function areaPath(lineD: string): string {
  return `${lineD} L ${CANVAS.plotWidth} ${CANVAS.base} L 0 ${CANVAS.base} Z`;
}

/** Верхня точка кривої — від неї починається градієнт area (як у Figma). */
export function minY(pts: Point[]): number {
  return Math.min(...pts.map((p) => p.y));
}

/** Найближча до пальця точка. x — у координатах полотна (0…408). */
export function nearestIndex(x: number, count: number): number {
  const step = CANVAS.plotWidth / (count - 1);
  return Math.max(0, Math.min(count - 1, Math.round(x / step)));
}
