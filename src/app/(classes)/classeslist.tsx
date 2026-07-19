import { Stack, useRouter } from "expo-router";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Radio,
  Search,
  Users,
} from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/axios";
import { toast } from "sonner-native";

type Palette = (typeof Colors)[keyof typeof Colors];
type UserRole = "LECTURER" | "STUDENT" | string;

type ClassListItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  createdAt?: string;
  lecturerName?: string;
  members: number;
  sessions: number;
  attendance: number;
  isLive: boolean;
};

function normalizeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function mapOwnedClass(item: any): ClassListItem {
  return {
    id: String(item.id),
    name: item.name ?? "Untitled class",
    code: item.code ?? "NO-CODE",
    description: item.description,
    createdAt: item.createdAt,
    members: normalizeNumber(item._count?.students ?? item.members),
    sessions: normalizeNumber(item.sessions),
    attendance: clampPercent(normalizeNumber(item.avgAttendance)),
    isLive: Boolean(item.isLive),
  };
}

function mapJoinedClass(item: any): ClassListItem {
  return {
    id: String(item.id),
    name: item.name ?? "Untitled class",
    code: item.code ?? "NO-CODE",
    description: item.description,
    createdAt: item.createdAt,
    lecturerName: item.lecturer?.name ?? item.host ?? "Lecturer",
    members: normalizeNumber(item.members),
    sessions: normalizeNumber(item.sessions),
    attendance: clampPercent(normalizeNumber(item.attendance)),
    isLive: Boolean(item.isLive),
  };
}

function Metric({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: Palette;
}) {
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricValue, { color: colors.text }]} selectable>
        {value}
      </Text>
      <Text
        style={[styles.metricLabel, { color: colors.textSecondary }]}
        selectable
      >
        {label}
      </Text>
    </View>
  );
}

function ClassCard({
  item,
  colors,
  roleLabel,
  isLecturer,
  onPress,
}: {
  item: ClassListItem;
  colors: Palette;
  roleLabel: string;
  isLecturer: boolean;
  onPress: () => void;
}) {
  const progressValue = clampPercent(item.attendance);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.classCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
          opacity: pressed ? 0.92 : 1,
          transform: [{ scale: pressed ? 0.99 : 1 }],
        },
      ]}
    >
      <View style={styles.classHeader}>
        <View
          style={[
            styles.classMark,
            {
              backgroundColor: isLecturer
                ? colors.primaryMuted
                : `${colors.secondary}18`,
            },
          ]}
        >
          {isLecturer ? (
            <GraduationCap size={19} color={colors.primary} strokeWidth={2} />
          ) : (
            <BookOpen size={19} color={colors.secondary} strokeWidth={2} />
          )}
        </View>

        <View style={styles.classTitleBlock}>
          <View style={styles.classTopLine}>
            <Text
              style={[styles.classTitle, { color: colors.text }]}
              numberOfLines={1}
              selectable
            >
              {item.name}
            </Text>
            {item.isLive ? (
              <View
                style={[
                  styles.livePill,
                  {
                    backgroundColor: `${colors.destructive}14`,
                    borderColor: colors.destructive,
                  },
                ]}
              >
                <Radio size={10} color={colors.destructive} strokeWidth={2.4} />
                <Text
                  style={[styles.liveText, { color: colors.destructive }]}
                  selectable
                >
                  Live
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            style={[styles.classSubline, { color: colors.textSecondary }]}
            numberOfLines={1}
            selectable
          >
            {isLecturer ? roleLabel : `Lecturer: ${item.lecturerName}`}
          </Text>

          <View
            style={[
              styles.metricsRow,
              { backgroundColor: colors.background, borderColor: colors.backgroundSelected },
            ]}
          >
            <Metric
              label={isLecturer ? "Students" : "Classmates"}
              value={String(item.members)}
              colors={colors}
            />
            <Metric label="Sessions" value={String(item.sessions)} colors={colors} />
            <Metric label="Attendance" value={`${progressValue}%`} colors={colors} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function EmptyState({
  colors,
  isLecturer,
  hasSearch,
}: {
  colors: Palette;
  isLecturer: boolean;
  hasSearch: boolean;
}) {
  return (
    <View
      style={[
        styles.emptyState,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <View style={[styles.emptyIcon, { backgroundColor: colors.primaryMuted }]}>
        <BookOpen size={24} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]} selectable>
        {hasSearch
          ? "No matching classes"
          : isLecturer
            ? "No created classes yet"
            : "No joined classes yet"}
      </Text>
      <Text style={[styles.emptyCopy, { color: colors.textSecondary }]} selectable>
        {hasSearch
          ? "Try a different class name, lecturer, or code."
          : isLecturer
            ? "Create a class to start tracking attendance and student activity."
            : "Join a class with a lecturer code to see sessions and attendance."}
      </Text>
    </View>
  );
}

export default function ClassesListScreen() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const { theme } = useAppTheme();
  const colors = Colors[theme];
  const userRole = ((session?.user as any)?.role ?? "STUDENT") as UserRole;
  const isLecturer = userRole === "LECTURER";

  const [classes, setClasses] = useState<ClassListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  const roleCopy = isLecturer
    ? {
        title: "Created classes",
        subtitle: "Monitor the classes you own, recent activity, and attendance health.",
        kicker: "Lecturer workspace",
        statLabel: "Created",
      }
    : {
        title: "Joined classes",
        subtitle: "Keep track of every class you are enrolled in and what needs attention.",
        kicker: "Student workspace",
        statLabel: "Joined",
      };

  const loadClasses = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await api.get("/api/classes");
        const payload = response.data?.data ?? response.data ?? {};
        const source = isLecturer ? payload.owned : payload.enrolled;
        const nextClasses = Array.isArray(source)
          ? source.map(isLecturer ? mapOwnedClass : mapJoinedClass)
          : [];

        setClasses(nextClasses);
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Failed to load your classes";
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isLecturer],
  );

  useEffect(() => {
    if (!isPending && session?.user?.id) {
      loadClasses();
    }
  }, [isPending, loadClasses, session?.user?.id]);

  const filteredClasses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return classes;

    return classes.filter((item) => {
      const searchable = [
        item.name,
        item.code,
        item.description ?? "",
        item.lecturerName ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedQuery);
    });
  }, [classes, query]);

  const liveCount = classes.filter((item) => item.isLive).length;
  const averageAttendance =
    classes.length === 0
      ? 0
      : Math.round(
          classes.reduce((total, item) => total + item.attendance, 0) /
            classes.length,
        );

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <Stack.Screen options={{ title: roleCopy.title }} />
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadClasses(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.hero}>
          <View style={styles.heroTop}>
            <View style={styles.heroCopy}>
              <Text style={[styles.kicker, { color: colors.primary }]} selectable>
                {roleCopy.kicker}
              </Text>
              <Text style={[styles.title, { color: colors.text }]} selectable>
                {roleCopy.title}
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
                selectable
              >
                {roleCopy.subtitle}
              </Text>
            </View>

            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isLecturer
                    ? colors.primaryMuted
                    : `${colors.secondary}18`,
                },
              ]}
            >
              {isLecturer ? (
                <GraduationCap size={15} color={colors.primary} strokeWidth={2} />
              ) : (
                <Users size={15} color={colors.secondary} strokeWidth={2} />
              )}
              <Text
                style={[
                  styles.roleBadgeText,
                  { color: isLecturer ? colors.primary : colors.secondary },
                ]}
                selectable
              >
                {isLecturer ? "Lecturer" : "Student"}
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {classes.length}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                {roleCopy.statLabel}
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <Radio
                size={18}
                color={liveCount > 0 ? colors.destructive : colors.textSecondary}
                strokeWidth={2.2}
              />
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {liveCount}
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Live now
              </Text>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <Clock3 size={18} color={colors.secondary} strokeWidth={2.2} />
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                {averageAttendance}%
              </Text>
              <Text
                style={[styles.summaryLabel, { color: colors.textSecondary }]}
              >
                Avg attendance
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <Search size={17} color={colors.textSecondary} strokeWidth={2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search classes or codes"
            placeholderTextColor={colors.textSecondary}
            style={[styles.searchInput, { color: colors.text }]}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.text }]} selectable>
            {query.trim() ? "Search results" : "All classes"}
          </Text>
          <Text style={[styles.listCount, { color: colors.textSecondary }]}>
            {filteredClasses.length} shown
          </Text>
        </View>

        {loading || isPending ? (
          <View
            style={[
              styles.loadingCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <ActivityIndicator color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading your classes
            </Text>
          </View>
        ) : filteredClasses.length > 0 ? (
          <View style={styles.classList}>
            {filteredClasses.map((item) => (
              <ClassCard
                key={item.id}
                item={item}
                colors={colors}
                roleLabel="Created by you"
                isLecturer={isLecturer}
                onPress={() =>
                  router.push({
                    pathname: "/(classes)/[id]",
                    params: { id: item.id },
                  })
                }
              />
            ))}
          </View>
        ) : (
          <EmptyState
            colors={colors}
            isLecturer={isLecturer}
            hasSearch={Boolean(query.trim())}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 44,
    gap: 18,
  },
  hero: {
    gap: 18,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  heroCopy: {
    flex: 1,
    gap: 7,
  },
  kicker: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Outfit.bold,
    fontSize: 30,
    lineHeight: 35,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontFamily: Outfit.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  roleBadgeText: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: "continuous",
    padding: 14,
    gap: 6,
  },
  summaryValue: {
    fontFamily: Outfit.bold,
    fontSize: 22,
    lineHeight: 26,
    letterSpacing: -0.4,
    fontVariant: ["tabular-nums"],
  },
  summaryLabel: {
    fontFamily: Outfit.medium,
    fontSize: 11,
    lineHeight: 15,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontFamily: Outfit.regular,
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 0,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  listTitle: {
    fontFamily: Outfit.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  listCount: {
    fontFamily: Outfit.medium,
    fontSize: 13,
    lineHeight: 18,
    fontVariant: ["tabular-nums"],
  },
  classList: {
    gap: 12,
  },
  classCard: {
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 16,
  },
  classHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  classMark: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  classTitleBlock: {
    flex: 1,
    gap: 8,
  },
  classTopLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  classTitle: {
    flex: 1,
    fontFamily: Outfit.semiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  classSubline: {
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveText: {
    fontFamily: Outfit.bold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  metricsRow: {
    flexDirection: "row",
    alignSelf: "stretch",
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    borderCurve: "continuous",
    paddingHorizontal: 10,
    paddingVertical: 9,
    gap: 6,
  },
  metric: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },
  metricValue: {
    fontFamily: Outfit.bold,
    fontSize: 16,
    lineHeight: 20,
    letterSpacing: -0.2,
    fontVariant: ["tabular-nums"],
  },
  metricLabel: {
    fontFamily: Outfit.medium,
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
  },
  loadingCard: {
    minHeight: 150,
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loadingText: {
    fontFamily: Outfit.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    minHeight: 230,
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    gap: 10,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 20,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  emptyTitle: {
    fontFamily: Outfit.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  emptyCopy: {
    maxWidth: 270,
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
