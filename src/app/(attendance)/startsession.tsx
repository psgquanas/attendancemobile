import * as Location from "expo-location";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
    ArrowLeft,
    Check,
    Clock3,
    Keyboard,
    MapPin,
    QrCode,
    Radar,
    ShieldCheck,
    TimerReset,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { api } from "@/lib/axios";

type Palette = (typeof Colors)[keyof typeof Colors];
type CheckInMode = "qr" | "manual" | "both";
type DurationOption = 5 | 10 | 15 | 30 | "custom";
type RadiusOption = 50 | 100 | 150 | 200;

const MODE_OPTIONS: Array<{
  id: CheckInMode;
  title: string;
  description: string;
  icon: "qr" | "manual" | "both";
}> = [
  {
    id: "qr",
    title: "QR code",
    description: "Students scan a live code.",
    icon: "qr",
  },
  {
    id: "manual",
    title: "Manual code",
    description: "Students enter a short code.",
    icon: "manual",
  },
  {
    id: "both",
    title: "Both",
    description: "Offer QR scan and manual code.",
    icon: "both",
  },
];

const DURATION_OPTIONS: DurationOption[] = [5, 10, 15, 30, "custom"];
const RADIUS_OPTIONS: RadiusOption[] = [50, 100, 150, 200];

function modeIcon(icon: "qr" | "manual" | "both", color: string) {
  if (icon === "qr") {
    return <QrCode size={20} color={color} strokeWidth={2.2} />;
  }
  if (icon === "manual") {
    return <Keyboard size={20} color={color} strokeWidth={2.2} />;
  }
  return <ShieldCheck size={20} color={color} strokeWidth={2.2} />;
}

function SectionTitle({
  eyebrow,
  title,
  colors,
}: {
  eyebrow: string;
  title: string;
  colors: Palette;
}) {
  return (
    <View style={styles.sectionHeading}>
      <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
        {eyebrow}
      </Text>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

export default function StartSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ classId?: string | string[] }>();
  const classId = Array.isArray(params.classId)
    ? params.classId[0]
    : params.classId;
  const { theme } = useAppTheme();
  const colors = Colors[theme];

  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<CheckInMode>("both");
  const [duration, setDuration] = useState<DurationOption>(10);
  const [customDuration, setCustomDuration] = useState("");
  const [requireLocation, setRequireLocation] = useState(true);
  const [radius, setRadius] = useState<RadiusOption>(100);

  const resolvedDuration = useMemo(() => {
    if (duration !== "custom") return duration;
    const parsed = Number.parseInt(customDuration, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }, [customDuration, duration]);

  const [submitting, setSubmitting] = useState(false);
  const canStart =
    title.trim().length > 0 && Boolean(resolvedDuration) && !submitting;

  const handleStartSession = async () => {
    if (!title.trim()) {
      toast.error("Add a session title first.");
      return;
    }

    if (!resolvedDuration) {
      toast.error("Enter a valid custom duration.");
      return;
    }

    if (!classId) {
      toast.error("No class selected.");
      return;
    }

    setSubmitting(true);

    try {
      let latitude: number | undefined;
      let longitude: number | undefined;

      if (requireLocation) {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          toast.error("Location permission is required to start this session.");
          setSubmitting(false);
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      }

      const response = await api.post("/api/sessions", {
        classId,
        title: title.trim(),
        checkInMode: mode.toUpperCase(),
        durationMinutes: resolvedDuration,
        requireLocation,
        allowedRadius: requireLocation ? radius : undefined,
        latitude,
        longitude,
      });

      const session = response.data?.data ?? response.data;

      toast.success("Session started!", {
        description: `${resolvedDuration} min · ${mode === "both" ? "QR + manual" : mode === "qr" ? "QR only" : "Manual only"}${requireLocation ? ` · ${radius}m radius` : ""}`,
      });

      router.push({
        pathname: "/(attendance)/livesession",
        params: {
          sessionId: session.id,
          classId,
        },
      });
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to start session";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <Stack.Screen options={{ title: "Start attendance session" }} />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.backButton,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <ArrowLeft size={18} color={colors.text} strokeWidth={2.2} />
            </Pressable>

            <View
              style={[
                styles.headerBadge,
                {
                  backgroundColor: colors.primaryMuted,
                  borderColor: `${colors.primary}22`,
                },
              ]}
            >
              <Radar size={15} color={colors.primary} strokeWidth={2.2} />
              <Text style={[styles.headerBadgeText, { color: colors.primary }]}>
                Lecturer
              </Text>
            </View>
          </View>

          <View style={styles.hero}>
            <Text style={[styles.kicker, { color: colors.textSecondary }]}>
              Attendance session
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Set up check-in rules
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Choose how students check in, how long the session stays open, and
              whether location should be required.
            </Text>
          </View>

          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <SectionTitle
              eyebrow={classId ? "Class selected" : "Session setup"}
              title="Session title"
              colors={colors}
            />
            <View
              style={[
                styles.inputShell,
                {
                  backgroundColor: colors.background,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Week 4 lecture attendance"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text }]}
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SectionTitle
              eyebrow="Check-in mode"
              title="How should students check in?"
              colors={colors}
            />
            <View style={styles.modeGrid}>
              {MODE_OPTIONS.map((option) => {
                const selected = mode === option.id;
                const toneColor = selected ? colors.primary : colors.text;

                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setMode(option.id)}
                    style={({ pressed }) => [
                      styles.modeCard,
                      {
                        backgroundColor: selected
                          ? colors.primaryMuted
                          : colors.backgroundElement,
                        borderColor: selected
                          ? colors.primary
                          : colors.backgroundSelected,
                        opacity: pressed ? 0.84 : 1,
                      },
                    ]}
                  >
                    <View style={styles.modeTopRow}>
                      <View
                        style={[
                          styles.modeIcon,
                          {
                            backgroundColor: selected
                              ? `${colors.primary}16`
                              : colors.backgroundSelected,
                          },
                        ]}
                      >
                        {modeIcon(option.icon, toneColor)}
                      </View>
                      {selected ? (
                        <View
                          style={[
                            styles.checkDot,
                            { backgroundColor: colors.primary },
                          ]}
                        >
                          <Check
                            size={13}
                            color={colors.primaryForeground}
                            strokeWidth={2.8}
                          />
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.modeTitle, { color: colors.text }]}>
                      {option.title}
                    </Text>
                    <Text
                      style={[
                        styles.modeDescription,
                        { color: colors.textSecondary },
                      ]}
                      numberOfLines={2}
                    >
                      {option.description}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.sectionBlock}>
            <SectionTitle
              eyebrow="Duration"
              title="How long should check-in stay open?"
              colors={colors}
            />
            <View style={styles.chipGrid}>
              {DURATION_OPTIONS.map((option) => {
                const selected = duration === option;
                const label = option === "custom" ? "Custom" : `${option} min`;

                return (
                  <Pressable
                    key={String(option)}
                    onPress={() => setDuration(option)}
                    style={({ pressed }) => [
                      styles.optionChip,
                      {
                        backgroundColor: selected
                          ? `${colors.accent}18`
                          : colors.backgroundElement,
                        borderColor: selected
                          ? colors.accent
                          : colors.backgroundSelected,
                        opacity: pressed ? 0.82 : 1,
                      },
                    ]}
                  >
                    <Clock3
                      size={15}
                      color={selected ? colors.accent : colors.textSecondary}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.optionChipText,
                        {
                          color: selected ? colors.text : colors.textSecondary,
                        },
                      ]}
                    >
                      {label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {duration === "custom" ? (
              <View
                style={[
                  styles.customDuration,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.backgroundSelected,
                  },
                ]}
              >
                <TimerReset size={18} color={colors.accent} strokeWidth={2.2} />
                <TextInput
                  value={customDuration}
                  onChangeText={(value) =>
                    setCustomDuration(value.replace(/[^0-9]/g, ""))
                  }
                  placeholder="Minutes"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="number-pad"
                  style={[styles.customInput, { color: colors.text }]}
                  maxLength={3}
                />
                <Text
                  style={[styles.customSuffix, { color: colors.textSecondary }]}
                >
                  min
                </Text>
              </View>
            ) : null}
          </View>

          <View
            style={[
              styles.locationCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <View style={styles.locationHeader}>
              <View
                style={[
                  styles.locationIcon,
                  { backgroundColor: `${colors.secondary}16` },
                ]}
              >
                <MapPin size={20} color={colors.secondary} strokeWidth={2.2} />
              </View>
              <View style={styles.locationCopy}>
                <Text style={[styles.locationTitle, { color: colors.text }]}>
                  Require location
                </Text>
                <Text
                  style={[
                    styles.locationDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Capture student coordinates during check-in.
                </Text>
              </View>
              <Switch
                value={requireLocation}
                onValueChange={setRequireLocation}
                trackColor={{
                  false: colors.backgroundSelected,
                  true: `${colors.secondary}66`,
                }}
                thumbColor={
                  requireLocation ? colors.secondary : colors.backgroundElement
                }
                ios_backgroundColor={colors.backgroundSelected}
              />
            </View>

            {requireLocation ? (
              <View style={styles.radiusBlock}>
                <Text
                  style={[styles.radiusLabel, { color: colors.textSecondary }]}
                >
                  Allowed radius
                </Text>
                <View style={styles.radiusGrid}>
                  {RADIUS_OPTIONS.map((option) => {
                    const selected = radius === option;

                    return (
                      <Pressable
                        key={option}
                        onPress={() => setRadius(option)}
                        style={({ pressed }) => [
                          styles.radiusCard,
                          {
                            backgroundColor: selected
                              ? `${colors.secondary}16`
                              : colors.background,
                            borderColor: selected
                              ? colors.secondary
                              : colors.backgroundSelected,
                            opacity: pressed ? 0.84 : 1,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.radiusValue,
                            {
                              color: selected ? colors.secondary : colors.text,
                            },
                          ]}
                        >
                          {option}
                        </Text>
                        <Text
                          style={[
                            styles.radiusUnit,
                            { color: colors.textSecondary },
                          ]}
                        >
                          metres
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ) : null}
          </View>

          <Pressable
            onPress={handleStartSession}
            disabled={!canStart}
            style={({ pressed }) => [
              styles.primaryButton,
              {
                backgroundColor: canStart
                  ? colors.primary
                  : colors.backgroundSelected,
                opacity: pressed ? 0.84 : 1,
              },
            ]}
          >
            {submitting ? (
              <ActivityIndicator
                size="small"
                color={
                  canStart ? colors.primaryForeground : colors.textSecondary
                }
              />
            ) : (
              <Text
                style={[
                  styles.primaryButtonText,
                  {
                    color: canStart
                      ? colors.primaryForeground
                      : colors.textSecondary,
                  },
                ]}
              >
                Start attendance session
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 44,
    gap: 18,
  },
  headerRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  headerBadge: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  headerBadgeText: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  hero: {
    gap: 8,
    paddingTop: 4,
  },
  kicker: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Outfit.bold,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.55,
  },
  subtitle: {
    maxWidth: 340,
    fontFamily: Outfit.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 16,
    gap: 14,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionHeading: {
    gap: 2,
  },
  eyebrow: {
    fontFamily: Outfit.semiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  sectionTitle: {
    fontFamily: Outfit.semiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  inputShell: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  input: {
    fontFamily: Outfit.medium,
    fontSize: 15,
    lineHeight: 20,
    paddingVertical: 0,
  },
  modeGrid: {
    gap: 10,
  },
  modeCard: {
    minHeight: 112,
    borderWidth: 1,
    borderRadius: 22,
    borderCurve: "continuous",
    padding: 15,
    gap: 10,
  },
  modeTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modeIcon: {
    width: 42,
    height: 42,
    borderRadius: 15,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  checkDot: {
    width: 24,
    height: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTitle: {
    fontFamily: Outfit.semiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  modeDescription: {
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  optionChip: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
  },
  optionChipText: {
    fontFamily: Outfit.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  customDuration: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    paddingHorizontal: 14,
    gap: 10,
  },
  customInput: {
    flex: 1,
    fontFamily: Outfit.semiBold,
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 0,
  },
  customSuffix: {
    fontFamily: Outfit.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  locationCard: {
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 16,
    gap: 16,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  locationCopy: {
    flex: 1,
    gap: 2,
  },
  locationTitle: {
    fontFamily: Outfit.semiBold,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: -0.1,
  },
  locationDescription: {
    fontFamily: Outfit.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  radiusBlock: {
    gap: 10,
  },
  radiusLabel: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  radiusGrid: {
    flexDirection: "row",
    gap: 8,
  },
  radiusCard: {
    flex: 1,
    minHeight: 72,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  radiusValue: {
    fontFamily: Outfit.bold,
    fontSize: 20,
    lineHeight: 25,
    fontVariant: ["tabular-nums"],
  },
  radiusUnit: {
    fontFamily: Outfit.medium,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 18,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    marginTop: 2,
  },
  primaryButtonText: {
    fontFamily: Outfit.bold,
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
});
