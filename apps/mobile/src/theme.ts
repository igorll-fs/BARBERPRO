/* ============================
   BARBERPRO — Modern Design System
   Inspirado em: Nubank, Booksy, Airbnb
   ============================ */
import { StyleSheet } from 'react-native';

// ─── Cores Modernas (2026) ──────────────────────────────
export const colors = {
  // Base — Dark suave (não preto puro)
  bg: '#0A0E1A',
  bgSecondary: '#131825',
  bgTertiary: '#1A202E',
  
  // Cards — Glassmorphism + Elevação
  card: '#1C2333',
  cardElevated: '#232B3F',
  cardGlass: 'rgba(28, 35, 51, 0.8)',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  
  // Texto — Contraste otimizado
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textDisabled: '#475569',
  textInverse: '#0A0E1A',
  
  // Primary — Verde vibrante + gradientes
  primary: '#10B981',          // Emerald 500
  primaryDark: '#059669',      // Emerald 600
  primaryLight: '#34D399',     // Emerald 400
  primaryGradient: ['#10B981', '#059669'],
  primaryBg: 'rgba(16, 185, 129, 0.15)',
  primaryGlow: 'rgba(16, 185, 129, 0.4)',
  
  // Secondary — Azul accent
  secondary: '#3B82F6',
  secondaryDark: '#2563EB',
  secondaryLight: '#60A5FA',
  secondaryGradient: ['#3B82F6', '#2563EB'],
  
  // Status — Vibrantes em dark
  danger: '#F43F5E',
  dangerBg: 'rgba(244, 63, 94, 0.15)',
  dangerGlow: 'rgba(244, 63, 94, 0.3)',
  
  warning: '#FBBF24',
  warningBg: 'rgba(251, 191, 36, 0.15)',
  
  info: '#06B6D4',
  infoBg: 'rgba(6, 182, 212, 0.15)',
  
  success: '#10B981',
  successBg: 'rgba(16, 185, 129, 0.15)',
  
  // Premium — Gold/VIP
  gold: '#F59E0B',
  goldGradient: ['#F59E0B', '#D97706'],
  
  // Outros
  border: 'rgba(255, 255, 255, 0.1)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  overlay: 'rgba(10, 14, 26, 0.85)',
  backdrop: 'rgba(0, 0, 0, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
};

// ─── Espaçamentos Generosos ─────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,      // Aumentado de 20
  xxl: 32,     // Aumentado de 24
  xxxl: 40,    // Aumentado de 32
  huge: 56,    // Novo
} as const;

// ─── Tipografia Moderna ─────────────────────────────────
export const fontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,      // Aumentado
  xxl: 24,     // Aumentado
  xxxl: 32,    // Aumentado
  display: 40, // Novo
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ─── Border Radius Modernos ─────────────────────────────
export const radius = {
  xs: 8,
  sm: 12,
  md: 16,      // Aumentado de 10
  lg: 20,      // Aumentado de 14
  xl: 28,      // Aumentado de 20
  xxl: 36,     // Novo
  full: 9999,
} as const;

// ─── Sombras Coloridas ──────────────────────────────────
export const shadows = {
  // Sombras com cor (não só preto)
  sm: { 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 4, 
    elevation: 3 
  },
  md: { 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.15, 
    shadowRadius: 8, 
    elevation: 6 
  },
  lg: { 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 8 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 16, 
    elevation: 10 
  },
  // Sombras neutras
  dark: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;

// ─── Estilos Globais Modernos ───────────────────────────
export const globalStyles = StyleSheet.create({
  // Containers
  screen: { 
    flex: 1, 
    backgroundColor: colors.bg 
  },
  screenPadded: { 
    flex: 1, 
    backgroundColor: colors.bg, 
    padding: spacing.xl  // 24px agora
  },
  center: { 
    flex: 1, 
    alignItems: 'center' as const, 
    justifyContent: 'center' as const 
  },

  // Cards — Glassmorphism style
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,        // 20px
    padding: spacing.xl,            // 24px
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },
  
  cardElevated: {
    backgroundColor: colors.cardElevated,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.md,
  },
  
  cardGlass: {
    backgroundColor: colors.cardGlass,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.sm,
  },

  // Textos — Hierarquia clara
  display: { 
    fontSize: fontSize.display, 
    fontWeight: fontWeight.extrabold, 
    color: colors.text,
    letterSpacing: -0.5,
  },
  title: { 
    fontSize: fontSize.xxxl, 
    fontWeight: fontWeight.bold, 
    color: colors.text,
    letterSpacing: -0.3,
  },
  subtitle: { 
    fontSize: fontSize.xl, 
    fontWeight: fontWeight.semibold, 
    color: colors.text 
  },
  heading: { 
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.semibold, 
    color: colors.text 
  },
  body: { 
    fontSize: fontSize.md, 
    fontWeight: fontWeight.regular, 
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bodyLarge: { 
    fontSize: fontSize.lg, 
    fontWeight: fontWeight.regular, 
    color: colors.textSecondary,
    lineHeight: 26,
  },
  caption: { 
    fontSize: fontSize.sm, 
    fontWeight: fontWeight.regular, 
    color: colors.textMuted 
  },
  label: { 
    fontSize: fontSize.sm, 
    fontWeight: fontWeight.medium, 
    color: colors.text,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
  },

  // Inputs — Bordas arredondadas
  input: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,        // 16px
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fontSize.md,
  },
  
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.bgTertiary,
  },

  // Linha separadora
  divider: { 
    height: 1, 
    backgroundColor: colors.border, 
    marginVertical: spacing.xl 
  },

  // Layout helpers
  row: { 
    flexDirection: 'row' as const, 
    alignItems: 'center' as const,
    gap: spacing.md,
  },
  rowBetween: { 
    flexDirection: 'row' as const, 
    alignItems: 'center' as const, 
    justifyContent: 'space-between' as const,
    gap: spacing.md,
  },
  
  // Badge moderno
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start' as const,
  },
  
  // FAB (Floating Action Button)
  fab: {
    position: 'absolute' as const,
    bottom: spacing.xxl,
    right: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    ...shadows.lg,
  },
});
