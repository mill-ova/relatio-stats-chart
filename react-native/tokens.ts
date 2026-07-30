/**
 * Токени Stats Chart — резолвнуті значення з Figma (Relatio - App).
 *
 * УВАГА: у проді читати з теми DS, а не з цього файла. Hex тут — для звірки
 * й для того, щоб компонент можна було запустити ізольовано.
 *
 * Колекції: Color/Semantic (моди Light / Dark), Gradient (Light / Dark),
 * Spacing, Radius, Opacity, Border Width, Typography/Semantic.
 */

export type ThemeName = 'light' | 'dark';

export const TOKENS = {
  dark: {
    bgDefault: '#0c0d11',        // bg/default — фон екрана і другий стоп area
    bgSecondary: '#2e2e36',      // bg/secondary — tint невибраних сегментів
    bgInverse: '#f9fafd',        // bg/inverse — tint вибраного сегмента і піла
    bgBrandSubtle: '#393292',    // bg/brand-subtle — верхній стоп area
    bgBrandDisabled: '#6a6b74',  // bg/brand-disabled — база кістки скелетона
    textDefault: '#f9fafd',      // text/default — інсайт, друга метрика
    textSecondary: '#c2c3cb',    // text/secondary — підпис періоду
    textTertiary: '#999aa3',     // text/tertiary — лейбли метрик, підписи осей
    textInverse: '#0c0d11',      // text/inverse — текст на пілі й вибраному сегменті
    borderDivider: '#373740',    // border/divider — гридлайни
    borderStrong: '#4f5059',     // border/strong — вертикаль поінтера, демо-крива Empty
    iconDefault: '#f9fafd',      // icon/default
    iconSecondary: '#c2c3cb',    // icon/secondary — стрілки крокера
    brandFrom: '#569cf8',        // Gradient brand/from
    brandTo: '#6d69e6',          // Gradient brand/to
  },
  light: {
    bgDefault: '#f9fafd',
    bgSecondary: '#ffffff',
    bgInverse: '#0c0d11',
    bgBrandSubtle: '#ebedff',
    bgBrandDisabled: '#f1f2f7',
    textDefault: '#0c0d11',
    textSecondary: '#4f5059',
    textTertiary: '#84858e',
    textInverse: '#ffffff',
    borderDivider: '#f1f2f7',
    borderStrong: '#dddee4',
    iconDefault: '#0c0d11',
    iconSecondary: '#4f5059',
    brandFrom: '#569cf8',
    brandTo: '#5a4fd6',
  },
} as const;

/** Spacing. space/20 виведено з обігу — драбина 8 / 16 / 24. */
export const SPACE = { s2: 2, s4: 4, s8: 8, s12: 12, s16: 16, s24: 24, s32: 32 } as const;

/** Opacity — з колекції, ніяких «на око». */
export const OPACITY = {
  o40: 0.4,   // area під кривою; база кістки скелетона; глоу точки поінтера
  o60: 0.6,   // tint невибраних сегментів
  o80: 0.8,   // глоу під лінією
  o90: 0.9,   // tint піла
  o95: 0.95,  // tint вибраного сегмента
} as const;

export const RADIUS = { r8: 8, r12: 12, r24: 24, full: 999 } as const;

export const BORDER_WIDTH = { w1: 1, w2: 2, w3: 3 } as const;

/**
 * Типографіка — стилі з Typography/Semantic. Родина одна: Poppins.
 * Gilroy на цьому екрані не використовується.
 */
export const TYPE = {
  /** Display/Medium/Medium — hero-цифра */
  hero: { fontFamily: 'Poppins-Medium', fontSize: 40, lineHeight: 48 },
  /** Heading/Large — друга метрика */
  secondValue: { fontFamily: 'Poppins-Medium', fontSize: 24, lineHeight: 32 },
  /** Body/Medium/Regular — речення-інсайт */
  insight: { fontFamily: 'Poppins-Regular', fontSize: 14, lineHeight: 21 },
  /** Body/Medium/Semibold — акцент усередині інсайту (кількість вправ) */
  insightAccent: { fontFamily: 'Poppins-SemiBold', fontSize: 14, lineHeight: 21 },
  /** Body/Medium/Medium — підпис періоду в крокері */
  period: { fontFamily: 'Poppins-Medium', fontSize: 14, lineHeight: 21 },
  /** Body/Small/Medium — капс-лейбли метрик, лейбли сегментів */
  label: { fontFamily: 'Poppins-Medium', fontSize: 12, lineHeight: 18 },
  /** Body/Small/Regular — підписи осей, Label у пілі */
  axis: { fontFamily: 'Poppins-Regular', fontSize: 12, lineHeight: 18 },
  /** Body/Large/Medium — лейбл сегмента Range Switch */
  segment: { fontFamily: 'Poppins-Medium', fontSize: 16, lineHeight: 24 },
} as const;

export const useTokens = (theme: ThemeName) => TOKENS[theme];
