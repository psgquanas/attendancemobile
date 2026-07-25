import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  PlayCircle,
  SearchX,
  UserRound,
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
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/axios";

type Palette = (typeof Colors)[keyof typeof Colors];
type DetailTab = "students" | "attendance" | "sessions";
type UserRole = "LECTURER" | "STUDENT" | string;

type StudentItem = {
  id: string;
  name: string;
  email?: string | null;
  attendance?: number;
  status?: string;
};

type AttendanceItem = {
  id: string;
  studentName?: string;
  sessionName?: string;
  status?: string;
  value?: number;
};

type SessionItem = {
  id: string;
  title: string;
  status?: string;
  attendanceCount?: number;
  totalStudents?: number;
};

type ClassDetail = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  lecturerName: string;
  members: number;
  sessionsCount: number;
  attendanceAverage: number;
  isLive: boolean;
  students: StudentItem[];
  attendance: AttendanceItem[];
  sessions: SessionItem[];
};

function normalizeNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function optionalNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value)
    ? value
    : undefined;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function getStudentName(item: any) {
  return item.name ?? item.student?.name ?? item.user?.name ?? "Student";
}

function mapStudent(item: any, index: number): StudentItem {
  return {
    id: String(item.id ?? item.studentId ?? item.userId ?? index),
    name: getStudentName(item),
    email: item.email ?? item.student?.email ?? item.user?.email,
    attendance:
      typeof item.attendance === "number"
        ? clampPercent(item.attendance)
        : undefined,
    status: item.status,
  };
}

function mapAttendance(item: any, index: number): AttendanceItem {
  return {
    id: String(item.id ?? `${item.studentId ?? "attendance"}-${index}`),
    studentName: item.studentName ?? item.student?.name ?? item.user?.name,
    sessionName: item.sessionName ?? item.session?.title ?? item.session?.name,
    status: item.status ?? item.state,
    value:
      typeof item.attendance === "number"
        ? clampPercent(item.attendance)
        : typeof item.value === "number"
          ? clampPercent(item.value)
          : undefined,
  };
}

function mapSession(item: any, index: number): SessionItem {
  return {
    id: String(item.id ?? `session-${index}`),
    title: item.title ?? item.name ?? `Session ${index + 1}`,
    status: item.status ?? (item.isLive ? "Live" : undefined),
    attendanceCount: optionalNumber(item.attendanceCount ?? item.presentCount),
    totalStudents: optionalNumber(item.totalStudents ?? item.studentsCount),
  };
}

function mapClassDetail(item: any, isLecturer: boolean): ClassDetail {
  const students = asArray(
    item.students ?? item.enrollments ?? item.membersList,
  ).map(mapStudent);
  const sessions = asArray(
    item.sessionList ?? item.attendanceSessions ?? item.sessionsList,
  ).map(mapSession);
  const attendance = asArray(
    item.attendanceRecords ?? item.attendanceList ?? item.attendanceEntries,
  ).map(mapAttendance);

  return {
    id: String(item.id),
    name: item.name ?? "Untitled class",
    code: item.code ?? "NO-CODE",
    description: item.description,
    lecturerName: isLecturer
      ? "Created by you"
      : (item.lecturer?.name ?? item.host ?? "Lecturer"),
    members: normalizeNumber(
      item._count?.students ?? item.members ?? students.length,
    ),
    sessionsCount: normalizeNumber(
      typeof item.sessions === "number" ? item.sessions : sessions.length,
    ),
    attendanceAverage: clampPercent(
      normalizeNumber(item.avgAttendance ?? item.attendance),
    ),
    isLive: Boolean(item.isLive),
    students,
    attendance,
    sessions,
  };
}

function Pill({
  label,
  colors,
  tone = "neutral",
}: {
  label: string;
  colors: Palette;
  tone?: "primary" | "secondary" | "danger" | "neutral";
}) {
  const toneColor =
    tone === "primary"
      ? colors.primary
      : tone === "secondary"
        ? colors.secondary
        : tone === "danger"
          ? colors.destructive
          : colors.textSecondary;

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: `${toneColor}14`,
          borderColor: `${toneColor}33`,
        },
      ]}
    >
      <Text style={[styles.pillText, { color: toneColor }]}>{label}</Text>
    </View>
  );
}

function StatTile({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colors: Palette;
}) {
  return (
    <View
      style={[
        styles.statTile,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <View style={styles.statTextBlock}>
        <Text
          style={[styles.statValue, { color: colors.text }]}
          numberOfLines={1}
          selectable
        >
          {value}
        </Text>
        <Text
          style={[styles.statLabel, { color: colors.textSecondary }]}
          numberOfLines={1}
          ellipsizeMode="tail"
          selectable
        >
          {label}
        </Text>
      </View>
      <View
        style={[
          styles.statIcon,
          {
            backgroundColor: colors.backgroundSelected,
          },
        ]}
      >
        {icon}
      </View>
    </View>
  );
}

function TabButton({
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
        styles.tabButton,
        {
          backgroundColor: active ? colors.primary : "transparent",
          opacity: pressed ? 0.78 : 1,
        },
      ]}
    >
      <View style={styles.tabLabelRow}>
        <Text
          style={[
            styles.tabLabel,
            {
              color: active ? colors.primaryForeground : colors.textSecondary,
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
        <Text
          style={[
            styles.tabCount,
            {
              backgroundColor: active
                ? `${colors.primaryForeground}24`
                : colors.backgroundSelected,
              color: active ? colors.primaryForeground : colors.textSecondary,
            },
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyPanel({
  title,
  body,
  colors,
}: {
  title: string;
  body: string;
  colors: Palette;
}) {
  return (
    <View
      style={[
        styles.emptyPanel,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <View
        style={[styles.emptyIcon, { backgroundColor: colors.primaryMuted }]}
      >
        <SearchX size={22} color={colors.primary} strokeWidth={2} />
      </View>
      <Text style={[styles.emptyTitle, { color: colors.text }]} selectable>
        {title}
      </Text>
      <Text
        style={[styles.emptyBody, { color: colors.textSecondary }]}
        selectable
      >
        {body}
      </Text>
    </View>
  );
}

function StudentsTab({
  classDetail,
  colors,
}: {
  classDetail: ClassDetail;
  colors: Palette;
}) {
  if (classDetail.students.length === 0) {
    return (
      <EmptyPanel
        colors={colors}
        title="No student roster yet"
        body={`${classDetail.members} student${classDetail.members === 1 ? "" : "s"} are counted for this class. Detailed roster data will appear here when the API returns students.`}
      />
    );
  }

  return (
    <View style={styles.panelList}>
      {classDetail.students.map((student) => (
        <View
          key={student.id}
          style={[
            styles.rowCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View
            style={[styles.avatar, { backgroundColor: colors.primaryMuted }]}
          >
            <UserRound size={17} color={colors.primary} strokeWidth={2} />
          </View>
          <View style={styles.rowBody}>
            <Text
              style={[styles.rowTitle, { color: colors.text }]}
              numberOfLines={1}
              selectable
            >
              {student.name}
            </Text>
            <Text
              style={[styles.rowMeta, { color: colors.textSecondary }]}
              numberOfLines={2}
              selectable
            >
              {student.email ?? student.status ?? "Enrolled student"}
            </Text>
          </View>
          {typeof student.attendance === "number" ? (
            <Pill
              label={`${student.attendance}%`}
              colors={colors}
              tone="secondary"
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

function AttendanceTab({
  classDetail,
  colors,
}: {
  classDetail: ClassDetail;
  colors: Palette;
}) {
  if (classDetail.attendance.length === 0) {
    return (
      <View style={styles.panelList}>
        <View
          style={[
            styles.attendanceCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.attendanceTop}>
            <Text
              style={[styles.attendanceValue, { color: colors.text }]}
              selectable
            >
              {classDetail.attendanceAverage}%
            </Text>
            <Pill label="Average" colors={colors} tone="secondary" />
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
                  width: `${classDetail.attendanceAverage}%`,
                  backgroundColor: colors.secondary,
                },
              ]}
            />
          </View>
          <Text
            style={[styles.attendanceNote, { color: colors.textSecondary }]}
            selectable
          >
            Detailed attendance records will appear here when the API returns
            per-student or per-session entries.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.panelList}>
      {classDetail.attendance.map((item) => (
        <View
          key={item.id}
          style={[
            styles.rowCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: `${colors.secondary}18` },
            ]}
          >
            <CheckCircle2 size={17} color={colors.secondary} strokeWidth={2} />
          </View>
          <View style={styles.rowBody}>
            <Text
              style={[styles.rowTitle, { color: colors.text }]}
              numberOfLines={1}
              selectable
            >
              {item.studentName ?? item.sessionName ?? "Attendance entry"}
            </Text>
            <Text
              style={[styles.rowMeta, { color: colors.textSecondary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
              selectable
            >
              {item.sessionName ?? item.status ?? "Recorded attendance"}
            </Text>
          </View>
          {typeof item.value === "number" ? (
            <Pill label={`${item.value}%`} colors={colors} tone="secondary" />
          ) : item.status ? (
            <Pill label={item.status} colors={colors} tone="primary" />
          ) : null}
        </View>
      ))}
    </View>
  );
}

function SessionsTab({
  classDetail,
  colors,
}: {
  classDetail: ClassDetail;
  colors: Palette;
}) {
  if (classDetail.sessions.length === 0) {
    return (
      <EmptyPanel
        colors={colors}
        title="No sessions listed"
        body={`${classDetail.sessionsCount} session${classDetail.sessionsCount === 1 ? "" : "s"} are counted for this class. Session details will show here when the API returns them.`}
      />
    );
  }

  return (
    <View style={styles.panelList}>
      {classDetail.sessions.map((session) => (
        <View
          key={session.id}
          style={[
            styles.rowCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View
            style={[styles.avatar, { backgroundColor: `${colors.accent}18` }]}
          >
            <CalendarDays size={17} color={colors.accent} strokeWidth={2} />
          </View>
          <View style={styles.rowBody}>
            <Text
              style={[styles.rowTitle, { color: colors.text }]}
              numberOfLines={1}
              selectable
            >
              {session.title}
            </Text>
            <Text
              style={[styles.rowMeta, { color: colors.textSecondary }]}
              numberOfLines={1}
              selectable
            >
              {typeof session.attendanceCount === "number" &&
              typeof session.totalStudents === "number"
                ? `${session.attendanceCount}/${session.totalStudents} attended`
                : "Attendance session"}
            </Text>
          </View>
          {session.status ? (
            <Pill
              label={session.status}
              colors={colors}
              tone={
                session.status.toLowerCase() === "live" ? "danger" : "neutral"
              }
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

export default function ClassDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const classId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { data: session, isPending } = authClient.useSession();
  const { theme } = useAppTheme();
  const colors = Colors[theme];
  const userRole = ((session?.user as any)?.role ?? "STUDENT") as UserRole;
  const isLecturer = userRole === "LECTURER";

  const [classDetail, setClassDetail] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>("students");

  const loadClass = useCallback(
    async (isRefresh = false) => {
      if (!classId) {
        setLoading(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await api.get("/api/classes");
        const payload = response.data?.data ?? response.data ?? {};
        const source = [
          ...asArray(payload.owned),
          ...asArray(payload.enrolled),
        ];
        const selected = source.find(
          (item) => String(item.id) === String(classId),
        );

        const mappedClass = selected ? mapClassDetail(selected, isLecturer) : null;

        if (mappedClass) {
          try {
            const studentsResponse = await api.get(`/api/${classId}/students`);
            const studentsPayload =
              studentsResponse.data?.data ?? studentsResponse.data ?? [];
            mappedClass.students = asArray(studentsPayload).map(mapStudent);
          } catch (studentError) {
            console.warn("Failed to fetch students for class", studentError);
          }
        }

        setClassDetail(mappedClass);
      } catch (error: any) {
        const message =
          error?.response?.data?.message || "Failed to load class details";
        toast.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [classId, isLecturer],
  );

  useEffect(() => {
    if (!isPending && session?.user?.id) {
      loadClass();
    }
  }, [isPending, loadClass, session?.user?.id]);

  const tabCounts = useMemo(
    () => ({
      students: classDetail?.students.length || classDetail?.members || 0,
      attendance:
        classDetail?.attendance.length || classDetail?.attendanceAverage || 0,
      sessions: classDetail?.sessions.length || classDetail?.sessionsCount || 0,
    }),
    [classDetail],
  );

  const renderTab = () => {
    if (!classDetail) return null;
    if (activeTab === "students") {
      return <StudentsTab classDetail={classDetail} colors={colors} />;
    }
    if (activeTab === "attendance") {
      return <AttendanceTab classDetail={classDetail} colors={colors} />;
    }
    return <SessionsTab classDetail={classDetail} colors={colors} />;
  };

  const isBusy = loading || isPending;

  const handleStartSession = () => {
    router.push({
      pathname: "/(attendance)/startsession",
      params: classId ? { classId } : undefined,
    });
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <Stack.Screen options={{ title: classDetail?.name ?? "Class details" }} />
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadClass(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.content}
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

          {isLecturer ? (
            <Pressable
              onPress={handleStartSession}
              style={({ pressed }) => [
                styles.startSessionButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.84 : 1,
                },
              ]}
            >
              <PlayCircle
                size={16}
                color={colors.primaryForeground}
                strokeWidth={2.2}
              />
              <Text
                style={[
                  styles.startSessionText,
                  { color: colors.primaryForeground },
                ]}
                numberOfLines={1}
              >
                Start session
              </Text>
            </Pressable>
          ) : null}
        </View>

        {isBusy ? (
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
              Loading class details
            </Text>
          </View>
        ) : classDetail ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroTop}>
                {isLecturer ? (
                  <GraduationCap
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={1.75}
                  />
                ) : (
                  <BookOpen
                    size={18}
                    color={colors.textSecondary}
                    strokeWidth={1.75}
                  />
                )}
                <Text
                  style={[styles.kicker, { color: colors.textSecondary }]}
                  selectable
                >
                  {isLecturer ? "Class workspace" : "Joined class"}
                </Text>
                {classDetail.isLive ? (
                  <Pill label="Live" colors={colors} tone="danger" />
                ) : null}
              </View>

              <Text style={[styles.title, { color: colors.text }]} selectable>
                {classDetail.name}
              </Text>

              <Text
                style={[styles.subtitle, { color: colors.textSecondary }]}
                selectable
              >
                {classDetail.lecturerName}
              </Text>

              <View
                style={[
                  styles.divider,
                  { backgroundColor: colors.backgroundSelected },
                ]}
              />

              <View style={styles.codeRow}>
                <Text
                  style={[styles.codeLabel, { color: colors.textSecondary }]}
                >
                  Class code
                </Text>
                <Text
                  style={[styles.codeValue, { color: colors.primary }]}
                  selectable
                >
                  {classDetail.code}
                </Text>
              </View>
            </View>

            <View style={styles.statsGrid}>
              <StatTile
                label={isLecturer ? "Students" : "Classmates"}
                value={String(classDetail.members)}
                icon={
                  <Users size={18} color={colors.primary} strokeWidth={2.2} />
                }
                colors={colors}
              />
              <StatTile
                label="Sessions"
                value={String(classDetail.sessionsCount)}
                icon={
                  <Clock3 size={18} color={colors.accent} strokeWidth={2.2} />
                }
                colors={colors}
              />
              <StatTile
                label="Attendance"
                value={`${classDetail.attendanceAverage}%`}
                icon={
                  <CheckCircle2
                    size={18}
                    color={colors.secondary}
                    strokeWidth={2.2}
                  />
                }
                colors={colors}
              />
            </View>

            <View
              style={[
                styles.tabs,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            >
              <TabButton
                active={activeTab === "students"}
                label="Students"
                count={tabCounts.students}
                colors={colors}
                onPress={() => setActiveTab("students")}
              />
              <TabButton
                active={activeTab === "attendance"}
                label="Attendance"
                count={tabCounts.attendance}
                colors={colors}
                onPress={() => setActiveTab("attendance")}
              />
              <TabButton
                active={activeTab === "sessions"}
                label="Sessions"
                count={tabCounts.sessions}
                colors={colors}
                onPress={() => setActiveTab("sessions")}
              />
            </View>

            {renderTab()}
          </>
        ) : (
          <EmptyPanel
            colors={colors}
            title="Class not found"
            body="This class is not in your created or joined classes yet. Pull to refresh or return to the list."
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
    paddingTop: 16,
    paddingBottom: 44,
    gap: 16,
  },
  headerRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    flexShrink: 0,
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 13,
  },
  backText: {
    fontFamily: Outfit.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  startSessionButton: {
    minHeight: 40,
    maxWidth: 176,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  startSessionText: {
    flexShrink: 1,
    fontFamily: Outfit.semiBold,
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  heroCard: {
    paddingVertical: 20,
    gap: 6,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  kicker: {
    flex: 1,
    fontSize: 12,
    fontFamily: "Outfit_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroCopy: {
    flex: 1,
    gap: 5,
  },
  title: {
    fontSize: 22,
    fontFamily: "Outfit_600SemiBold",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Outfit_400Regular",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 14,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  codeLabel: {
    fontSize: 13,
    fontFamily: "Outfit_400Regular",
  },
  codeValue: {
    fontSize: 15,
    fontFamily: "Outfit_500Medium",
    letterSpacing: 1.5, // gives class codes a "code" feel without a monospace font
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statTile: {
    flex: 1,
    minHeight: 82,
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: "flex-end",
    gap: 10,
  },
  statIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 10,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  statTextBlock: {
    minHeight: 48,
    paddingRight: 30,
    justifyContent: "flex-end",
    gap: 2,
  },
  statLabel: {
    fontSize: 12,
    lineHeight: 15,
    fontFamily: "Outfit_500Medium",
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Outfit.semiBold,
    letterSpacing: -0.45,
    fontVariant: ["tabular-nums"],
  },
  tabs: {
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 18,
    borderCurve: "continuous",
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    borderCurve: "continuous",
    paddingHorizontal: 8,
    paddingVertical: 9,
  },
  tabLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    width: "100%",
  },
  tabLabel: {
    flexShrink: 1,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },
  tabCount: {
    minWidth: 22,
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    textAlign: "center",
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.bold,
    fontVariant: ["tabular-nums"],
  },
  panelList: {
    gap: 10,
  },
  rowCard: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: "continuous",
    padding: 13,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    fontFamily: Outfit.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  rowMeta: {
    fontFamily: Outfit.regular,
    fontSize: 12,
    lineHeight: 17,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  pillText: {
    fontFamily: Outfit.bold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  attendanceCard: {
    borderWidth: 1,
    borderRadius: 22,
    borderCurve: "continuous",
    padding: 16,
    gap: 14,
  },
  attendanceTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  attendanceValue: {
    fontFamily: Outfit.bold,
    fontSize: 36,
    lineHeight: 40,
    letterSpacing: -0.7,
    fontVariant: ["tabular-nums"],
  },
  progressTrack: {
    height: 9,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  attendanceNote: {
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 20,
  },
  loadingCard: {
    minHeight: 220,
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
  emptyPanel: {
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
    width: 50,
    height: 50,
    borderRadius: 18,
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
  emptyBody: {
    maxWidth: 285,
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
});
