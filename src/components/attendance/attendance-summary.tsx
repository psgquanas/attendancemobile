import { CheckCircle2, Percent, Users } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { Outfit } from "@/constants/theme";
import type { AttendancePalette } from "./live-session-types";

function SummaryCard({
  label,
  value,
  tone,
  icon,
  colors,
}: {
  label: string;
  value: string;
  tone: string;
  icon: React.ReactNode;
  colors: AttendancePalette;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <View style={[styles.iconBadge, { backgroundColor: `${tone}16` }]}>
        {icon}
      </View>
      <Text style={[styles.value, { color: colors.text }]} selectable>
        {value}
      </Text>
      <Text
        style={[styles.label, { color: colors.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

export function AttendanceSummary({
  present,
  total,
  percentage,
  colors,
}: {
  present: number;
  total: number;
  percentage: number;
  colors: AttendancePalette;
}) {
  return (
    <View style={styles.grid}>
      <SummaryCard
        label="Present"
        value={String(present)}
        tone={colors.secondary}
        icon={<CheckCircle2 size={17} color={colors.secondary} strokeWidth={2.2} />}
        colors={colors}
      />
      <SummaryCard
        label="Students"
        value={String(total)}
        tone={colors.primary}
        icon={<Users size={17} color={colors.primary} strokeWidth={2.2} />}
        colors={colors}
      />
      <SummaryCard
        label="Rate"
        value={`${percentage}%`}
        tone={colors.accent}
        icon={<Percent size={17} color={colors.accent} strokeWidth={2.2} />}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    gap: 8,
  },
  card: {
    flex: 1,
    minHeight: 100,
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: "continuous",
    padding: 12,
    justifyContent: "flex-end",
    gap: 4,
  },
  iconBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 11,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    paddingRight: 22,
    fontFamily: Outfit.bold,
    fontSize: 25,
    lineHeight: 30,
    letterSpacing: -0.45,
    fontVariant: ["tabular-nums"],
  },
  label: {
    fontFamily: Outfit.semiBold,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.55,
    textTransform: "uppercase",
  },
});
