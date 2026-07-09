import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { useRouter } from "expo-router";
import { Keyboard, QrCode } from "lucide-react-native";
import { useEffect, useMemo } from "react";
import { Dimensions, Pressable, StyleSheet, Text, View } from "react-native";
import {
    Gesture,
    GestureDetector,
    GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
    Easing,
    Extrapolation,
    interpolate,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const SHEET_HEIGHT = 310;
const CLOSED_Y = SHEET_HEIGHT;
const OPEN_Y = 0;

const BUTTON_SIZE = 140;
const RING_SIZE = BUTTON_SIZE + 64;

export default function CheckInScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const scale1 = useSharedValue(1);
  const opacity1 = useSharedValue(0.45);
  const scale2 = useSharedValue(1);
  const opacity2 = useSharedValue(0.2);

  useEffect(() => {
    const dur = 1400;
    scale1.value = withRepeat(
      withSequence(
        withTiming(1.6, { duration: dur, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: dur, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity1.value = withRepeat(
      withSequence(
        withTiming(0, { duration: dur, easing: Easing.out(Easing.ease) }),
        withTiming(0.45, { duration: dur, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
    // offset second ring by half cycle
    scale2.value = withRepeat(
      withSequence(
        withTiming(1.6, {
          duration: dur * 2,
          easing: Easing.inOut(Easing.ease),
        }),
        withTiming(1, { duration: dur * 2, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    opacity2.value = withRepeat(
      withSequence(
        withTiming(0, { duration: dur * 2, easing: Easing.out(Easing.ease) }),
        withTiming(0.25, { duration: dur * 2, easing: Easing.in(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const ring1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
    opacity: opacity1.value,
  }));
  const ring2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
    opacity: opacity2.value,
  }));

  // ─── Bottom sheet ────────────────────────────────────────────────
  const translateY = useSharedValue(CLOSED_Y);
  const startY = useSharedValue(CLOSED_Y);

  const openSheet = () => {
    translateY.value = withTiming(OPEN_Y, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  };

  const closeSheet = () => {
    translateY.value = withTiming(CLOSED_Y, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    });
  };

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      translateY.value = Math.max(OPEN_Y, Math.min(CLOSED_Y, next));
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 600) {
        translateY.value = withTiming(CLOSED_Y, {
          duration: 300,
          easing: Easing.in(Easing.cubic),
        });
      } else {
        translateY.value = withTiming(OPEN_Y, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [OPEN_Y, CLOSED_Y],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      pointerEvents: (translateY.value < CLOSED_Y - 10 ? "auto" : "none") as
        | "auto"
        | "none",
    };
  });

  const handleQrScan = () => {
    closeSheet();
    router.push("/(navs)/qrcode");
  };

  const handleManualCode = () => {
    closeSheet();
    router.push("/(navs)/manualcode");
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        edges={["top"]}
        style={[styles.screen, { backgroundColor: themeColors.background }]}
      >
        {/* Page title */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>
            Check In
          </Text>
          <Text
            style={[styles.headerSub, { color: themeColors.textSecondary }]}
          >
            Tap the button to mark your attendance
          </Text>
        </View>

        {/* Centered glowing button */}
        <View style={styles.center}>
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: themeColors.primary },
              ring1Style,
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              { borderColor: themeColors.primary },
              ring2Style,
            ]}
          />

          <Pressable
            onPress={openSheet}
            style={({ pressed }) => [
              styles.checkInBtn,
              { backgroundColor: themeColors.primary },
              pressed && { opacity: 0.85, transform: [{ scale: 0.95 }] },
            ]}
          >
            <Text
              style={[
                styles.checkInIcon,
                { color: themeColors.primaryForeground },
              ]}
            >
              ✓
            </Text>
            <Text
              style={[
                styles.checkInLabel,
                { color: themeColors.primaryForeground },
              ]}
            >
              Check In
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Dim backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        animatedProps={animatedProps}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
      </Animated.View>

      {/* Draggable bottom sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: themeColors.backgroundElement },
            sheetStyle,
          ]}
        >
          {/* Drag handle */}
          <View style={styles.handleRow}>
            <View
              style={[
                styles.handle,
                { backgroundColor: themeColors.backgroundSelected },
              ]}
            />
          </View>

          <Text style={[styles.sheetTitle, { color: themeColors.text }]}>
            How would you like to check in?
          </Text>
          <Text style={[styles.sheetSub, { color: themeColors.textSecondary }]}>
            Choose your preferred method
          </Text>

          <View style={styles.optionsRow}>
            {/* QR Scan */}
            <Pressable
              onPress={handleQrScan}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                },
                pressed && { opacity: 0.72, transform: [{ scale: 0.97 }] },
              ]}
            >
              <View
                style={[
                  styles.optionIconCircle,
                  { backgroundColor: `${themeColors.primary}1A` },
                ]}
              >
                <QrCode
                  size={28}
                  color={themeColors.primary}
                  strokeWidth={1.75}
                />
              </View>
              <Text style={[styles.optionTitle, { color: themeColors.text }]}>
                Scan QR Code
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  { color: themeColors.textSecondary },
                ]}
              >
                Point camera at the attendance QR
              </Text>
            </Pressable>

            {/* Manual code */}
            <Pressable
              onPress={handleManualCode}
              style={({ pressed }) => [
                styles.optionCard,
                {
                  backgroundColor: themeColors.background,
                  borderColor: themeColors.border,
                },
                pressed && { opacity: 0.72, transform: [{ scale: 0.97 }] },
              ]}
            >
              <View
                style={[
                  styles.optionIconCircle,
                  { backgroundColor: `${themeColors.secondary}1A` },
                ]}
              >
                <Keyboard
                  size={28}
                  color={themeColors.secondary}
                  strokeWidth={1.75}
                />
              </View>
              <Text style={[styles.optionTitle, { color: themeColors.text }]}>
                Enter Code
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  { color: themeColors.textSecondary },
                ]}
              >
                Type in the session code manually
              </Text>
            </Pressable>
          </View>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    screen: { flex: 1 },

    header: {
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 8,
      gap: 4,
    },
    headerTitle: {
      fontFamily: Outfit.bold,
      fontSize: 26,
      letterSpacing: -0.4,
    },
    headerSub: {
      fontFamily: Outfit.regular,
      fontSize: 14,
    },

    // ── Glow button ──────────────────────────────────────────────────
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    pulseRing: {
      position: "absolute",
      width: RING_SIZE,
      height: RING_SIZE,
      borderRadius: RING_SIZE / 2,
      borderWidth: 2.5,
    },
    checkInBtn: {
      width: BUTTON_SIZE,
      height: BUTTON_SIZE,
      borderRadius: BUTTON_SIZE / 2,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 24,
      elevation: 16,
    },
    checkInIcon: {
      fontSize: 40,
      lineHeight: 46,
      fontFamily: Outfit.bold,
    },
    checkInLabel: {
      fontFamily: Outfit.semiBold,
      fontSize: 13,
      letterSpacing: 0.4,
    },

    // ── Backdrop ──────────────────────────────────────────────────────
    backdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
    },

    // ── Bottom sheet ──────────────────────────────────────────────────
    sheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: SHEET_HEIGHT,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 20,
      paddingBottom: 32,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 24,
    },
    handleRow: {
      alignItems: "center",
      paddingTop: 12,
      paddingBottom: 6,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
    },
    sheetTitle: {
      fontFamily: Outfit.bold,
      fontSize: 17,
      marginTop: 8,
      marginBottom: 3,
    },
    sheetSub: {
      fontFamily: Outfit.regular,
      fontSize: 13,
      marginBottom: 20,
    },
    optionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    optionCard: {
      flex: 1,
      borderRadius: 20,
      borderWidth: 1,
      padding: 16,
      gap: 10,
    },
    optionIconCircle: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    optionTitle: {
      fontFamily: Outfit.semiBold,
      fontSize: 14,
    },
    optionDesc: {
      fontFamily: Outfit.regular,
      fontSize: 12,
      lineHeight: 17,
    },
  });
