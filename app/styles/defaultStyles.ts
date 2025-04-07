// app/styles/defaultStyles.js
import { StyleSheet } from 'react-native';

// COLOR SCHEME OPTIONS
// You can choose one of these color schemes for your app

// Option 1: Deep Literary - Rich bookish feel (updated)
export const deepLiterary = {
  primary: '#4A5568', // Slate gray
  secondary: '#805AD5', // Purple
  accent: '#D69E2E', // Gold
  background: '#FFFFFF', // White background (updated from #F7FAFC)
  card: '#F7FAFC', // Light gray for cards (updated from #FFFFFF)
  text: '#1A202C', // Dark gray
  textSecondary: '#718096', // Medium gray
  border: '#E2E8F0', // Light border
  success: '#48BB78', // Green
  warning: '#ED8936', // Orange
  error: '#F56565', // Red
  info: '#4299E1', // Blue
};

// Option 2: Minimal Zen - Clean reading experience (updated)
export const minimalZen = {
  primary: '#2D3748', // Dark blue-gray
  secondary: '#38B2AC', // Teal
  accent: '#F6AD55', // Soft orange
  background: '#FFFFFF', // Pure white background (updated from #F7FAFC)
  card: '#F7FAFC', // Light gray for cards (updated from #FFFFFF)
  text: '#1A202C', // Near black
  textSecondary: '#718096', // Gray
  border: '#E2E8F0', // Light border
  success: '#68D391', // Green
  warning: '#F6E05E', // Yellow
  error: '#FC8181', // Red
  info: '#63B3ED', // Blue
};

// Option 3: Vintage Library - Classic book aesthetics (updated)
export const vintageLibrary = {
  primary: '#5F4B32', // Walnut brown
  secondary: '#7D5A50', // Leather brown
  accent: '#B7791F', // Brass gold
  background: '#FEF9EE', // Lighter aged paper (updated from #FAF3E0)
  card: '#FFFFFF', // White background for cards (updated from #FFF8E5)
  text: '#2D2214', // Darker brown for better contrast (updated from #433422)
  textSecondary: '#5A4D3F', // Slightly darker medium brown (updated from #6B5B4D)
  border: '#E2D6C1', // Beige
  success: '#68A357', // Muted green
  warning: '#CA8A31', // Amber
  error: '#C53030', // Brick red
  info: '#4C7A9D', // Dusty blue
};

// Option 4: Night Reader - Dark mode (updated)
export const nightReader = {
  primary: '#805AD5', // Changed from dark gray to purple for better visibility
  secondary: '#63B3ED', // Changed to a brighter blue
  accent: '#F6AD55', // Soft orange (kept the same)
  background: '#121720', // Very dark background
  card: '#2D3748', // Dark blue-gray
  text: '#FFFFFF', // Pure white for main text
  textSecondary: '#E2E8F0', // Very light gray for secondary text
  border: '#4A5568', // Medium gray
  success: '#68D391', // Brighter green for visibility
  warning: '#F6E05E', // Brighter yellow for visibility
  error: '#FC8181', // Brighter red for visibility
  info: '#63B3ED', // Brighter blue for visibility
};

// CHOOSE YOUR ACTIVE COLOR SCHEME HERE
// Change this line to use a different color scheme
export const colors = minimalZen;

// Common spacing units
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Font sizes
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
};

// Border radius
export const radius = {
  xs: 2,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  round: 9999,
};

// Shadow styles
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

// Create base styles using the chosen color scheme
export const baseStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  h1: {
    fontSize: fontSize.xxxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  h2: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  h3: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  h4: {
    fontSize: fontSize.lg,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  text: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  textSecondary: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  textSmall: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  secondaryButton: {
    backgroundColor: colors.secondary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: fontSize.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    backgroundColor: colors.card,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: 'bold',
  },
});

// Chart configuration - moved outside StyleSheet.create() to fix the error
// In app/styles/defaultStyles.js
// Replace the color function in the chartConfig with this safer version

export const chartConfig = {
  backgroundColor: colors.card,
  backgroundGradientFrom: colors.card,
  backgroundGradientTo: colors.card,
  decimalPlaces: 0,
  color: (opacity = 1) => {
    // Safely convert hex color to RGB format
    try {
      const hexMatch = colors.primary.replace('#', '').match(/.{1,2}/g);
      if (hexMatch) {
        return `rgba(${hexMatch.map(hex => parseInt(hex, 16)).join(',')}, ${opacity})`;
      }
      // Fallback if match returns null
      return `rgba(45, 55, 72, ${opacity})`;
    } catch (e) {
      // Fallback in case of any parsing errors
      return `rgba(45, 55, 72, ${opacity})`;
    }
  },
  labelColor: (opacity = 1) => colors.text,
  style: {
    borderRadius: radius.md,
  },
  propsForDots: {
    r: '6',
    strokeWidth: '2',
    stroke: colors.secondary,
  },
};

export default {
  colors,
  spacing,
  fontSize,
  radius,
  shadows,
  baseStyles,
  chartConfig, // Added chartConfig to the exports
};