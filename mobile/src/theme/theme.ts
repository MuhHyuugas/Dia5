// ===================================================================
// Dia 5 - Design System: Tokens de Cor (Light & Dark Mode)
// ===================================================================

export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceElevated: string;

  // Borders
  border: string;
  borderStrong: string;

  // Brand
  primary: string;
  primaryDark: string;
  primaryBg: string;

  // Semantic
  secondary: string;
  secondaryBg: string;
  danger: string;
  dangerBg: string;

  // Text
  textPrimary: string;
  textMuted: string;
  textInverse: string;

  // Tab bar
  tabBarBg: string;
  tabBarBorder: string;
  tabActive: string;
  tabInactive: string;
}

export const darkColors: ThemeColors = {
  background: '#0b1326',
  surface: '#171f33',
  surfaceElevated: '#1e2740',

  border: '#2d3449',
  borderStrong: '#3d4a6a',

  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  primaryBg: 'rgba(124, 58, 237, 0.15)',

  secondary: '#10b981',
  secondaryBg: 'rgba(16, 185, 129, 0.15)',
  danger: '#ef4444',
  dangerBg: 'rgba(239, 68, 68, 0.15)',

  textPrimary: '#dae2fd',
  textMuted: '#94a3b8',
  textInverse: '#ffffff',

  tabBarBg: '#0b1326',
  tabBarBorder: '#171f33',
  tabActive: '#7c3aed',
  tabInactive: '#64748b',
};

export const lightColors: ThemeColors = {
  background: '#f8fafc',
  surface: '#ffffff',
  surfaceElevated: '#f1f5f9',

  border: '#e2e8f0',
  borderStrong: '#cbd5e1',

  primary: '#7c3aed',
  primaryDark: '#6d28d9',
  primaryBg: 'rgba(124, 58, 237, 0.1)',

  secondary: '#059669',
  secondaryBg: 'rgba(5, 150, 105, 0.1)',
  danger: '#dc2626',
  dangerBg: 'rgba(220, 38, 38, 0.1)',

  textPrimary: '#0f172a',
  textMuted: '#64748b',
  textInverse: '#ffffff',

  tabBarBg: '#ffffff',
  tabBarBorder: '#e2e8f0',
  tabActive: '#7c3aed',
  tabInactive: '#94a3b8',
};
