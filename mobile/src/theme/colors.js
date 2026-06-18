/**
 * src/theme/colors.js
 * Transposed color tokens and dark/light palettes from variables.css for React Native.
 */

export const colors = {
  primary: '#8b5cf6',
  primaryHover: '#7c3aed',
  primaryRGB: '139, 92, 246',
  secondary: '#ec4899',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  light: {
    bgPrimary: '#f8fafc',
    bgSecondary: '#ffffff',
    bgTertiary: '#f1f5f9',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
    borderLight: '#e2e8f0',
    glassBg: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    glassShadow: 'rgba(31, 38, 135, 0.05)'
  },
  
  dark: {
    bgPrimary: '#0f172a',
    bgSecondary: '#1e293b',
    bgTertiary: '#334155',
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textTertiary: '#64748b',
    borderLight: '#334155',
    glassBg: 'rgba(30, 41, 59, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.05)',
    glassShadow: 'rgba(0, 0, 0, 0.3)'
  }
};

export const getThemeColors = (theme = 'light') => {
  const activePalette = theme === 'dark' ? colors.dark : colors.light;
  return {
    ...colors,
    ...activePalette
  };
};

export const glassStyle = (theme = 'light') => {
  const palette = theme === 'dark' ? colors.dark : colors.light;
  return {
    backgroundColor: palette.glassBg,
    borderColor: palette.glassBorder,
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    // iOS shadow properties
    shadowColor: palette.glassShadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    // Android elevation
    elevation: 4
  };
};

export const fontSizes = {
  small: {
    xs: 10,
    sm: 12,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 22
  },
  medium: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 26
  },
  large: {
    xs: 14,
    sm: 16,
    base: 18,
    lg: 20,
    xl: 24,
    xxl: 30
  }
};

export const getFontSizes = (fontSizeSetting = 'medium') => {
  return fontSizes[fontSizeSetting] || fontSizes.medium;
};
