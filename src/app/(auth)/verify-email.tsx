import { useRouter } from "expo-router";
import { Mail } from "lucide-react-native";
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner-native";

const CODE_LENGTH = 6;

export default function VerifyEmailScreen() {
  const [loading, setLoading] = useState(false);
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
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const email = session?.user?.email || "your email";

  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<Array<TextInput | null>>([]);

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
    try {
      setLoading(true);
      const result = await authClient.emailOtp.verifyEmail({
        email,
        otp: code.join(""),
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email verified successfully");
            router.replace("/(app)");
            setLoading(false);
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || "Verification failed");
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
    try {
      setLoading(true);
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Verification OTP sent to your email");
            startCountdown(60);
            setLoading(false);
          },
          onError: () => {
            toast.error("Internal Server Error");
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
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Verify Email</Text>
          </View>

          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <Mail size={36} color={themeColors.text} strokeWidth={1.8} />
            </View>

            <Text style={styles.title}>Check Your Email</Text>
            <Text style={styles.subtitle}>
              We've sent a verification code to
            </Text>
            <Text style={styles.email}>{email}</Text>

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

            <View style={styles.resendRow}>
              <Text style={styles.resendText}>Didn't receive the email? </Text>
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
                  {countdown > 0 ? `Resend in ${countdown}s` : "Click Here"}
                </Text>
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleVerify}
            disabled={!isComplete}
            style={[
              styles.verifyButton,
              !isComplete && styles.verifyButtonDisabled,
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
                Verify your Email
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
