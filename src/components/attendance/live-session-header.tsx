import { Clock3, Radio } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { Outfit } from "@/constants/theme";
import type { AttendancePalette } from "./live-session-types";

export function LiveSessionHeader({
  className,
  title,
  status,
  countdown,
  colors,
}: {
  className: string;
  title?: string | null;
  status: string;
  countdown: string;
  colors: AttendancePalette;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.titleBlock}>
        <Text style={[styles.className, { color: colors.text }]} selectable>
          {className}
        </Text>
        {title ? (
          <Text
            style={[styles.sessionTitle, { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
            selectable
          >
            {title}
          </Text>
        ) : null}
      </View>

      <View style={styles.metaRow}>
        <View
          style={[
            styles.livePill,
            {
              backgroundColor: `${colors.secondary}18`,
              borderColor: `${colors.secondary}36`,
            },
          ]}
        >
          <Radio size={13} color={colors.secondary} strokeWidth={2.4} />
          <Text style={[styles.liveText, { color: colors.secondary }]}>
            {status}
          </Text>
        </View>
        <View
          style={[
            styles.timerPill,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <Clock3 size={13} color={colors.accent} strokeWidth={2.4} />
          <Text
            style={[styles.timerText, { color: colors.text }]}
            numberOfLines={1}
          >
            {countdown}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 14,
  },
  titleBlock: {
    gap: 3,
  },
  className: {
    fontFamily: Outfit.bold,
    fontSize: 28,
    lineHeight: 33,
    letterSpacing: -0.55,
  },
  sessionTitle: {
    fontFamily: Outfit.medium,
    fontSize: 15,
    lineHeight: 20,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },
  livePill: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  liveText: {
    fontFamily: Outfit.bold,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  timerPill: {
    minHeight: 34,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
  },
  timerText: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
    fontVariant: ["tabular-nums"],
  },
});
