import { Copy, QrCode, Share2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { Outfit } from "@/constants/theme";
import type { AttendancePalette } from "./live-session-types";

export function AttendanceCodePanel({
  qrPayload,
  manualCode,
  colors,
  // onCopyCode,
  onShareQr,
}: {
  qrPayload: string;
  manualCode: string;
  colors: AttendancePalette;
  //onCopyCode: () => void;
  onShareQr: () => void;
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
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>
            Attendance code
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            Students scan or enter code
          </Text>
        </View>
        <View
          style={[styles.iconBadge, { backgroundColor: colors.primaryMuted }]}
        >
          <QrCode size={20} color={colors.primary} strokeWidth={2.2} />
        </View>
      </View>

      <View
        style={[styles.qrShell, { borderColor: colors.backgroundSelected }]}
      >
        <QRCode value={qrPayload} size={214} quietZone={8} />
      </View>

      <View
        style={[
          styles.codeRow,
          {
            backgroundColor: colors.background,
            borderColor: colors.backgroundSelected,
          },
        ]}
      >
        <View style={styles.codeCopy}>
          <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>
            Manual code
          </Text>
          <Text style={[styles.codeValue, { color: colors.text }]} selectable>
            {manualCode}
          </Text>
        </View>
        <Pressable
          //onPress={onCopyCode}
          style={({ pressed }) => [
            styles.iconButton,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.82 : 1,
            },
          ]}
        >
          <Copy size={17} color={colors.primaryForeground} strokeWidth={2.3} />
        </Pressable>
      </View>

      <Pressable
        onPress={onShareQr}
        style={({ pressed }) => [
          styles.shareButton,
          {
            backgroundColor: colors.background,
            borderColor: colors.backgroundSelected,
            opacity: pressed ? 0.82 : 1,
          },
        ]}
      >
        <Share2 size={16} color={colors.primary} strokeWidth={2.3} />
        <Text style={[styles.shareText, { color: colors.primary }]}>
          Share QR code
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 18,
    gap: 18,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
  },
  headingCopy: {
    flex: 1,
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
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  qrShell: {
    alignSelf: "center",
    borderWidth: 1,
    borderRadius: 28,
    borderCurve: "continuous",
    padding: 16,
    backgroundColor: "#FFFFFF",
  },
  codeRow: {
    minHeight: 66,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    borderCurve: "continuous",
    paddingLeft: 15,
    paddingRight: 10,
    gap: 12,
  },
  codeCopy: {
    flex: 1,
    gap: 1,
  },
  codeLabel: {
    fontFamily: Outfit.medium,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.65,
    textTransform: "uppercase",
  },
  codeValue: {
    fontFamily: Outfit.bold,
    fontSize: 26,
    lineHeight: 31,
    letterSpacing: 3,
    fontVariant: ["tabular-nums"],
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    borderCurve: "continuous",
    alignItems: "center",
    justifyContent: "center",
  },
  shareButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderWidth: 1,
    borderRadius: 16,
    borderCurve: "continuous",
  },
  shareText: {
    fontFamily: Outfit.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
});
