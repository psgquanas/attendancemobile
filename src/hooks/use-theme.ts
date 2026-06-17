/**
 * Shared theme tokens resolved from the app's persisted theme preference.
 */

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

export function useTheme() {
  const { theme } = useAppTheme();

  return Colors[theme];
}
