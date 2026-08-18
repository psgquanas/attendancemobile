import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { apiErrorMessage, checkInWithQr } from "@/lib/attendance-check-in";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { Camera, ChevronLeft, Flashlight, RefreshCw, ShieldAlert } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const SCANNER_SIZE = SCREEN_WIDTH * 0.7;

export default function QRCodeScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [verifying, setVerifying] = useState(false);

  // Laser line animation
  const laserTranslateY = useSharedValue(0);

  useEffect(() => {
    laserTranslateY.value = withRepeat(
      withSequence(
        withTiming(SCANNER_SIZE - 2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, []);

  const laserStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: laserTranslateY.value }],
  }));

  const handleBarcodeScanned = async ({ data }: { type: string; data: string }) => {
    if (scanned || verifying) return;
    setScanned(true);
    setVerifying(true);
    toast.success("Code detected!");

    try {
      await checkInWithQr(data);
      toast.success("Checked in successfully!");
      router.replace("/(app)");
    } catch (error: any) {
      toast.error(apiErrorMessage(error));
      setScanned(false);
    } finally {
      setVerifying(false);
    }
  };

  // ─── Render States ────────────────────────────────────────────────
  if (!permission) {
    // Camera permissions are still loading
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (!permission.granted) {
    // Clean modern permission request screen
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: themeColors.background }]}>
        <StatusBar barStyle={theme === "dark" ? "light-content" : "dark-content"} />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={8}>
            <ChevronLeft size={24} color={themeColors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.text }]}>Camera Access</Text>
        </View>

        {/* Content */}
        <View style={styles.permissionContent}>
          <View style={[styles.iconContainer, { backgroundColor: `${themeColors.primary}1A` }]}>
            <ShieldAlert size={48} color={themeColors.primary} strokeWidth={1.5} />
          </View>
          <Text style={[styles.permissionTitle, { color: themeColors.text }]}>
            Camera Permission Required
          </Text>
          <Text style={[styles.permissionDesc, { color: themeColors.textSecondary }]}>
            We need access to your camera to scan attendance QR codes. Your camera preview is only processed locally on your device.
          </Text>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: themeColors.primary }]}
            onPress={requestPermission}
            activeOpacity={0.85}
          >
            <Text style={[styles.primaryBtnText, { color: themeColors.primaryForeground }]}>
              Grant Permission
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Text style={[styles.cancelBtnText, { color: themeColors.textSecondary }]}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Camera Background */}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />

      {/* Dark overlay masks */}
      <View style={styles.overlayContainer}>
        {/* Top mask */}
        <View style={styles.maskTop} />

        {/* Middle row containing Left mask, Scanner square, and Right mask */}
        <View style={styles.maskRow}>
          <View style={styles.maskSide} />
          
          {/* Scanning Box */}
          <View style={styles.scannerBox}>
            {/* Animated Laser Line */}
            {!scanned && <Animated.View style={[styles.laser, laserStyle]} />}

            {/* Glowing Corner Borders */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>

          <View style={styles.maskSide} />
        </View>

        {/* Bottom mask */}
        <View style={styles.maskBottom}>
          <Text style={styles.instructionText}>
            Align the QR code inside the frame to scan
          </Text>
        </View>
      </View>

      {/* Floating Header Actions */}
      <SafeAreaView style={styles.floatingHeader} edges={["top"]}>
        <TouchableOpacity
          style={styles.floatingBtn}
          onPress={() => router.back()}
          activeOpacity={0.75}
        >
          <ChevronLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.floatingTitle}>Verify Attendance</Text>

        <TouchableOpacity
          style={[styles.floatingBtn, torchOn && styles.floatingBtnActive]}
          onPress={() => setTorchOn(!torchOn)}
          activeOpacity={0.75}
        >
          <Flashlight size={22} color={torchOn ? "#FFDF00" : "#FFFFFF"} />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Loading Overlay during Verification */}
      {verifying && (
        <View style={styles.verifyingOverlay}>
          <View style={styles.verifyingCard}>
            <ActivityIndicator size="large" color="#FFFFFF" style={{ marginBottom: 12 }} />
            <Text style={styles.verifyingText}>Verifying Attendance...</Text>
          </View>
        </View>
      )}

      {/* Rescan Button if scan completed but failed or reset */}
      {scanned && !verifying && (
        <TouchableOpacity
          style={[styles.rescanBtn, { backgroundColor: themeColors.primary }]}
          onPress={() => setScanned(false)}
          activeOpacity={0.85}
        >
          <RefreshCw size={18} color={themeColors.primaryForeground} style={{ marginRight: 8 }} />
          <Text style={[styles.rescanText, { color: themeColors.primaryForeground }]}>
            Scan Again
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
    },
    centered: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    screen: {
      flex: 1,
    },
    header: {
      height: 56,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      position: "absolute",
      left: 16,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: Outfit.semiBold,
      fontSize: 17,
    },

    // ── Permission Request UI ──────────────────────────────────────
    permissionContent: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 32,
      gap: 20,
    },
    iconContainer: {
      width: 96,
      height: 96,
      borderRadius: 48,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    permissionTitle: {
      fontFamily: Outfit.bold,
      fontSize: 22,
      textAlign: "center",
    },
    permissionDesc: {
      fontFamily: Outfit.regular,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 22,
      paddingHorizontal: 12,
      marginBottom: 16,
    },
    primaryBtn: {
      width: "100%",
      height: 54,
      borderRadius: 27,
      alignItems: "center",
      justifyContent: "center",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 4,
    },
    primaryBtnText: {
      fontFamily: Outfit.bold,
      fontSize: 15,
      letterSpacing: 0.5,
    },
    cancelBtn: {
      width: "100%",
      height: 48,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtnText: {
      fontFamily: Outfit.semiBold,
      fontSize: 14,
    },

    // ── Floating Controls Overlay ───────────────────────────────────
    floatingHeader: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      zIndex: 10,
    },
    floatingBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(0, 0, 0, 0.45)",
      alignItems: "center",
      justifyContent: "center",
    },
    floatingBtnActive: {
      backgroundColor: "rgba(255, 255, 255, 0.15)",
    },
    floatingTitle: {
      fontFamily: Outfit.semiBold,
      fontSize: 17,
      color: "#FFFFFF",
      textShadowColor: "rgba(0, 0, 0, 0.6)",
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 3,
    },

    // ── Translucent Camera Cutout Mask ──────────────────────────────
    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 2,
    },
    maskTop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
    },
    maskRow: {
      height: SCANNER_SIZE,
      flexDirection: "row",
    },
    maskSide: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
    },
    maskBottom: {
      flex: 1.2,
      backgroundColor: "rgba(0, 0, 0, 0.65)",
      alignItems: "center",
      paddingTop: 32,
    },
    instructionText: {
      fontFamily: Outfit.medium,
      fontSize: 14,
      color: "#FFFFFF",
      textAlign: "center",
      opacity: 0.85,
      paddingHorizontal: 32,
    },

    // ── Scanning Cutout Frame ───────────────────────────────────────
    scannerBox: {
      width: SCANNER_SIZE,
      height: SCANNER_SIZE,
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.12)",
      overflow: "hidden",
      position: "relative",
    },
    laser: {
      height: 3,
      width: "100%",
      backgroundColor: "#5B48C2",
      position: "absolute",
      shadowColor: "#5B48C2",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.9,
      shadowRadius: 6,
    },

    // ── Corner highlights ───────────────────────────────────────────
    corner: {
      position: "absolute",
      width: 24,
      height: 24,
      borderColor: "#5B48C2", // brand primary purple
      borderWidth: 3.5,
    },
    topLeft: {
      top: 0,
      left: 0,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 10,
    },
    topRight: {
      top: 0,
      right: 0,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: 10,
    },
    bottomLeft: {
      bottom: 0,
      left: 0,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: 10,
    },
    bottomRight: {
      bottom: 0,
      right: 0,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: 10,
    },

    // ── Verification Loader ─────────────────────────────────────────
    verifyingOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 20,
    },
    verifyingCard: {
      backgroundColor: "rgba(33, 34, 37, 0.9)",
      padding: 24,
      borderRadius: 20,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "rgba(255, 255, 255, 0.1)",
    },
    verifyingText: {
      fontFamily: Outfit.semiBold,
      fontSize: 15,
      color: "#FFFFFF",
    },

    // ── Rescan ──────────────────────────────────────────────────────
    rescanBtn: {
      position: "absolute",
      bottom: 64,
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 28,
      zIndex: 10,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    rescanText: {
      fontFamily: Outfit.bold,
      fontSize: 14,
    },
  });
