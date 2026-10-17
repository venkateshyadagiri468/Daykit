// Calm, modern, warm palette: cream background, deep green primary, warm accent.

export const palette = {
  // Surfaces
  background: '#FBF7F1',
  surface: '#FFFFFF',
  surfaceAlt: '#F3EFE7',

  // Text
  textPrimary: '#1F2A24',
  textSecondary: '#5C6B63',
  textTertiary: '#8A9790',

  // Primary (deep green)
  primary: '#2F5D4F',
  primaryDark: '#24483E',
  primarySoft: '#E3EBE7',

  // Accent (warm amber)
  accent: '#C78B4A',
  accentSoft: '#F3E4D2',

  // Status
  success: '#4A7C68',
  danger: '#B05A4A',

  // Lines
  border: '#E5DFD5',
  borderStrong: '#D4CCC0',

  // Overlays
  overlay: 'rgba(31, 42, 36, 0.06)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
};

export const typography = {
  display: { fontSize: 30, fontWeight: '700', lineHeight: 38, color: palette.textPrimary },
  title: { fontSize: 22, fontWeight: '700', lineHeight: 28, color: palette.textPrimary },
  heading: { fontSize: 18, fontWeight: '600', lineHeight: 24, color: palette.textPrimary },
  body: { fontSize: 16, lineHeight: 24, color: palette.textPrimary },
  bodySm: { fontSize: 14, lineHeight: 20, color: palette.textSecondary },
  caption: { fontSize: 12, lineHeight: 16, color: palette.textTertiary },
  button: { fontSize: 16, fontWeight: '600', lineHeight: 22 },
};