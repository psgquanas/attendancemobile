import { Stack, useRouter } from "expo-router";
import {
  ArrowUpRight,
  BookOpen,
  Calendar1,
  GraduationCap,
  Layers3,
  Plus,
  Radio,
  Sparkles,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
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
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/axios";
import { toast } from "sonner-native";

const CREATE_SHEET_HEIGHT = 440;
const CLOSED_Y = CREATE_SHEET_HEIGHT;
const OPEN_Y = 0;

interface MyClass {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
  _count?: {
    students: number;
  };
  sessions?: number;
  members?: number;
  avgAttendance?: number;
}

interface JoinedClass {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt: string;
  lecturer?: {
    name: string;
  } | null;
  isLive?: boolean;
  attendance?: number;
  sessionsLeft?: string;
  host?: string;
}

type Palette = (typeof Colors)[keyof typeof Colors];

function StatCard({
  label,
  value,
  helper,
  icon,
  color,
  colors,
  width,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  color: string;
  colors: Palette;
  width: number;
}) {
  return (
    <View
      style={[
        styles.statCard,
        {
          width,
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <View style={[styles.statIconWrap, { backgroundColor: `${color}14` }]}>
        {icon}
      </View>
      <Text style={[styles.statLabel, { color: colors.text }]} selectable>
        {label}
      </Text>
      <Text
        style={[styles.statValue, { color: colors.text }]}
        selectable
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text
        style={[styles.statHelper, { color: colors.textSecondary }]}
        selectable
      >
        {helper}
      </Text>
    </View>
  );
}

function SegmentButton({
  active,
  label,
  count,
  colors,
  onPress,
}: {
  active: boolean;
  label: string;
  count: number;
  colors: Palette;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.segmentButton,
        {
          backgroundColor: active ? colors.primary : colors.backgroundSelected,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.segmentLabel,
          { color: active ? colors.primaryForeground : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.segmentBadge,
          {
            backgroundColor: active
              ? colors.primaryForeground
              : colors.backgroundElement,
          },
        ]}
      >
        <Text
          style={[
            styles.segmentBadgeText,
            { color: active ? colors.primary : colors.text },
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function MyClassCard({ item, colors }: { item: MyClass; colors: Palette }) {
  const sessions = item.sessions ?? 0;
  const members = item._count?.students ?? 0;
  const avgAttendance = item.avgAttendance ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.classCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.classAccent, { backgroundColor: colors.primary }]} />

      <View style={styles.classBody}>
        <View style={styles.classHeader}>
          <View style={styles.classTitleBlock}>
            <Text
              style={[styles.classTitle, { color: colors.text }]}
              selectable
            >
              {item.name}
            </Text>
            <View
              style={[
                styles.codeChip,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Text
                style={[styles.codeChipText, { color: colors.primary }]}
                selectable
              >
                {item.code}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.classMetaChip,
              { backgroundColor: `${colors.primary}14` },
            ]}
          >
            <Sparkles size={13} color={colors.primary} strokeWidth={2} />
            <Text
              style={[styles.classMetaChipText, { color: colors.primary }]}
              selectable
            >
              Managed
            </Text>
          </View>
        </View>

        <View style={styles.classStatsRow}>
          <View style={styles.classStat}>
            <Calendar1
              size={15}
              color={colors.textSecondary}
              strokeWidth={1.8}
            />
            <Text
              style={[styles.classStatValue, { color: colors.text }]}
              selectable
            >
              {sessions}
            </Text>
            <Text
              style={[styles.classStatLabel, { color: colors.textSecondary }]}
              selectable
            >
              Sessions
            </Text>
          </View>

          <View
            style={[
              styles.classStatDivider,
              { backgroundColor: colors.backgroundSelected },
            ]}
          />

          <View style={styles.classStat}>
            <Users size={15} color={colors.textSecondary} strokeWidth={1.8} />
            <Text
              style={[styles.classStatValue, { color: colors.text }]}
              selectable
            >
              {members}
            </Text>
            <Text
              style={[styles.classStatLabel, { color: colors.textSecondary }]}
              selectable
            >
              Members
            </Text>
          </View>

          <View
            style={[
              styles.classStatDivider,
              { backgroundColor: colors.backgroundSelected },
            ]}
          />

          <View style={styles.classStat}>
            <Layers3 size={15} color={colors.textSecondary} strokeWidth={1.8} />
            <Text
              style={[styles.classStatValue, { color: colors.text }]}
              selectable
            >
              {avgAttendance}%
            </Text>
            <Text
              style={[styles.classStatLabel, { color: colors.textSecondary }]}
              selectable
            >
              Attendance
            </Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text
            style={[styles.progressLabel, { color: colors.textSecondary }]}
            selectable
          >
            Average attendance
          </Text>
          <Text
            style={[styles.progressValue, { color: colors.primary }]}
            selectable
          >
            {avgAttendance}%
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.backgroundSelected },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${avgAttendance}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

function JoinedClassCard({
  item,
  colors,
}: {
  item: JoinedClass;
  colors: Palette;
}) {
  const isLive = item.isLive ?? false;
  const host = item.lecturer?.name ?? item.host ?? "Instructor";
  const sessionsLeft = item.sessionsLeft ?? "0 sessions left";
  const attendance = item.attendance ?? 0;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.classCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View
        style={[styles.classAccent, { backgroundColor: colors.secondary }]}
      />

      <View style={styles.classBody}>
        <View style={styles.classHeader}>
          <View style={styles.classTitleBlock}>
            <View style={styles.titleRow}>
              <Text
                style={[styles.classTitle, { color: colors.text, flex: 1 }]}
                selectable
              >
                {item.name}
              </Text>
              {isLive ? (
                <View
                  style={[
                    styles.liveBadge,
                    {
                      backgroundColor: `${colors.destructive}18`,
                      borderColor: colors.destructive,
                    },
                  ]}
                >
                  <Radio size={11} color={colors.destructive} strokeWidth={2} />
                  <Text
                    style={[
                      styles.liveBadgeText,
                      { color: colors.destructive },
                    ]}
                    selectable
                  >
                    Live
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[styles.hostText, { color: colors.textSecondary }]}
              selectable
            >
              Hosted by {host}
            </Text>
          </View>
        </View>

        <View style={styles.joinedMetaRow}>
          <View
            style={[
              styles.joinedMetaChip,
              { backgroundColor: colors.primaryMuted },
            ]}
          >
            <UserPlus size={13} color={colors.primary} strokeWidth={2} />
            <Text
              style={[styles.joinedMetaText, { color: colors.primary }]}
              selectable
            >
              {sessionsLeft}
            </Text>
          </View>
          <View
            style={[
              styles.joinedMetaChip,
              { backgroundColor: colors.backgroundSelected },
            ]}
          >
            <Layers3 size={13} color={colors.textSecondary} strokeWidth={2} />
            <Text
              style={[styles.joinedMetaText, { color: colors.textSecondary }]}
              selectable
            >
              {attendance}% attendance
            </Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text
            style={[styles.progressLabel, { color: colors.textSecondary }]}
            selectable
          >
            Your progress
          </Text>
          <Text
            style={[styles.progressValue, { color: colors.secondary }]}
            selectable
          >
            {attendance}%
          </Text>
        </View>
        <View
          style={[
            styles.progressTrack,
            { backgroundColor: colors.backgroundSelected },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${attendance}%`,
                backgroundColor: colors.secondary,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function MyClassesScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const role = (session?.user as any)?.role as string | undefined;
  const isLecturer = role === "LECTURER";

  type TabKey = "my" | "joined";

  // Lecturers default to 'my', students default to 'joined'
  const [activeTab, setActiveTab] = useState<TabKey>(
    isLecturer ? "my" : "joined",
  );
  const { theme } = useAppTheme();
  const colors = Colors[theme];
  const isDark = theme === "dark";
  const { width: screenWidth } = useWindowDimensions();
  const summaryCardWidth = (screenWidth - 40 - 12) / 2;

  // ── Create class sheet state ────────────────────────────────────────
  const [className, setClassName] = useState("");
  const [classDescription, setClassDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const translateY = useSharedValue(CLOSED_Y);
  const startY = useSharedValue(CLOSED_Y);

  const openCreateSheet = () => {
    translateY.value = withTiming(OPEN_Y, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  };

  const closeCreateSheet = () => {
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

  const animatedProps = useAnimatedProps(() => ({
    pointerEvents: (translateY.value < CLOSED_Y - 10 ? "auto" : "none") as
      | "auto"
      | "none",
  }));

  const handleCreateClass = async () => {
    if (!className.trim()) return;
    setCreating(true);
    try {
      await api.post("/api/classes", {
        name: className.trim(),
        description: classDescription.trim() || undefined,
      });
      toast.success("Class created successfully");
      setClassName("");
      setClassDescription("");
      closeCreateSheet();
      fetchClasses();
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.message || "Failed to create class";
      toast.error(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const [classCode, setClassCode] = useState("");
  const [joining, setJoining] = useState(false);

  const [myClasses, setMyClasses] = useState<MyClass[]>([]);
  const [joinedClasses, setJoinedClasses] = useState<JoinedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  function extractClasses(
    data: any,
    isLecturer: boolean,
  ): {
    myClasses: MyClass[];
    joinedClasses: JoinedClass[];
  } {
    if (isLecturer) {
      return {
        myClasses: (data.owned ?? []).map((c: any) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          description: c.description,
          createdAt: c.createdAt,
          _count: c._count,
          sessions: c.sessions ?? 0,
          members: c._count?.students ?? 0,
          avgAttendance: c.avgAttendance ?? 0,
        })),
        joinedClasses: [],
      };
    }

    return {
      myClasses: [],
      joinedClasses: (data.enrolled ?? []).map((c: any) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        description: c.description,
        createdAt: c.createdAt,
        lecturer: c.lecturer,
        isLive: c.isLive ?? false,
        attendance: c.attendance ?? 0,
        sessionsLeft: c.sessionsLeft,
        host: c.lecturer?.name,
      })),
    };
  }

  const fetchClasses = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      try {
        const response = await api.get("/api/classes");
        const payload = response.data?.data ?? response.data;
        const { myClasses: fetchedMy, joinedClasses: fetchedJoined } =
          extractClasses(payload, isLecturer);
        setMyClasses(fetchedMy);
        setJoinedClasses(fetchedJoined);
      } catch (error: any) {
        const errorMsg =
          error?.response?.data?.message || "Failed to load classes";
        toast.error(errorMsg);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLecturer],
  );

  const userId = session?.user?.id;
  useEffect(() => {
    if (!isPending && userId) {
      fetchClasses();
    }
  }, [isPending, userId, fetchClasses]);

  const joinTranslateY = useSharedValue(CLOSED_Y);
  const joinStartY = useSharedValue(CLOSED_Y);

  const openJoinSheet = () => {
    joinTranslateY.value = withTiming(OPEN_Y, {
      duration: 380,
      easing: Easing.out(Easing.cubic),
    });
  };

  const closeJoinSheet = () => {
    joinTranslateY.value = withTiming(CLOSED_Y, {
      duration: 300,
      easing: Easing.in(Easing.cubic),
    });
  };

  const joinPanGesture = Gesture.Pan()
    .onBegin(() => {
      joinStartY.value = joinTranslateY.value;
    })
    .onUpdate((e) => {
      const next = joinStartY.value + e.translationY;
      joinTranslateY.value = Math.max(OPEN_Y, Math.min(CLOSED_Y, next));
    })
    .onEnd((e) => {
      if (e.translationY > 80 || e.velocityY > 600) {
        joinTranslateY.value = withTiming(CLOSED_Y, {
          duration: 300,
          easing: Easing.in(Easing.cubic),
        });
      } else {
        joinTranslateY.value = withTiming(OPEN_Y, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      }
    });

  const joinSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: joinTranslateY.value }],
  }));

  const joinBackdropStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      joinTranslateY.value,
      [OPEN_Y, CLOSED_Y],
      [1, 0],
      Extrapolation.CLAMP,
    );
    return { opacity };
  });

  const joinAnimatedProps = useAnimatedProps(() => ({
    pointerEvents: (joinTranslateY.value < CLOSED_Y - 10 ? "auto" : "none") as
      | "auto"
      | "none",
  }));

  const handleJoinClass = async () => {
    if (!classCode.trim()) return;
    setJoining(true);
    try {
      await api.post("/api/classes/join", {
        code: classCode.trim(),
      });
      toast.success("Successfully joined the class");
      setClassCode("");
      closeJoinSheet();
      fetchClasses();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to join class";
      toast.error(errorMsg);
    } finally {
      setJoining(false);
    }
  };

  const summary = {
    myCount: myClasses.length,
    joinedCount: joinedClasses.length,
    liveCount: joinedClasses.filter((item) => item.isLive).length,
    memberCount: myClasses.reduce(
      (total, item) => total + (item._count?.students ?? 0),
      0,
    ),
  };

  const visibleClasses = isLecturer ? myClasses : joinedClasses;

  if (
    isPending ||
    (loading && myClasses.length === 0 && joinedClasses.length === 0)
  ) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <ActivityIndicator
          color={colors.primary}
          size="large"
          style={{ flex: 1 }}
        />
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: colors.background }]}
        edges={["top"]}
      >
        <Stack.Screen options={{ title: "Classes" }} />
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={colors.background}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchClasses(true)}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.heroBlock}>
            <View style={styles.heroHeader}>
              <View style={styles.heroCopy}>
                <Text
                  style={[styles.kicker, { color: colors.textSecondary }]}
                  selectable
                >
                  Class overview
                </Text>
                <Text
                  style={[styles.heroTitle, { color: colors.text }]}
                  selectable
                >
                  {isLecturer
                    ? "Manage your classes and track attendance"
                    : "Organize your courses and stay on top"}
                </Text>
                <Text
                  style={[styles.heroSubtitle, { color: colors.textSecondary }]}
                  selectable
                >
                  {isLecturer
                    ? "A quick snapshot of your classes, members, and live sessions."
                    : "A quick snapshot of active classes, attendance, and what is live right now."}
                </Text>
              </View>

              <View
                style={[styles.heroBadge, { backgroundColor: colors.primary }]}
              >
                <GraduationCap
                  size={18}
                  color={colors.primaryForeground}
                  strokeWidth={1.9}
                />
                <Text style={styles.heroBadgeText} selectable>
                  {summary.liveCount} live
                </Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              {isLecturer ? (
                <>
                  <StatCard
                    label="My classes"
                    value={`${summary.myCount}`}
                    helper="Created by you"
                    icon={
                      <Sparkles
                        size={18}
                        color={colors.primary}
                        strokeWidth={1.9}
                      />
                    }
                    color={colors.primary}
                    colors={colors}
                    width={summaryCardWidth}
                  />
                  <StatCard
                    label="Live now"
                    value={`${summary.liveCount}`}
                    helper="Needs attention"
                    icon={
                      <Radio
                        size={18}
                        color={colors.destructive}
                        strokeWidth={1.9}
                      />
                    }
                    color={colors.destructive}
                    colors={colors}
                    width={summaryCardWidth}
                  />
                  <StatCard
                    label="Total members"
                    value={`${summary.memberCount}`}
                    helper="Across your classes"
                    icon={
                      <Users
                        size={18}
                        color={colors.primary}
                        strokeWidth={1.9}
                      />
                    }
                    color={colors.primary}
                    colors={colors}
                    width={summaryCardWidth}
                  />
                </>
              ) : (
                <>
                  <StatCard
                    label="Joined classes"
                    value={`${summary.joinedCount}`}
                    helper="Visible on your feed"
                    icon={
                      <Layers3
                        size={18}
                        color={colors.secondary}
                        strokeWidth={1.9}
                      />
                    }
                    color={colors.secondary}
                    colors={colors}
                    width={summaryCardWidth}
                  />
                  <StatCard
                    label="Live now"
                    value={`${summary.liveCount}`}
                    helper="Happening now"
                    icon={
                      <Radio
                        size={18}
                        color={colors.destructive}
                        strokeWidth={1.9}
                      />
                    }
                    color={colors.destructive}
                    colors={colors}
                    width={summaryCardWidth}
                  />
                </>
              )}
            </View>
          </View>

          {isLecturer ? (
            <View style={styles.segmentRow}>
              <SegmentButton
                active={true}
                label="My Classes"
                count={summary.myCount}
                colors={colors}
                onPress={() => {}}
              />
            </View>
          ) : (
            <View style={styles.segmentRow}>
              <SegmentButton
                active={true}
                label="Joined"
                count={summary.joinedCount}
                colors={colors}
                onPress={() => {}}
              />
            </View>
          )}

          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleBlock}>
              <Text
                style={[styles.sectionTitle, { color: colors.text }]}
                selectable
              >
                {isLecturer ? "Your classes" : "Joined classes"}
              </Text>
              <Text
                style={[styles.sectionMeta, { color: colors.textSecondary }]}
                selectable
              >
                {visibleClasses.length} total
              </Text>
            </View>
            <Pressable
              onPress={() => router.push("/(classes)/classeslist")}
              style={({ pressed }) => [
                styles.viewAllButton,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <Text
                style={[styles.viewAllButtonText, { color: colors.text }]}
                selectable
              >
                View all
              </Text>
              <ArrowUpRight
                size={15}
                color={colors.textSecondary}
                strokeWidth={2.2}
              />
            </Pressable>
          </View>

          <View style={styles.classList}>
            {isLecturer
              ? myClasses.map((item) => (
                  <MyClassCard key={item.id} item={item} colors={colors} />
                ))
              : joinedClasses.map((item) => (
                  <JoinedClassCard key={item.id} item={item} colors={colors} />
                ))}
          </View>

          <View
            style={[
              styles.footerCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <View style={styles.footerCopy}>
              <Text
                style={[styles.footerLabel, { color: colors.textSecondary }]}
                selectable
              >
                Quick action
              </Text>
              <Text
                style={[styles.footerTitle, { color: colors.text }]}
                selectable
              >
                {isLecturer
                  ? "Create a new class or invite more students"
                  : "Enter a class code to join a session"}
              </Text>
            </View>
            <Pressable
              onPress={isLecturer ? openCreateSheet : openJoinSheet}
              style={({ pressed }) => [
                styles.footerButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.86 : 1,
                },
              ]}
            >
              {isLecturer ? (
                <>
                  <Plus
                    size={16}
                    color={colors.primaryForeground}
                    strokeWidth={2.3}
                  />
                  <Text
                    style={[
                      styles.footerButtonText,
                      { color: colors.primaryForeground },
                    ]}
                    selectable
                  >
                    New
                  </Text>
                </>
              ) : (
                <>
                  <UserPlus
                    size={16}
                    color={colors.primaryForeground}
                    strokeWidth={2.3}
                  />
                  <Text
                    style={[
                      styles.footerButtonText,
                      { color: colors.primaryForeground },
                    ]}
                    selectable
                  >
                    Join
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Dim backdrop */}
      <Animated.View
        style={[styles.backdrop, backdropStyle]}
        animatedProps={animatedProps}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeCreateSheet} />
      </Animated.View>

      {/* Create class bottom sheet */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.createSheet,
            { backgroundColor: colors.backgroundElement },
            sheetStyle,
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            {/* Drag handle */}
            <View style={styles.handleRow}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              />
            </View>

            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Create a new class
                </Text>
                <Text
                  style={[styles.sheetSub, { color: colors.textSecondary }]}
                >
                  Fill in the details to set up your class
                </Text>
              </View>
              <Pressable
                onPress={closeCreateSheet}
                style={[
                  styles.closeBtn,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              >
                <X size={16} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>

            {/* Inputs */}
            <View style={styles.inputsBlock}>
              <View>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Class Name
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.backgroundSelected,
                    },
                  ]}
                >
                  <BookOpen
                    size={16}
                    color={colors.textSecondary}
                    strokeWidth={1.8}
                  />
                  <TextInput
                    style={[styles.textInput, { color: colors.text }]}
                    placeholder="e.g. Introduction to Biology"
                    placeholderTextColor={colors.textSecondary}
                    value={className}
                    onChangeText={setClassName}
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Description
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    styles.textAreaWrap,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.backgroundSelected,
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.textInput,
                      styles.textArea,
                      { color: colors.text },
                    ]}
                    placeholder="What is this class about?"
                    placeholderTextColor={colors.textSecondary}
                    value={classDescription}
                    onChangeText={setClassDescription}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                </View>
              </View>
            </View>

            {/* Create button */}
            <Pressable
              onPress={handleCreateClass}
              disabled={creating || !className.trim()}
              style={({ pressed }) => [
                styles.createBtn,
                { backgroundColor: colors.primary },
                (pressed || creating) && { opacity: 0.8 },
                !className.trim() && { opacity: 0.5 },
              ]}
            >
              {creating ? (
                <ActivityIndicator
                  color={colors.primaryForeground}
                  size="small"
                />
              ) : (
                <>
                  <Plus
                    size={17}
                    color={colors.primaryForeground}
                    strokeWidth={2.4}
                  />
                  <Text
                    style={[
                      styles.createBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Create Class
                  </Text>
                </>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>

      {/* Join class backdrop */}
      <Animated.View
        style={[styles.backdrop, joinBackdropStyle]}
        animatedProps={joinAnimatedProps}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={closeJoinSheet} />
      </Animated.View>

      {/* Join class bottom sheet */}
      <GestureDetector gesture={joinPanGesture}>
        <Animated.View
          style={[
            styles.createSheet,
            { backgroundColor: colors.backgroundElement },
            joinSheetStyle,
          ]}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1 }}
          >
            {/* Drag handle */}
            <View style={styles.handleRow}>
              <View
                style={[
                  styles.handle,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              />
            </View>

            {/* Sheet header */}
            <View style={styles.sheetHeader}>
              <View>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>
                  Join a class
                </Text>
                <Text
                  style={[styles.sheetSub, { color: colors.textSecondary }]}
                >
                  Enter the code shared by your lecturer
                </Text>
              </View>
              <Pressable
                onPress={closeJoinSheet}
                style={[
                  styles.closeBtn,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              >
                <X size={16} color={colors.textSecondary} strokeWidth={2} />
              </Pressable>
            </View>

            {/* Code input */}
            <View style={[styles.inputsBlock, { marginBottom: 28 }]}>
              <View>
                <Text
                  style={[styles.inputLabel, { color: colors.textSecondary }]}
                >
                  Class Code
                </Text>
                <View
                  style={[
                    styles.inputWrap,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.backgroundSelected,
                    },
                  ]}
                >
                  <UserPlus
                    size={16}
                    color={colors.textSecondary}
                    strokeWidth={1.8}
                  />
                  <TextInput
                    style={[
                      styles.textInput,
                      { color: colors.text, letterSpacing: 2 },
                    ]}
                    placeholder="e.g. ABCD-1234"
                    placeholderTextColor={colors.textSecondary}
                    value={classCode}
                    onChangeText={setClassCode}
                    autoCorrect={false}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </View>

            {/* Join button */}
            <Pressable
              onPress={handleJoinClass}
              disabled={joining || !classCode.trim()}
              style={({ pressed }) => [
                styles.createBtn,
                { backgroundColor: colors.secondary },
                (pressed || joining) && { opacity: 0.8 },
                !classCode.trim() && { opacity: 0.5 },
              ]}
            >
              {joining ? (
                <ActivityIndicator
                  color={colors.primaryForeground}
                  size="small"
                />
              ) : (
                <>
                  <UserPlus
                    size={17}
                    color={colors.primaryForeground}
                    strokeWidth={2.4}
                  />
                  <Text
                    style={[
                      styles.createBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Join Class
                  </Text>
                </>
              )}
            </Pressable>
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 128,
    gap: 18,
  },

  heroBlock: {
    gap: 16,
  },
  heroHeader: {
    gap: 14,
  },
  heroCopy: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.medium,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: Outfit.bold,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Outfit.regular,
  },
  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroBadgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
    color: "#FFFFFF",
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Outfit.bold,
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
  },
  statHelper: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.regular,
  },

  segmentRow: {
    flexDirection: "row",
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },
  segmentBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 7,
  },
  segmentBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.bold,
    fontVariant: ["tabular-nums"],
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitleBlock: {
    flex: 1,
    gap: 2,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Outfit.bold,
    letterSpacing: -0.2,
  },
  sectionMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.medium,
  },
  viewAllButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  viewAllButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },

  classList: {
    gap: 12,
  },
  classCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 22,
    overflow: "hidden",
    borderCurve: "continuous",
  },
  classAccent: {
    width: 5,
  },
  classBody: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  classHeader: {
    gap: 10,
  },
  classTitleBlock: {
    gap: 8,
  },
  classTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Outfit.semiBold,
    letterSpacing: -0.2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  codeChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  codeChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.semiBold,
    letterSpacing: 0.4,
  },
  classMetaChip: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  classMetaChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.semiBold,
  },
  classStatsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  classStat: {
    flex: 1,
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 4,
  },
  classStatValue: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Outfit.bold,
    fontVariant: ["tabular-nums"],
  },
  classStatLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.regular,
  },
  classStatDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  progressLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.medium,
  },
  progressValue: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.bold,
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    width: "100%",
    height: 7,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  liveBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: Outfit.bold,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  hostText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.regular,
  },
  joinedMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  joinedMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  joinedMetaText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.semiBold,
  },

  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  footerCopy: {
    flex: 1,
    gap: 4,
  },
  footerLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.medium,
    textTransform: "uppercase",
    letterSpacing: 0.7,
  },
  footerTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Outfit.bold,
  },
  footerButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  footerButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },

  // ── Create class bottom sheet ─────────────────────────────────────
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  createSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: CREATE_SHEET_HEIGHT,
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
  sheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 18,
    gap: 12,
  },
  sheetTitle: {
    fontFamily: Outfit.bold,
    fontSize: 18,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  sheetSub: {
    fontFamily: Outfit.regular,
    fontSize: 13,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  inputsBlock: {
    gap: 14,
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textAreaWrap: {
    alignItems: "flex-start",
    paddingVertical: 14,
  },
  textInput: {
    flex: 1,
    fontFamily: Outfit.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  textArea: {
    height: 72,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 52,
    borderRadius: 999,
  },
  createBtnText: {
    fontFamily: Outfit.bold,
    fontSize: 15,
    letterSpacing: 0.3,
  },
});
