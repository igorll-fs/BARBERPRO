/* ============================
   BARBERPRO PWA — Design Tokens
   Mesmos tokens do mobile, adaptados para CSS
   ============================ */

// ─── Cores ──────────────────────────────────────────────
export const colors = {
  bg: '#0A0E1A',
  bgSecondary: '#131825',
  bgTertiary: '#1A202E',

  card: '#1C2333',
  cardElevated: '#232B3F',
  cardBorder: 'rgba(255, 255, 255, 0.08)',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',

  primary: '#10B981',
  primaryDark: '#059669',
  primaryLight: '#34D399',
  primaryBg: 'rgba(16, 185, 129, 0.15)',

  secondary: '#3B82F6',

  danger: '#F43F5E',
  dangerBg: 'rgba(244, 63, 94, 0.15)',
  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.15)',
  info: '#06B6D4',
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.15)',

  gold: '#F59E0B',
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  overlay: 'rgba(10, 14, 26, 0.85)',
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ─── Espaçamentos (px) ─────────────────────────────────
export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 40,
} as const;

// ─── Tipografia (px) ────────────────────────────────────
export const fontSize = {
  xs: 11, sm: 13, md: 15, lg: 17, xl: 20, xxl: 24, xxxl: 32, display: 40,
} as const;

// ─── Border Radius (px) ─────────────────────────────────
export const radius = {
  xs: 8, sm: 12, md: 16, lg: 20, xl: 28, full: 9999,
} as const;
