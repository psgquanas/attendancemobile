import { useRouter } from "expo-router";
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

import AuthInput from "@/components/auth/AuthInput";
import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors extends Partial<FormState> {}

export default function RegisterScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const themeColors = Colors[theme];
  const isDark = theme === "dark";
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key: keyof FormState) => (val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      e.email = "Invalid email address";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Minimum 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await authClient.signUp.email({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        fetchOptions: {
          onSuccess: () => {
            toast.success("Account created successfully");
            router.replace("/(auth)/verify-email");
          },
          onError: (ctx) => {
            toast.error(ctx.error?.message || "Registration failed");
          },
        },
      });

      await authClient.emailOtp.sendVerificationOtp({
        email: form.email.trim(),
        type: "email-verification",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Verification OTP sent to your email");
            setLoading(false);
          },
          onError: () => {
            toast.error("Internal Server Error");
            setLoading(false);
          },
        },
      });
    } catch (err: unknown) {
      toast.error("Something went wrong. Try Again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: themeColors.background }]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={themeColors.background}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header / Back */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[
              styles.backButton,
              {
                backgroundColor: themeColors.backgroundElement,
                borderColor: themeColors.backgroundSelected,
              },
            ]}
            activeOpacity={0.7}
          >
            <Text style={[styles.backArrow, { color: themeColors.text }]}>
              ←
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              Sign Up To{" "}
              <Text style={[styles.title, { color: themeColors.primary }]}>
                Chekdly.
              </Text>
            </Text>
            <Text
              style={[styles.subtitle, { color: themeColors.textSecondary }]}
            >
              Get updates on your check-ins and much more.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <AuthInput
              label="Full Name"
              placeholder="Enter your full name"
              value={form.name}
              onChangeText={update("name")}
              error={errors.name}
              autoCorrect={false}
            />

            <AuthInput
              label="Email Address"
              placeholder="Enter your email"
              keyboardType="email-address"
              value={form.email}
              onChangeText={update("email")}
              error={errors.email}
              autoCorrect={false}
            />

            <AuthInput
              label="Password"
              placeholder="Create a password"
              isPassword
              value={form.password}
              onChangeText={update("password")}
              error={errors.password}
            />

            {/* Remember Me */}
            <TouchableOpacity
              style={styles.rememberRow}
              onPress={() => setRememberMe((prev) => !prev)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.radio,
                  { borderColor: themeColors.textSecondary },
                  rememberMe && { borderColor: themeColors.primary },
                ]}
              >
                {rememberMe && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.rememberText, { color: themeColors.text }]}>
                Remember me
              </Text>
            </TouchableOpacity>

            {/* Sign Up Button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: themeColors.primary },
                loading && styles.primaryButtonDisabled,
              ]}
              onPress={handleSignUp}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  { color: themeColors.primaryForeground },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={themeColors.primaryForeground} />
                ) : (
                  "SIGN UP"
                )}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.footer}>
            <Text
              style={[styles.footerText, { color: themeColors.textSecondary }]}
            >
              Already have an account?{" "}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/sign-in")}
              activeOpacity={0.7}
            >
              <Text style={[styles.footerLink, { color: themeColors.primary }]}>
                Login
              </Text>
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
  header: {
    height: 56,
    paddingHorizontal: 16,
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
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 28,
  },
  titleSection: {
    gap: 8,
  },
  title: {
    fontFamily: Outfit.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Outfit.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  form: {
    gap: 16,
  },
  rememberRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 4,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F5C518",
  },
  rememberText: {
    fontFamily: Outfit.medium,
    fontSize: 14,
  },
  primaryButton: {
    height: 56,
    borderRadius: 9999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontFamily: Outfit.bold,
    fontSize: 14,
    letterSpacing: 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 8,
  },
  footerText: {
    fontFamily: Outfit.regular,
    fontSize: 16,
  },
  footerLink: {
    fontFamily: Outfit.bold,
    fontSize: 16,
  },
});
