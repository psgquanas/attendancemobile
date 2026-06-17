

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Base (kept from your original)
    text: '#000000',
    background: '#F7F7F3',       // maps to --background (warm off-white)
    backgroundElement: '#FFFFFF', // maps to --card (pure white surface)
    backgroundSelected: '#EEEEF0',// maps to --muted
    textSecondary: '#60646C',

    // Brand
    primary: '#5B48C2',           // --primary (purple)
    primaryForeground: '#FFFFFF',
    primaryMuted: '#EAE8F9',      // light purple tint for chips/badges

    secondary: '#3DB89A',         // --secondary (teal)
    secondaryForeground: '#FFFFFF',

    accent: '#D4900A',            // --accent (amber)
    accentForeground: '#000000',

    // Semantic
    destructive: '#D94F28',       // --destructive
    destructiveForeground: '#FFFFFF',

    muted: '#F5F5F5',
    mutedForeground: '#525252',

    // UI chrome
    border: '#000000',            // --border
    input: '#8E8E8E',             // --input
    ring: '#9DB5E8',              // --ring (focus)

    // Chart / data viz (optional)
    chart1: '#5B48C2',
    chart2: '#3DB89A',
    chart3: '#D4900A',
    chart4: '#C4455E',
    chart5: '#4DA86B',
  },

  dark: {
    // Base (kept from your original)
    text: '#FFFFFF',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',

    // Brand
    primary: '#8B78E6',           // --primary dark (lighter purple)
    primaryForeground: '#000000',
    primaryMuted: '#2A2650',      // dark purple tint for chips/badges

    secondary: '#60C8B4',         // --secondary dark (lighter teal)
    secondaryForeground: '#000000',

    accent: '#EDBA5A',            // --accent dark (lighter amber)
    accentForeground: '#000000',

    // Semantic
    destructive: '#E87050',       // --destructive dark
    destructiveForeground: '#000000',

    muted: '#52525B',
    mutedForeground: '#D4D4D8',

    // UI chrome
    border: '#71717A',            // --border dark
    input: '#FFFFFF',             // --input dark
    ring: '#8B78E6',              // --ring dark

    // Chart / data viz (optional)
    chart1: '#8B78E6',
    chart2: '#60C8B4',
    chart3: '#EDBA5A',
    chart4: '#D4748C',
    chart5: '#78CC8E',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Outfit = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semiBold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
} as const;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: Outfit.regular,
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: Outfit.regular,
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: Outfit.regular,
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
