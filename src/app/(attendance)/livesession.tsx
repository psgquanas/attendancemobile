//import * as Clipboard from "expo-clipboard";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  Share2,
  Square,
  UserPlus,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

import { AttendanceCodePanel } from "@/components/attendance/attendance-code-panel";
import { AttendanceSummary } from "@/components/attendance/attendance-summary";
import { LiveAttendanceList } from "@/components/attendance/live-attendance-list";
import { LiveSessionHeader } from "@/components/attendance/live-session-header";
import type {
  AttendanceStatus,
  CheckInMethod,
  LiveAttendanceRecord,
  LiveSessionInfo,
  ManualStudent,
} from "@/components/attendance/live-session-types";
import { MarkAttendanceSheet } from "@/components/attendance/mark-attendance-sheet";
import { SessionDetailsPanel } from "@/components/attendance/session-details-panel";
import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";
import { api } from "@/lib/axios";
import { io } from "socket.io-client";

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}

function firstString(...values: unknown[]) {
  const value = values.find(
    (item) => typeof item === "string" && item.trim().length > 0,
  );
  return typeof value === "string" ? value : undefined;
}

function normalizeNumber(value: unknown, fallback = 0) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatClock(value: Date) {
  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "Ended";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes <= 0) return `Ends in ${seconds} seconds`;
  return `Ends in ${minutes} min ${seconds.toString().padStart(2, "0")} sec`;
}

function normalizeMethod(value: unknown): CheckInMethod {
  const raw = String(value ?? "Both").toLowerCase();
  if (raw.includes("qr") && raw.includes("manual")) return "Both";
  if (raw.includes("both")) return "Both";
  if (raw.includes("manual")) return "Manual Code";
  if (raw.includes("qr")) return "QR Code";
  return "Both";
}

function normalizeRecord(item: any, index: number): LiveAttendanceRecord {
  const checkedAt =
    firstString(item.checkInTime, item.checkedInAt, item.createdAt) ??
    new Date().toISOString();

  return {
    id: String(item.id ?? item.studentId ?? `record-${index}`),
    studentName:
      firstString(
        item.studentName,
        item.student?.name,
        item.user?.name,
        item.name,
      ) ?? "Student",
    checkInTime: formatClock(new Date(checkedAt)),
    method: String(item.method ?? item.checkInMethod ?? "")
      .toLowerCase()
      .includes("manual")
      ? "Manual Code"
      : "QR Code",
    status: String(item.status ?? "Present")
      .toLowerCase()
      .includes("late")
      ? "Late"
      : "Present",
  };
}

function normalizeStudent(item: any, index: number): ManualStudent {
  return {
    id: String(item.id ?? item.studentId ?? item.userId ?? `student-${index}`),
    name:
      firstString(item.name, item.student?.name, item.user?.name) ?? "Student",
    email: item.email ?? item.student?.email ?? item.user?.email,
  };
}

function buildFallbackSession(
  sessionId?: string,
  classId?: string,
): LiveSessionInfo {
  const start = new Date();
  const end = new Date(start.getTime() + 10 * 60 * 1000);
  const code = (sessionId ?? classId ?? "A1B2C3").slice(0, 6).toUpperCase();

  return {
    id: sessionId ?? "live-session",
    classId,
    className: "Attendance session",
    title: "Live check-in",
    status: "Live",
    manualCode: code.padEnd(6, "0"),
    qrPayload: JSON.stringify({
      type: "attendance-check-in",
      sessionId: sessionId ?? "live-session",
      classId,
    }),
    presentCount: 0,
    totalStudents: 0,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    radiusMetres: 100,
    checkInMethod: "Both",
    locationEnabled: true,
    students: [],
    attendance: [],
  };
}

function mapLiveSession(raw: any, sessionId?: string, classId?: string) {
  const fallback = buildFallbackSession(sessionId, classId);
  const session = raw?.data ?? raw ?? {};
  const attendance = asArray(
    session.attendance ??
      session.attendances ??
      session.records ??
      session.checkIns ??
      session.attendanceRecords,
  ).map(normalizeRecord);
  const students = asArray(
    session.students ?? session.class?.students ?? session.enrollments,
  ).map(normalizeStudent);
  const startTime =
    firstString(session.startTime, session.startedAt, session.createdAt) ??
    fallback.startTime;
  const endTime =
    firstString(session.endTime, session.endsAt, session.expiresAt) ??
    fallback.endTime;
  const presentCount = normalizeNumber(
    session.presentCount ?? session.presentStudents ?? attendance.length,
    attendance.length,
  );
  const resolvedSessionId = String(session.id ?? sessionId ?? fallback.id);
  const qrToken = firstString(session.qrToken, session.token);

  return {
    id: resolvedSessionId,
    classId: String(session.classId ?? session.class?.id ?? classId ?? ""),
    className:
      firstString(session.className, session.class?.name, session.name) ??
      fallback.className,
    title: firstString(session.title, session.sessionTitle) ?? fallback.title,
    status: String(session.status ?? "Live")
      .toLowerCase()
      .includes("end")
      ? "Ended"
      : "Live",
    manualCode:
      firstString(session.manualCode, session.code, session.attendanceCode) ??
      fallback.manualCode,
    qrPayload:
      firstString(session.qrPayload, session.qrCode, session.qrValue) ??
      (qrToken
        ? JSON.stringify({
            type: "attendance-check-in",
            sessionId: resolvedSessionId,
            qrToken,
          })
        : fallback.qrPayload),
    presentCount,
    totalStudents: normalizeNumber(
      session.totalStudents ??
        session.class?._count?.students ??
        students.length,
      students.length,
    ),
    startTime,
    endTime,
    radiusMetres: normalizeNumber(
      session.radiusMetres ?? session.allowedRadius ?? session.radius,
      fallback.radiusMetres,
    ),
    checkInMethod: normalizeMethod(
      session.checkInMethod ?? session.mode ?? session.checkInMode,
    ),
    locationEnabled: Boolean(
      session.locationEnabled ??
      session.requireLocation ??
      fallback.locationEnabled,
    ),
    students,
    attendance,
  } satisfies LiveSessionInfo;
}

export default function LiveSessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    sessionId?: string | string[];
    classId?: string | string[];
  }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0]
    : params.sessionId;
  const classId = Array.isArray(params.classId)
    ? params.classId[0]
    : params.classId;
  const { theme } = useAppTheme();
  const colors = Colors[theme];

  const [session, setSession] = useState<LiveSessionInfo>(() =>
    buildFallbackSession(sessionId, classId),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [sheetOpen, setSheetOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>("Present");
  const [manualNote, setManualNote] = useState("");
  const [endingSession, setEndingSession] = useState(false);

  const loadSession = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      if (!sessionId) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      try {
        const response = await api.get(`/api/sessions/${sessionId}`);
        setSession(mapLiveSession(response.data, sessionId, classId));
      } catch (error) {
        if (isRefresh) {
          toast.error("Could not refresh live attendance yet.");
        }
        setSession((current) => ({
          ...current,
          id: sessionId,
          classId: classId ?? current.classId,
        }));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [classId, sessionId],
  );

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const socketUrl =
      process.env.EXPO_PUBLIC_API_URL ||
      "https://unenthralling-melaine-kitcheny.ngrok-free.dev";
    const cookie = authClient.getCookie();

    const socket = io(socketUrl, {
      withCredentials: true,
      extraHeaders: cookie ? { cookie } : undefined,
    });

    socket.on("connect", () => {
      socket.emit(
        "attendance:join",
        { sessionId },
        (response: { success?: boolean; data?: unknown }) => {
          if (response?.success && response.data) {
            setSession(mapLiveSession(response.data, sessionId, classId));
          }
        },
      );
    });

    socket.on("attendance:updated", (data: any) => {
      if (data?.attendance) {
        const newRecord = normalizeRecord(data.attendance, Date.now());
        setSession((current) => {
          const exists = current.attendance.some((r) => r.id === newRecord.id);
          if (exists) return current;

          return {
            ...current,
            presentCount:
              typeof data.attendanceCount === "number"
                ? data.attendanceCount
                : current.presentCount + 1,
            attendance: [newRecord, ...current.attendance],
          };
        });
        toast.info(`${newRecord.studentName} checked in!`);
      }
    });

    return () => {
      socket.emit("attendance:leave", { sessionId });
      socket.disconnect();
    };
  }, [classId, sessionId]);

  const attendanceRate = useMemo(() => {
    if (!session.totalStudents) return 0;
    return clampPercent((session.presentCount / session.totalStudents) * 100);
  }, [session.presentCount, session.totalStudents]);

  const filteredStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    const source =
      session.students.length > 0
        ? session.students
        : session.attendance.map((record) => ({
            id: record.id,
            name: record.studentName,
            email: null,
          }));

    if (!query) return source;
    return source.filter((student) =>
      `${student.name} ${student.email ?? ""}`.toLowerCase().includes(query),
    );
  }, [session.attendance, session.students, studentSearch]);

  const countdown = formatCountdown(new Date(session.endTime).getTime() - now);

  /* const handleCopyCode = async () => {
    await Clipboard.setStringAsync(session.manualCode);
    toast.success("Manual code copied.");
  }; */

  const handleShareQr = async () => {
    await Share.share({
      title: "Attendance QR code",
      message: `Attendance session: ${session.className}\nCode: ${session.manualCode}\n${session.qrPayload}`,
    });
  };

  const handleSaveManualAttendance = async () => {
    const student = filteredStudents.find(
      (item) => item.id === selectedStudentId,
    );
    if (!student) {
      toast.error("Select a student first.");
      return;
    }

    try {
      if (sessionId) {
        await api.post(`/api/attendance/sessions/${sessionId}/records`, {
          studentId: student.id,
          status: manualStatus,
          note: manualNote.trim() || undefined,
        });
      }

      const record: LiveAttendanceRecord = {
        id: `${student.id}-${Date.now()}`,
        studentName: student.name,
        checkInTime: formatClock(new Date()),
        method: "Manual Code",
        status: manualStatus === "Late" ? "Late" : "Present",
      };

      setSession((current) => ({
        ...current,
        presentCount:
          manualStatus === "Absent" || manualStatus === "Excused"
            ? current.presentCount
            : current.presentCount + 1,
        attendance: [record, ...current.attendance],
      }));
      setSheetOpen(false);
      setStudentSearch("");
      setSelectedStudentId(null);
      setManualStatus("Present");
      setManualNote("");
      toast.success("Attendance saved.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? "Failed to save attendance.",
      );
    }
  };

  const handleEndSession = () => {
    Alert.alert(
      "End attendance session?",
      "Students will no longer be able to check in after this session ends.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "End Session",
          style: "destructive",
          onPress: async () => {
            setEndingSession(true);
            try {
              if (sessionId) {
                await api.post(`/api/sessions/${sessionId}/end`);
              }
              setSession((current) => ({ ...current, status: "Ended" }));
              toast.success("Session ended.");
              router.back();
            } catch (error: any) {
              toast.error(
                error?.response?.data?.message ?? "Failed to end session.",
              );
            } finally {
              setEndingSession(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={["top", "bottom"]}
    >
      <Stack.Screen options={{ title: "Live attendance" }} />
      <ScrollView
        style={styles.scroll}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSession(true)}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.content}
      >
        <View style={styles.navRow}>
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

          <Pressable
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [
              styles.markTopButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.84 : 1,
              },
            ]}
          >
            <UserPlus
              size={15}
              color={colors.primaryForeground}
              strokeWidth={2.2}
            />
            <Text
              style={[styles.markTopText, { color: colors.primaryForeground }]}
              numberOfLines={1}
            >
              Mark Attendance
            </Text>
          </Pressable>
        </View>

        {loading ? (
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
              Loading live session
            </Text>
          </View>
        ) : null}

        <LiveSessionHeader
          className={session.className}
          title={session.title}
          status={session.status}
          countdown={countdown}
          colors={colors}
        />

        <AttendanceCodePanel
          qrPayload={session.qrPayload}
          manualCode={session.manualCode}
          colors={colors}
          //onCopyCode={handleCopyCode}
          onShareQr={handleShareQr}
        />

        <AttendanceSummary
          present={session.presentCount}
          total={session.totalStudents}
          percentage={attendanceRate}
          colors={colors}
        />

        <LiveAttendanceList records={session.attendance} colors={colors} />

        <SessionDetailsPanel
          startTime={formatClock(new Date(session.startTime))}
          endTime={formatClock(new Date(session.endTime))}
          radiusMetres={session.radiusMetres}
          checkInMethod={session.checkInMethod}
          locationEnabled={session.locationEnabled}
          colors={colors}
        />

        <View style={styles.bottomActions}>
          <Pressable
            onPress={handleEndSession}
            disabled={endingSession}
            style={({ pressed }) => [
              styles.endButton,
              {
                backgroundColor: colors.destructive,
                opacity: pressed || endingSession ? 0.84 : 1,
              },
            ]}
          >
            {endingSession ? (
              <ActivityIndicator
                size="small"
                color={colors.destructiveForeground}
              />
            ) : (
              <>
                <Square
                  size={16}
                  color={colors.destructiveForeground}
                  fill={colors.destructiveForeground}
                  strokeWidth={2}
                />
                <Text
                  style={[
                    styles.endButtonText,
                    { color: colors.destructiveForeground },
                  ]}
                >
                  End Session
                </Text>
              </>
            )}
          </Pressable>

          <View style={styles.secondaryActions}>
            <Pressable
              onPress={() => loadSession(true)}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <RefreshCw size={16} color={colors.text} strokeWidth={2.2} />
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Refresh
              </Text>
            </Pressable>

            <Pressable
              onPress={handleShareQr}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <Share2 size={16} color={colors.text} strokeWidth={2.2} />
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Share
              </Text>
            </Pressable>

            <Pressable
              //onPress={handleCopyCode}
              style={({ pressed }) => [
                styles.secondaryButton,
                {
                  backgroundColor: colors.backgroundElement,
                  borderColor: colors.backgroundSelected,
                  opacity: pressed ? 0.82 : 1,
                },
              ]}
            >
              <Copy size={16} color={colors.text} strokeWidth={2.2} />
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Copy
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <MarkAttendanceSheet
        visible={sheetOpen}
        colors={colors}
        students={filteredStudents}
        search={studentSearch}
        selectedStudentId={selectedStudentId}
        status={manualStatus}
        note={manualNote}
        onClose={() => setSheetOpen(false)}
        onSearchChange={setStudentSearch}
        onStudentSelect={setSelectedStudentId}
        onStatusChange={setManualStatus}
        onNoteChange={setManualNote}
        onSave={handleSaveManualAttendance}
      />
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
  navRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  markTopButton: {
    minHeight: 42,
    maxWidth: 190,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 999,
    paddingHorizontal: 14,
  },
  markTopText: {
    flexShrink: 1,
    fontFamily: Outfit.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  loadingCard: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: 22,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  loadingText: {
    fontFamily: Outfit.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  bottomActions: {
    gap: 10,
  },
  endButton: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 18,
    borderCurve: "continuous",
  },
  endButtonText: {
    fontFamily: Outfit.bold,
    fontSize: 14,
    lineHeight: 19,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 15,
    borderCurve: "continuous",
  },
  secondaryButtonText: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
