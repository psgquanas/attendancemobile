import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/lecturer-tabs';
import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

function TabLayoutContent() {
  const { theme: appTheme } = useAppTheme();
  const isDark = appTheme === 'dark';

  const navigationTheme = isDark
    ? {
      ...DarkTheme,
      colors: {
        ...DarkTheme.colors,
        background: Colors.dark.background,
      },
    }
    : {
      ...DefaultTheme,
      colors: {
        ...DefaultTheme.colors,
        background: Colors.light.background,
      },
    };

  return (
    <ThemeProvider value={navigationTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}

export default function TabLayout() {
  return <TabLayoutContent />;
}
