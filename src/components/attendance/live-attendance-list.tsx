import { Clock3, SearchX, UserCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { Outfit } from "@/constants/theme";
import type { AttendancePalette, LiveAttendanceRecord } from "./live-session-types";

function StatusPill({
  label,
  colors,
}: {
  label: string;
  colors: AttendancePalette;
}) {
  const tone = label === "Late" ? colors.accent : colors.secondary;
  return (
    <View
      style={[
        styles.statusPill,
        { backgroundColor: `${tone}16`, borderColor: `${tone}36` },
      ]}
    >
      <Text style={[styles.statusText, { color: tone }]}>{label}</Text>
    </View>
  );
}

export function LiveAttendanceList({
  records,
  colors,
}: {
  records: LiveAttendanceRecord[];
  colors: AttendancePalette;
}) {
  return (
    <View style={styles.block}>
      <View style={styles.heading}>
        <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
          Live check-ins
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>
          Student attendance list
        </Text>
      </View>

      {records.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View
            style={[styles.emptyIcon, { backgroundColor: colors.primaryMuted }]}
          >
            <SearchX size={23} color={colors.primary} strokeWidth={2.1} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            Waiting for students to check in...
          </Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Keep the QR code visible. New check-ins will appear here as they are
            recorded.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {records.map((record) => (
            <View
              key={record.id}
              style={[
                styles.row,
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
                <UserCheck size={17} color={colors.secondary} strokeWidth={2.2} />
              </View>
              <View style={styles.rowBody}>
                <Text
                  style={[styles.studentName, { color: colors.text }]}
                  numberOfLines={1}
                  selectable
                >
                  {record.studentName}
                </Text>
                <View style={styles.metaRow}>
                  <Clock3
                    size={12}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                  <Text
                    style={[styles.rowMeta, { color: colors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {record.checkInTime} · {record.method}
                  </Text>
                </View>
              </View>
              <StatusPill label={record.status} colors={colors} />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: 12,
  },
  heading: {
    gap: 2,
  },
  eyebrow: {
    fontFamily: Outfit.semiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: Outfit.semiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  list: {
    gap: 10,
  },
  row: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: "continuous",
    padding: 13,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 15,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  studentName: {
    fontFamily: Outfit.semiBold,
    fontSize: 15,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  rowMeta: {
    flexShrink: 1,
    fontFamily: Outfit.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusText: {
    fontFamily: Outfit.bold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.65,
    textTransform: "uppercase",
  },
  emptyCard: {
    minHeight: 210,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 24,
    gap: 10,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontFamily: Outfit.bold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
    textAlign: "center",
  },
  emptyBody: {
    maxWidth: 285,
    fontFamily: Outfit.regular,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
});
