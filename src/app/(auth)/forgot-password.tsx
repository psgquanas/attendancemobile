import AuthInput from "@/components/auth/AuthInput";
import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "expo-router";
import { ChevronLeft } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const isDark = theme === "dark";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

  const handleSend = async () => {
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await authClient.emailOtp.sendVerificationOtp({
        email: email.trim().toLowerCase(),
        type: "forget-password",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Code sent! Check your inbox.");
            router.push({
              pathname: "/(auth)/verify-otp",
              params: { email: email.trim().toLowerCase() },
            });
          },
          onError: (ctx) => {
            setError(
              ctx.error?.message || "Something went wrong. Please try again."
            );
          },
        },
      });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.background }]}
      edges={["top", "bottom"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={themeColors.background}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={[
                styles.backButton,
                {
                  backgroundColor: themeColors.backgroundElement,
                  borderColor: themeColors.backgroundSelected,
                },
              ]}
              onPress={() => router.back()}
              activeOpacity={0.8}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={[styles.backArrow, { color: themeColors.text }]}>
                <ChevronLeft />
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Forgot Password?
            </Text>
            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Enter your email address and we will send a code to reset your
              password.
            </Text>
          </View>

          <View style={styles.form}>
            <AuthInput
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError("");
              }}
              autoCorrect={false}
              error={error}
            />

            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: themeColors.primary },
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleSend}
              activeOpacity={0.85}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={themeColors.primaryForeground} />
              ) : (
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: themeColors.primaryForeground },
                  ]}
                >
                  SEND CODE
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
    gap: 32,
  },
  header: {
    height: 56,
    justifyContent: "center",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  backArrow: {
    fontFamily: Outfit.semiBold,
    fontSize: 20,
    lineHeight: 24,
    marginTop: -1,
  },
  titleSection: {
    gap: 8,
    paddingTop: 24,
  },
  title: {
    fontFamily: Outfit.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: Outfit.regular,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  form: {
    gap: 14,
  },
  successText: {
    marginLeft: 4,
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  primaryButton: {
    height: 56,
    marginTop: 8,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: Outfit.bold,
    fontSize: 14,
    letterSpacing: 2,
  },
});
