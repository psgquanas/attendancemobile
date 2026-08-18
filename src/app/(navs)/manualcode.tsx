import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
    ArrowLeft,
    CircleCheck,
    Keyboard,
    ShieldCheck,
    Sparkles,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    View,
} from "react-native";
import Animated, {
    Easing,
    FadeIn,
    FadeInDown,
    FadeInUp,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import {
  apiErrorMessage,
  checkInWithManualCode,
} from "@/lib/attendance-check-in";

const CODE_LENGTH = 6;
type Palette = typeof Colors.light | typeof Colors.dark;

function sanitizeCode(input: string) {
  return input
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase()
    .slice(0, CODE_LENGTH);
}

export default function ManualCodeScreen() {
  const { theme } = useAppTheme();
  const colors: Palette = Colors[theme];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const pulse = useSharedValue(0.92);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.92, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const isComplete = code.length === CODE_LENGTH;

  const submitCode = async (value = code) => {
    if (value.length !== CODE_LENGTH || submitting) return;

    setSubmitting(true);
    try {
      await checkInWithManualCode(value);
      toast.success("Attendance checked in successfully.");
      router.replace("/(app)");
    } catch (error: any) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.screenPressable}
          onPress={() => inputRef.current?.focus()}
        >
          <Animated.View
            entering={FadeIn.duration(320)}
            style={styles.backgroundGlow}
          />
          <Animated.View
            entering={FadeIn.duration(420)}
            style={[styles.backgroundOrb, styles.backgroundOrbLeft]}
          />
          <Animated.View
            entering={FadeIn.duration(420)}
            style={[styles.backgroundOrb, styles.backgroundOrbRight]}
          />

          <View style={styles.container}>
            <Animated.View
              entering={FadeInDown.duration(340)}
              style={styles.headerRow}
            >
              <Pressable
                onPress={() => router.back()}
                hitSlop={12}
                style={({ pressed }) => [
                  styles.backButton,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.backgroundSelected,
                    opacity: pressed ? 0.82 : 1,
                  },
                ]}
              >
                <ArrowLeft size={20} color={colors.text} strokeWidth={2} />
              </Pressable>

              <View style={styles.headerCopy}>
                <Animated.Text
                  style={[styles.eyebrow, { color: colors.textSecondary }]}
                >
                  Manual check in
                </Animated.Text>
                <Animated.Text style={[styles.title, { color: colors.text }]}>
                  Enter your 6 character code
                </Animated.Text>
              </View>

              <View style={styles.headerSpacer} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(80).duration(360)}
              style={[
                styles.heroCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <View style={styles.heroTopRow}>
                <View
                  style={[
                    styles.iconBadge,
                    { backgroundColor: `${colors.primary}18` },
                  ]}
                >
                  <Keyboard
                    size={22}
                    color={colors.primary}
                    strokeWidth={1.9}
                  />
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: `${colors.secondary}18` },
                  ]}
                >
                  <CircleCheck
                    size={14}
                    color={colors.secondary}
                    strokeWidth={2}
                  />
                  <Animated.Text
                    style={[styles.statusText, { color: colors.secondary }]}
                  >
                    Ready for attendance
                  </Animated.Text>
                </View>
              </View>

              <Animated.Text
                style={[styles.heroText, { color: colors.textSecondary }]}
              >
                Type the session code shared by your lecturer. We'll verify it
                and check you in right away.
              </Animated.Text>

              <View style={styles.codeFieldWrap}>
                <Pressable
                  style={({ pressed }) => [
                    styles.codeShell,
                    {
                      backgroundColor: colors.background,
                      borderColor:
                        code.length > 0
                          ? colors.primary
                          : colors.backgroundSelected,
                      shadowColor: colors.primary,
                      opacity: pressed ? 0.98 : 1,
                    },
                  ]}
                  onPress={() => inputRef.current?.focus()}
                >
                  {Array.from({ length: CODE_LENGTH }).map((_, index) => {
                    const char = code[index];
                    const active =
                      index === code.length && code.length < CODE_LENGTH;
                    const filled = Boolean(char);

                    return (
                      <View
                        key={`digit-${index}`}
                        style={[
                          styles.codeCell,
                          {
                            backgroundColor: filled
                              ? `${colors.primary}12`
                              : colors.backgroundElement,
                            borderColor: active
                              ? colors.primary
                              : colors.backgroundSelected,
                          },
                        ]}
                      >
                        <Animated.Text
                          style={[
                            styles.codeChar,
                            {
                              color: filled
                                ? colors.text
                                : colors.textSecondary,
                            },
                            active && styles.codeCharActive,
                          ]}
                        >
                          {char ?? ""}
                        </Animated.Text>
                      </View>
                    );
                  })}

                  <TextInput
                    ref={inputRef}
                    value={code}
                    onChangeText={(next) => {
                      const cleaned = sanitizeCode(next);
                      setCode(cleaned);
                      if (cleaned.length === CODE_LENGTH) {
                        void submitCode(cleaned);
                      }
                    }}
                    autoFocus
                    keyboardType="default"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={CODE_LENGTH}
                    textContentType="oneTimeCode"
                    importantForAutofill="yes"
                    caretHidden
                    style={styles.hiddenInput}
                    onSubmitEditing={() => void submitCode()}
                    returnKeyType="done"
                  />
                </Pressable>

                <View style={styles.helperRow}>
                  <View
                    style={[
                      styles.helperChip,
                      { backgroundColor: `${colors.primary}12` },
                    ]}
                  >
                    <Sparkles
                      size={13}
                      color={colors.primary}
                      strokeWidth={2}
                    />
                    <Animated.Text
                      style={[styles.helperText, { color: colors.primary }]}
                    >
                      6 characters
                    </Animated.Text>
                  </View>
                  <Animated.Text
                    style={[
                      styles.helperTextSecondary,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Letters and numbers work best
                  </Animated.Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View
              entering={FadeInUp.delay(120).duration(340)}
              style={styles.footerStack}
            >
              <Pressable
                onPress={() => void submitCode()}
                disabled={!isComplete || submitting}
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor: isComplete
                      ? colors.primary
                      : colors.backgroundSelected,
                    shadowColor: colors.primary,
                    opacity: pressed && isComplete && !submitting ? 0.92 : 1,
                  },
                ]}
              >
                <Animated.View
                  style={[styles.submitContent, submitting && pulseStyle]}
                >
                  <ShieldCheck
                    size={18}
                    color={
                      isComplete
                        ? colors.primaryForeground
                        : colors.textSecondary
                    }
                    strokeWidth={2}
                  />
                  <Animated.Text
                    style={[
                      styles.submitText,
                      {
                        color: isComplete
                          ? colors.primaryForeground
                          : colors.textSecondary,
                      },
                    ]}
                  >
                    {submitting ? (
                      <>
                        <ActivityIndicator color={colors.primaryForeground} />{" "}
                        Verifying code...
                      </>
                    ) : (
                      "Check in"
                    )}
                  </Animated.Text>
                </Animated.View>
              </Pressable>

              <Animated.Text
                style={[styles.footerNote, { color: colors.textSecondary }]}
              >
                If the code is wrong, you can clear it and try again.
              </Animated.Text>
            </Animated.View>
          </View>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
    flex: {
      flex: 1,
    },
    screen: {
      flex: 1,
    },
    screenPressable: {
      flex: 1,
    },
    backgroundGlow: {
      position: "absolute",
      top: -120,
      left: -80,
      width: 260,
      height: 260,
      borderRadius: 999,
      backgroundColor: `${colors.primary}14`,
    },
    backgroundOrb: {
      position: "absolute",
      width: 180,
      height: 180,
      borderRadius: 999,
      backgroundColor: `${colors.secondary}10`,
    },
    backgroundOrbLeft: {
      top: 160,
      right: -70,
    },
    backgroundOrbRight: {
      bottom: 110,
      left: -60,
      backgroundColor: `${colors.accent}12`,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 24,
      justifyContent: "space-between",
      gap: 16,
    },
    headerRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    headerCopy: {
      flex: 1,
      gap: 4,
    },
    headerSpacer: {
      width: 44,
      height: 44,
    },
    eyebrow: {
      fontFamily: Outfit.medium,
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: 0.2,
      textTransform: "uppercase",
    },
    title: {
      fontFamily: Outfit.bold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    heroCard: {
      borderRadius: 28,
      borderWidth: 1,
      padding: 18,
      gap: 18,
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.08,
      shadowRadius: 30,
      elevation: 6,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    iconBadge: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    statusPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },
    statusText: {
      fontFamily: Outfit.semiBold,
      fontSize: 12,
      lineHeight: 16,
    },
    heroText: {
      fontFamily: Outfit.regular,
      fontSize: 15,
      lineHeight: 23,
    },
    codeFieldWrap: {
      gap: 12,
    },
    codeShell: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 8,
      borderRadius: 24,
      borderWidth: 1,
      padding: 12,
      position: "relative",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.08,
      shadowRadius: 18,
      elevation: 3,
    },
    codeCell: {
      flex: 1,
      aspectRatio: 0.88,
      borderRadius: 18,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      minHeight: 58,
    },
    codeChar: {
      fontFamily: Outfit.bold,
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: 1,
    },
    codeCharActive: {
      color: colors.primary,
    },
    hiddenInput: {
      position: "absolute",
      opacity: 0,
      width: 1,
      height: 1,
      left: 0,
      top: 0,
    },
    helperRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      flexWrap: "wrap",
    },
    helperChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },
    helperText: {
      fontFamily: Outfit.semiBold,
      fontSize: 12,
      lineHeight: 16,
    },
    helperTextSecondary: {
      fontFamily: Outfit.medium,
      fontSize: 12,
      lineHeight: 16,
    },
    footerStack: {
      gap: 10,
      paddingBottom: 4,
    },
    submitButton: {
      minHeight: 56,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 18,
      elevation: 6,
    },
    submitContent: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    submitText: {
      fontFamily: Outfit.bold,
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: 0.2,
    },
    footerNote: {
      fontFamily: Outfit.medium,
      fontSize: 13,
      lineHeight: 19,
      textAlign: "center",
    },
  });
