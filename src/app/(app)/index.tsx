import { Link, Redirect } from "expo-router";
import {
  Bell,
  CalendarDays,
  CircleCheck,
  Clock,
  FileText,
  MapPin,
  Users,
} from "lucide-react-native";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";

type Palette = (typeof Colors)[keyof typeof Colors];

type SummaryTile = {
  label: string;
  value: string;
  sublabel: string;
  icon: React.ReactNode;
  tint: keyof Palette;
  muted?: boolean;
};

type HistoryEntry = {
  id: string;
  day: string;
  weekday: string;
  checkIn: string;
  checkOut: string;
  totalHours: string;
  location: string;
};

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function getDisplayName(session: unknown) {
  const typedSession = session as {
    user?: {
      name?: string | null;
      email?: string | null;
    } | null;
  } | null;

  return (
    typedSession?.user?.name?.trim() ||
    typedSession?.user?.email?.split("@")[0] ||
    "Akhmad Maariz"
  );
}

function SectionHeader({
  title,
  action,
  colors,
}: {
  title: string;
  action?: React.ReactNode;
  colors: Palette;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {action}
    </View>
  );
}

function SummaryCard({ tile, colors }: { tile: SummaryTile; colors: Palette }) {
  const accent = colors[tile.tint];

  return (
    <View
      style={[
        styles.summaryCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
          opacity: tile.muted ? 0.72 : 1,
        },
      ]}
    >
      <View style={[styles.summaryIcon, { backgroundColor: `${accent}14` }]}>
        {tile.icon}
      </View>
      <Text style={[styles.summaryLabel, { color: colors.text }]}>
        {tile.label}
      </Text>
      <Text style={[styles.summarySubLabel, { color: colors.textSecondary }]}>
        {tile.sublabel}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          { color: tile.muted ? colors.textSecondary : colors.text },
        ]}
      >
        {tile.value}
      </Text>
    </View>
  );
}

function HistoryCard({
  entry,
  colors,
}: {
  entry: HistoryEntry;
  colors: Palette;
}) {
  return (
    <View
      style={[
        styles.historyCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <View
        style={[styles.historyDateBlock, { backgroundColor: colors.primary }]}
      >
        <Text style={styles.historyDay}>{entry.day}</Text>
        <Text style={styles.historyWeekday}>{entry.weekday}</Text>
      </View>

      <View style={styles.historyDetails}>
        <View style={styles.historyStatsRow}>
          <View style={styles.historyStat}>
            <Text style={[styles.historyStatValue, { color: colors.text }]}>
              {entry.checkIn}
            </Text>
            <Text
              style={[styles.historyStatLabel, { color: colors.textSecondary }]}
            >
              Check in
            </Text>
          </View>
          <View
            style={[
              styles.historyDivider,
              { backgroundColor: colors.backgroundSelected },
            ]}
          />
          <View style={styles.historyStat}>
            <Text style={[styles.historyStatValue, { color: colors.text }]}>
              {entry.checkOut}
            </Text>
            <Text
              style={[styles.historyStatLabel, { color: colors.textSecondary }]}
            >
              Check out
            </Text>
          </View>
          <View
            style={[
              styles.historyDivider,
              { backgroundColor: colors.backgroundSelected },
            ]}
          />
          <View style={styles.historyStat}>
            <Text style={[styles.historyStatValue, { color: colors.text }]}>
              {entry.totalHours}
            </Text>
            <Text
              style={[styles.historyStatLabel, { color: colors.textSecondary }]}
            >
              Total hours
            </Text>
          </View>
        </View>

        <View style={styles.historyLocationRow}>
          <MapPin size={13} color={colors.primary} strokeWidth={2} />
          <Text
            style={[styles.historyLocation, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {entry.location}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { theme: colorMode } = useAppTheme();
  const colors = Colors[colorMode];

  if (isPending) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[styles.centered, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator color={colors.primary} size="large" />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const summaryTiles: SummaryTile[] = [
    {
      label: "Check In",
      sublabel: "Early",
      value: "07:58",
      icon: <CircleCheck size={18} color={colors.primary} strokeWidth={1.75} />,
      tint: "primary",
    },
    {
      label: "Check Out",
      sublabel: "Not yet",
      value: "17:00",
      icon: <Clock size={18} color={colors.textSecondary} strokeWidth={1.75} />,
      tint: "textSecondary",
      muted: true,
    },
    {
      label: "Absence",
      sublabel: "November",
      value: "3 Day",
      icon: <FileText size={18} color={colors.primary} strokeWidth={1.75} />,
      tint: "primary",
    },
    {
      label: "Total Attended",
      sublabel: "November",
      value: "15 Day",
      icon: <Users size={18} color={colors.primary} strokeWidth={1.75} />,
      tint: "primary",
    },
  ];

  const history: HistoryEntry[] = [
    {
      id: "22",
      day: "22",
      weekday: "Wed",
      checkIn: "07:57",
      checkOut: "17:00",
      totalHours: "08:03",
      location: "Office, West Jakarta, Indonesia",
    },
    {
      id: "21",
      day: "21",
      weekday: "Tue",
      checkIn: "08:03",
      checkOut: "17:08",
      totalHours: "08:05",
      location: "Campus Lab, South Wing",
    },
    {
      id: "20",
      day: "20",
      weekday: "Mon",
      checkIn: "07:59",
      checkOut: "16:54",
      totalHours: "07:56",
      location: "Main Building, Attendance Desk",
    },
  ];

  const displayName = getDisplayName(session);
  const todayLabel = formatDisplayDate(new Date());

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerBlock}>
          <View style={styles.headerRow}>
            <View style={styles.headerCopy}>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                Good Morning,
              </Text>
              <Text
                style={[styles.displayName, { color: colors.text }]}
                numberOfLines={1}
              >
                {displayName}
              </Text>
            </View>

            <Link href="/(navs)/notifications" asChild>
              <Pressable
                hitSlop={10}
                style={({ pressed }) => [
                  styles.notificationButton,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.backgroundSelected,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Bell size={24} color={colors.text} strokeWidth={1.75} />
              </Pressable>
            </Link>
          </View>

          <View style={styles.metaRow}>
            <View style={styles.dateWrap}>
              <CalendarDays
                size={14}
                color={colors.textSecondary}
                strokeWidth={1.75}
              />
              <Text style={[styles.dateText, { color: colors.text }]}>
                {todayLabel}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryGrid}>
          {summaryTiles.map((tile) => (
            <SummaryCard key={tile.label} tile={tile} colors={colors} />
          ))}
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader
            title="Attendance History"
            colors={colors}
            action={
              <Link href="/(navs)/attendance" asChild>
                <Pressable
                  hitSlop={10}
                  style={({ pressed }) => [
                    styles.sectionAction,
                    { opacity: pressed ? 0.72 : 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.sectionActionText,
                      { color: colors.primary },
                    ]}
                  >
                    See More
                  </Text>
                </Pressable>
              </Link>
            }
          />

          <View style={styles.historyList}>
            {history.map((entry) => (
              <HistoryCard key={entry.id} entry={entry} colors={colors} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 132,
    gap: 18,
  },

  headerBlock: {
    gap: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  greeting: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Outfit.regular,
  },
  displayName: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: Outfit.bold,
    letterSpacing: -0.5,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 10,
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  dateText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.medium,
  },
  locationChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  locationText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.medium,
    color: "#FFFFFF",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryCard: {
    width: (Dimensions.get("window").width - 52) / 2,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    minHeight: 138,
    gap: 8,
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryLabel: {
    fontSize: 14,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },
  summarySubLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.regular,
  },
  summaryValue: {
    marginTop: "auto",
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Outfit.bold,
    letterSpacing: -0.4,
  },

  sectionBlock: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Outfit.bold,
    letterSpacing: -0.2,
  },
  sectionAction: {
    minHeight: 32,
    justifyContent: "center",
  },
  sectionActionText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },

  historyList: {
    gap: 12,
  },
  historyCard: {
    flexDirection: "row",
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 12,
    alignItems: "stretch",
  },
  historyDateBlock: {
    width: 82,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 10,
    gap: 4,
  },
  historyDay: {
    fontSize: 28,
    lineHeight: 32,
    color: "#FFFFFF",
    fontFamily: Outfit.bold,
    letterSpacing: -0.6,
  },
  historyWeekday: {
    fontSize: 13,
    lineHeight: 18,
    color: "rgba(255, 255, 255, 0.92)",
    fontFamily: Outfit.medium,
  },
  historyDetails: {
    flex: 1,
    justifyContent: "center",
    gap: 10,
  },
  historyStatsRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  historyStat: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
    paddingHorizontal: 4,
  },
  historyStatValue: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Outfit.bold,
    letterSpacing: -0.2,
  },
  historyStatLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.regular,
  },
  historyDivider: {
    width: 1,
    borderRadius: 999,
  },
  historyLocationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 6,
  },
  historyLocation: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.medium,
  },

  footerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
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
    letterSpacing: 0.8,
  },
  footerTitle: {
    fontSize: 16,
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
    color: "#FFFFFF",
    fontFamily: Outfit.semiBold,
  },
});
