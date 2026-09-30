import { Heebo_400Regular, Heebo_700Bold, Heebo_800ExtraBold, useFonts } from '@expo-google-fonts/heebo';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { color } from '../theme/tokens';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({ Heebo_400Regular, Heebo_700Bold, Heebo_800ExtraBold });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync();
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <SafeAreaProvider>
      {/* direction: 'rtl' makes the whole tree RTL even in Expo Go, which ignores forcesRTL. */}
      <View style={{ flex: 1, direction: 'rtl', backgroundColor: color.bg }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: color.bg } }} />
      </View>
    </SafeAreaProvider>
  );
}
