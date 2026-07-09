import { useLocalSearchParams, useRouter } from "expo-router";
import { Eye, EyeOff, LockKeyhole } from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isStrong = password.length >= 8;
  const passwordsMatch = password === confirmPassword;
  const canSubmit = isStrong && passwordsMatch && confirmPassword.length > 0;

  const handleReset = async () => {
    setError("");

    if (!isStrong) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!passwordsMatch) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authClient.emailOtp.resetPassword({
        email,
        otp,
        password,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Password reset successfully!");
            router.replace("/(auth)/sign-in");
          },
          onError: (ctx) => {
            setError(
              ctx.error?.message || "Something went wrong. Please try again.",
            );
            setLoading(false);
          },
        },
      });
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
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
            <Text style={styles.headerTitle}>Reset Password</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconWrapper}>
              <LockKeyhole
                size={36}
                color={themeColors.text}
                strokeWidth={1.8}
              />
            </View>

            <Text style={styles.title}>New Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password for your account.
            </Text>

            <View style={styles.form}>
              {/* Password field */}
              <View>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: themeColors.border },
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="At least 8 characters"
                    placeholderTextColor={themeColors.textSecondary}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={(v) => {
                      setPassword(v);
                      setError("");
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={() => setShowPassword((p) => !p)}
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeOff
                        size={20}
                        color={themeColors.textSecondary}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={20}
                        color={themeColors.textSecondary}
                        strokeWidth={1.8}
                      />
                    )}
                  </Pressable>
                </View>
                {password.length > 0 && (
                  <Text
                    style={[
                      styles.hint,
                      { color: isStrong ? themeColors.primary : "#ef4444" },
                    ]}
                  >
                    {isStrong
                      ? "✓ Strong password"
                      : "At least 8 characters required"}
                  </Text>
                )}
              </View>

              {/* Confirm password field */}
              <View>
                <Text style={styles.label}>Confirm Password</Text>
                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: themeColors.border },
                  ]}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor={themeColors.textSecondary}
                    secureTextEntry={!showConfirm}
                    value={confirmPassword}
                    onChangeText={(v) => {
                      setConfirmPassword(v);
                      setError("");
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    onPress={() => setShowConfirm((p) => !p)}
                    hitSlop={8}
                  >
                    {showConfirm ? (
                      <EyeOff
                        size={20}
                        color={themeColors.textSecondary}
                        strokeWidth={1.8}
                      />
                    ) : (
                      <Eye
                        size={20}
                        color={themeColors.textSecondary}
                        strokeWidth={1.8}
                      />
                    )}
                  </Pressable>
                </View>
                {confirmPassword.length > 0 && (
                  <Text
                    style={[
                      styles.hint,
                      {
                        color: passwordsMatch ? themeColors.primary : "#ef4444",
                      },
                    ]}
                  >
                    {passwordsMatch
                      ? "✓ Passwords match"
                      : "Passwords do not match"}
                  </Text>
                )}
              </View>

              {/* Error */}
              {!!error && <Text style={styles.errorText}>{error}</Text>}
            </View>
          </View>

          {/* Submit button */}
          <Pressable
            onPress={handleReset}
            disabled={!canSubmit || loading}
            style={[
              styles.submitButton,
              { backgroundColor: themeColors.primary },
              (!canSubmit || loading) && styles.submitButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.primaryForeground} />
            ) : (
              <Text
                style={[
                  styles.submitButtonText,
                  { color: themeColors.primaryForeground },
                  !canSubmit && styles.submitButtonTextDisabled,
                ]}
              >
                Reset Password
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
      marginBottom: 32,
    },
    form: {
      width: "100%",
      gap: 20,
    },
    label: {
      fontFamily: Outfit.semiBold,
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.backgroundElement,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 14,
      height: 52,
      gap: 10,
    },
    input: {
      flex: 1,
      fontFamily: Outfit.regular,
      fontSize: 15,
      color: colors.text,
    },
    hint: {
      fontFamily: Outfit.regular,
      fontSize: 12,
      marginTop: 6,
      marginLeft: 2,
    },
    errorText: {
      fontFamily: Outfit.regular,
      fontSize: 13,
      color: "#ef4444",
      textAlign: "center",
    },
    submitButton: {
      height: 56,
      borderRadius: 28,
      alignItems: "center",
      justifyContent: "center",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 8,
    },
    submitButtonDisabled: {
      backgroundColor: colors.backgroundElement,
      shadowOpacity: 0,
      elevation: 0,
    },
    submitButtonText: {
      fontFamily: Outfit.semiBold,
      fontSize: 16,
    },
    submitButtonTextDisabled: {
      color: colors.textSecondary,
    },
  });
