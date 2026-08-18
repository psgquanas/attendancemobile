import { Clock3, LocateFixed, MapPin, QrCode } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { Outfit } from "@/constants/theme";
import type { AttendancePalette } from "./live-session-types";

function DetailRow({
  label,
  value,
  colors,
  icon,
}: {
  label: string;
  value: string;
  colors: AttendancePalette;
  icon: React.ReactNode;
}) {
  return (
    <View style={styles.row}>
      <View
        style={[styles.iconBadge, { backgroundColor: colors.backgroundSelected }]}
      >
        {icon}
      </View>
      <View style={styles.rowCopy}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
        <Text
          style={[styles.value, { color: colors.text }]}
          numberOfLines={1}
          selectable
        >
          {value}
        </Text>
      </View>
    </View>
  );
}

export function SessionDetailsPanel({
  startTime,
  endTime,
  radiusMetres,
  checkInMethod,
  locationEnabled,
  colors,
}: {
  startTime: string;
  endTime: string;
  radiusMetres: number;
  checkInMethod: string;
  locationEnabled: boolean;
  colors: AttendancePalette;
}) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        Session details
      </Text>
      <View style={styles.rows}>
        <DetailRow
          label="Start time"
          value={startTime}
          colors={colors}
          icon={<Clock3 size={16} color={colors.primary} strokeWidth={2.1} />}
        />
        <DetailRow
          label="End time"
          value={endTime}
          colors={colors}
          icon={<Clock3 size={16} color={colors.accent} strokeWidth={2.1} />}
        />
        <DetailRow
          label="Attendance radius"
          value={`${radiusMetres} metres`}
          colors={colors}
          icon={<MapPin size={16} color={colors.secondary} strokeWidth={2.1} />}
        />
        <DetailRow
          label="Check-in method"
          value={checkInMethod}
          colors={colors}
          icon={<QrCode size={16} color={colors.primary} strokeWidth={2.1} />}
        />
        <DetailRow
          label="Location verification"
          value={locationEnabled ? "Enabled" : "Disabled"}
          colors={colors}
          icon={
            <LocateFixed
              size={16}
              color={locationEnabled ? colors.secondary : colors.textSecondary}
              strokeWidth={2.1}
            />
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    borderRadius: 24,
    borderCurve: "continuous",
    padding: 16,
    gap: 14,
  },
  heading: {
    fontFamily: Outfit.semiBold,
    fontSize: 17,
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: 14,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  rowCopy: {
    flex: 1,
    gap: 1,
  },
  label: {
    fontFamily: Outfit.medium,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.55,
    textTransform: "uppercase",
  },
  value: {
    fontFamily: Outfit.semiBold,
    fontSize: 14,
    lineHeight: 19,
  },
});
