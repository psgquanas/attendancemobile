import { useLocalSearchParams, useRouter } from "expo-router";
import { KeySquare } from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputKeyPressEventData,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner-native";

const CODE_LENGTH = 6;

export default function VerifyOtpScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();

  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<Array<TextInput | null>>([]);

  // Countdown for resend
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = (seconds = 60) => {
    setCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const isComplete = code.every((digit) => digit !== "");

  const handleChangeDigit = (text: string, index: number) => {
    const sanitized = text.replace(/[^0-9]/g, "");
    if (!sanitized) {
      const next = [...code];
      next[index] = "";
      setCode(next);
      return;
    }
    const next = [...code];
    next[index] = sanitized[sanitized.length - 1];
    setCode(next);
    if (index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number,
  ) => {
    if (e.nativeEvent.key === "Backspace" && code[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...code];
      next[index - 1] = "";
      setCode(next);
    }
  };

  const handleVerify = async () => {
    if (!isComplete) return;
    setLoading(true);
    try {
      await authClient.emailOtp.checkVerificationOtp({
        email,
        otp: code.join(""),
        type: "forget-password",
        fetchOptions: {
          onSuccess: () => {
            router.replace({
              pathname: "/(auth)/reset-password",
              params: { email, otp: code.join("") },
            });
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || "Invalid or expired code.");
            setLoading(false);
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "forget-password",
        fetchOptions: {
          onSuccess: () => {
            toast.success("A new code has been sent.");
            setCode(Array(CODE_LENGTH).fill(""));
            startCountdown(60);
            setLoading(false);
          },
          onError: () => {
            toast.error("Failed to resend code. Please try again.");
            setLoading(false);
          },
        },
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              hitSlop={8}
            >
              <Text style={[styles.backArrow, { color: themeColors.text }]}>
                ←
              </Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Verify Code</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <KeySquare size={36} color={themeColors.text} strokeWidth={1.8} />
            </View>

            <Text style={styles.title}>Enter Reset Code</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit code to
            </Text>
            <Text style={styles.email}>{email}</Text>

            {/* OTP boxes */}
            <View style={styles.codeRow}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputRefs.current[index] = ref;
                  }}
                  value={digit}
                  onChangeText={(text) => handleChangeDigit(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[styles.codeBox, digit !== "" && styles.codeBoxFilled]}
                  selectionColor={themeColors.primary}
                />
              ))}
            </View>

            {/* Resend */}
            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't get the code? </Text>
              <Pressable
                onPress={handleResend}
                hitSlop={8}
                disabled={countdown > 0}
              >
                <Text
                  style={[
                    styles.resendLink,
                    countdown > 0 && styles.resendLinkDisabled,
                  ]}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : "Resend"}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* Verify button */}
          <Pressable
            onPress={handleVerify}
            disabled={!isComplete || loading}
            style={[
              styles.verifyButton,
              (!isComplete || loading) && styles.verifyButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.primary} />
            ) : (
              <Text
                style={[
                  styles.verifyButtonText,
                  !isComplete && styles.verifyButtonTextDisabled,
                ]}
              >
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    flex: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: 8,
      paddingBottom: 24,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 12,
    },
    backButton: {
      position: "absolute",
      left: 0,
      width: 36,
      height: 36,
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1,
    },
    backArrow: {
      fontFamily: Outfit.semiBold,
      fontSize: 20,
    },
    headerTitle: {
      fontFamily: Outfit.semiBold,
      fontSize: 17,
      color: colors.text,
    },
    content: {
      flex: 1,
      alignItems: "center",
      paddingTop: 32,
    },
    iconWrapper: {
      width: 72,
      height: 72,
      borderRadius: 18,
      backgroundColor: colors.backgroundElement,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontFamily: Outfit.bold,
      fontSize: 22,
      color: colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontFamily: Outfit.regular,
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: "center",
    },
    email: {
      fontFamily: Outfit.semiBold,
      fontSize: 15,
      color: colors.text,
      marginBottom: 32,
    },
    codeRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 10,
      marginBottom: 24,
    },
    codeBox: {
      width: 46,
      height: 54,
      borderRadius: 12,
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.border,
      color: colors.text,
      fontFamily: Outfit.semiBold,
      fontSize: 20,
      textAlign: "center",
    },
    codeBoxFilled: {
      backgroundColor: colors.backgroundSelected,
      borderColor: colors.primary,
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
    },
    resendText: {
      fontFamily: Outfit.regular,
      fontSize: 14,
      color: colors.textSecondary,
    },
    resendLink: {
      fontFamily: Outfit.semiBold,
      fontSize: 14,
      color: colors.primary,
    },
    resendLinkDisabled: {
      color: colors.textSecondary,
    },
    verifyButton: {
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    verifyButtonDisabled: {
      backgroundColor: colors.backgroundElement,
    },
    verifyButtonText: {
      fontFamily: Outfit.semiBold,
      fontSize: 16,
      color: colors.primaryForeground,
    },
    verifyButtonTextDisabled: {
      color: colors.textSecondary,
    },
  });
