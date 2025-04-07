// app/context/ThemeContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  deepLiterary, 
  minimalZen, 
  vintageLibrary, 
  nightReader,
  spacing,
  fontSize,
  radius,
  shadows,
  baseStyles,
  chartConfig
} from './defaultStyles';

// Theme options and their corresponding color schemes
const themes = {
  minimal: minimalZen,
  literary: deepLiterary,
  vintage: vintageLibrary,
  night: nightReader,
};

type ThemeOption = 'minimal' | 'literary' | 'vintage' | 'night';
type ThemeContextType = {
  activeTheme: ThemeOption;
  colors: typeof minimalZen;
  spacing: typeof spacing;
  fontSize: typeof fontSize;
  radius: typeof radius;
  shadows: typeof shadows;
  baseStyles: typeof baseStyles;
  chartConfig: typeof chartConfig;
  setTheme: (theme: ThemeOption) => Promise<void>;
};

// Create context with default value
const ThemeContext = createContext<ThemeContextType>({
  activeTheme: 'minimal',
  colors: minimalZen,
  spacing,
  fontSize,
  radius,
  shadows,
  baseStyles,
  chartConfig,
  setTheme: async () => {},
});

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('minimal');
  const [colors, setColors] = useState(minimalZen);
  
  // Load saved theme on initial render
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme') as ThemeOption | null;
        if (savedTheme && themes[savedTheme]) {
          setActiveTheme(savedTheme);
          setColors(themes[savedTheme]);
        }
      } catch (error) {
        console.error('Failed to load theme:', error);
      }
    };
    
    loadTheme();
  }, []);

  // Function to set and save theme
  const setTheme = async (theme: ThemeOption) => {
    try {
      await AsyncStorage.setItem('userTheme', theme);
      setActiveTheme(theme);
      setColors(themes[theme]);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  // Create a modified version of baseStyles and chartConfig that uses the current colors
  const modifiedBaseStyles = {
    ...baseStyles,
    // Override specific styles that need the current theme colors
    container: {
      ...baseStyles.container,
      backgroundColor: colors.background,
    },
    card: {
      ...baseStyles.card,
      backgroundColor: colors.card,
    },
    text: {
      ...baseStyles.text,
      color: colors.text,
    },
    h1: {
      ...baseStyles.h1,
      color: colors.text,
    },
    h2: {
      ...baseStyles.h2,
      color: colors.text,
    },
    h3: {
      ...baseStyles.h3,
      color: colors.text,
    },
    h4: {
      ...baseStyles.h4,
      color: colors.text,
    },
    textSecondary: {
      ...baseStyles.textSecondary,
      color: colors.textSecondary,
    },
    button: {
      ...baseStyles.button,
      backgroundColor: colors.primary,
    },
    secondaryButton: {
      ...baseStyles.secondaryButton,
      backgroundColor: colors.secondary,
    },
    outlineButton: {
      ...baseStyles.outlineButton,
      borderColor: colors.primary,
    },
    outlineButtonText: {
      ...baseStyles.outlineButtonText,
      color: colors.primary,
    },
    input: {
      ...baseStyles.input,
      borderColor: colors.border,
      color: colors.text,
      backgroundColor: colors.card,
    },
    divider: {
      ...baseStyles.divider,
      backgroundColor: colors.border,
    },
  };

  // Create a modified version of chartConfig
  const modifiedChartConfig = {
    ...chartConfig,
    backgroundColor: colors.card,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => {
      try {
        const hexMatch = colors.primary.replace('#', '').match(/.{1,2}/g);
        if (hexMatch) {
          return `rgba(${hexMatch.map(hex => parseInt(hex, 16)).join(',')}, ${opacity})`;
        }
        return `rgba(45, 55, 72, ${opacity})`;
      } catch (e) {
        return `rgba(45, 55, 72, ${opacity})`;
      }
    },
    labelColor: (opacity = 1) => colors.text,
    propsForDots: {
      ...chartConfig.propsForDots,
      stroke: colors.secondary,
    },
  };

  return (
    <ThemeContext.Provider 
      value={{ 
        activeTheme, 
        colors, 
        spacing, 
        fontSize, 
        radius, 
        shadows, 
        baseStyles: modifiedBaseStyles,
        chartConfig: modifiedChartConfig,
        setTheme 
      }}>
      {children}
    </ThemeContext.Provider>
  );
};