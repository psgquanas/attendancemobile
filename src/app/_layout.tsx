import { authClient } from '@/lib/auth-client';
import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
} from "@expo-google-fonts/outfit";
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Toaster } from 'sonner-native';
import { AppThemeProvider } from '@/context/theme-context';


export default function RootLayout() {
  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
  });

  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const segments = useSegments();


  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  const segment = segments[0];
  const userId = session?.user?.id;

  useEffect(() => {
    if (isPending || (!loaded && !error)) return;

    const inAuthGroup = segment === '(auth)';
    const isVerifyEmailScreen = segment === '(auth)' && segments[1] === 'verify-email';
    const emailVerified = session?.user?.emailVerified;

    if (userId) {
      if (!emailVerified) {
        if (!isVerifyEmailScreen) {
          setTimeout(() => router.replace('/(auth)/verify-email'), 0);
        }
      } else {
        if (inAuthGroup || !segment) {
          setTimeout(() => router.replace('/(app)'), 0);
        }
      }
    } else {
      if (!inAuthGroup) {
        setTimeout(() => router.replace('/(auth)/sign-in'), 0);
      }
    }
  }, [userId, isPending, segment, segments, loaded, error, session?.user?.emailVerified]);

  if (!loaded && !error) return null;

  return (
    <AppThemeProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }}>
        </Stack>
        <Toaster
          toastOptions={{
            titleStyle: { fontFamily: 'Outfit_600SemiBold' },
            descriptionStyle: { fontFamily: 'Outfit_400Regular' },
          }}
        />
      </GestureHandlerRootView>
    </AppThemeProvider>
  );
}
