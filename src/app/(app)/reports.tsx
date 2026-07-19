import { Redirect } from "expo-router";
import {
    ArrowDownRight,
    ArrowUpRight,
    CalendarDays,
    CircleCheck,
    Clock3,
    Download,
    FileText,
    MapPin,
    TrendingUp,
    Users,
} from "lucide-react-native";
import React, { useMemo } from "react";
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
    useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors, Outfit } from "@/constants/theme";
import { useAppTheme } from "@/context/theme-context";
import { authClient } from "@/lib/auth-client";

type Palette = (typeof Colors)[keyof typeof Colors];

type StatCard = {
  label: string;
  value: string;
  delta: string;
  positive: boolean;
  icon: React.ReactNode;
  tint: keyof Palette;
};

type DayPoint = {
  day: string;
  rate: number;
  label: string;
};

type Insight = {
  title: string;
  body: string;
  icon: React.ReactNode;
};

const STAT_CARDS: StatCard[] = [
  {
    label: "Attendance Rate",
    value: "96%",
    delta: "+4% this month",
    positive: true,
    icon: <CircleCheck size={18} color="#FFFFFF" strokeWidth={1.8} />,
    tint: "primary",
  },
  {
    label: "Late Arrivals",
    value: "3",
    delta: "-2 from last month",
    positive: true,
    icon: <Clock3 size={18} color="#FFFFFF" strokeWidth={1.8} />,
    tint: "secondary",
  },
  {
    label: "Absent Days",
    value: "1",
    delta: "-1 from last month",
    positive: true,
    icon: <FileText size={18} color="#000000" strokeWidth={1.8} />,
    tint: "accent",
  },
  {
    label: "Tracked Sessions",
    value: "24",
    delta: "+6 this month",
    positive: true,
    icon: <Users size={18} color="#FFFFFF" strokeWidth={1.8} />,
    tint: "textSecondary",
  },
];

const WEEKLY_TRENDS: DayPoint[] = [
  { day: "Mon", rate: 98, label: "98%" },
  { day: "Tue", rate: 100, label: "100%" },
  { day: "Wed", rate: 94, label: "94%" },
  { day: "Thu", rate: 96, label: "96%" },
  { day: "Fri", rate: 88, label: "88%" },
  { day: "Sat", rate: 72, label: "72%" },
  { day: "Sun", rate: 90, label: "90%" },
];

const INSIGHTS: Insight[] = [
  {
    title: "Your strongest day is Tuesday",
    body: "You’ve been consistently early on Tuesdays, which is helping your average stay high.",
    icon: <TrendingUp size={18} color="#FFFFFF" strokeWidth={1.8} />,
  },
  {
    title: "Most check-ins happen at the main office",
    body: "A majority of your check-ins are coming from the same location, which keeps the record clean.",
    icon: <MapPin size={18} color="#FFFFFF" strokeWidth={1.8} />,
  },
  {
    title: "Perfect streak in progress",
    body: "You’ve stayed above 90% attendance for the last 4 tracked weeks.",
    icon: <CalendarDays size={18} color="#FFFFFF" strokeWidth={1.8} />,
  },
];

const styles = StyleSheet.create({
  statCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    minHeight: 154,
    gap: 8,
  },
  statIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontFamily: Outfit.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  statValue: {
    fontFamily: Outfit.bold,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: -0.7,
    marginTop: "auto",
  },
  statDeltaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statDelta: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
  },
  insightIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  insightCopy: {
    flex: 1,
    gap: 3,
  },
  insightTitle: {
    fontFamily: Outfit.semiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  insightBody: {
    fontFamily: Outfit.regular,
    fontSize: 12.5,
    lineHeight: 18,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  screen: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 18,
  },
  header: {
    gap: 14,
  },
  headerCopy: {
    gap: 6,
  },
  eyebrow: {
    fontFamily: Outfit.medium,
    fontSize: 13,
    lineHeight: 18,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: Outfit.bold,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Outfit.regular,
    fontSize: 14,
    lineHeight: 21,
  },
  exportButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  exportButtonText: {
    fontFamily: Outfit.semiBold,
    fontSize: 13,
    lineHeight: 18,
  },
  locationBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  locationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  locationCopy: {
    flex: 1,
    gap: 2,
  },
  bannerLabel: {
    fontFamily: Outfit.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  bannerValue: {
    fontFamily: Outfit.semiBold,
    fontSize: 14,
    lineHeight: 19,
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  section: {
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sectionTitle: {
    fontFamily: Outfit.bold,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  sectionPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  sectionPillText: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  chartCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    gap: 16,
  },
  chartMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  chartLabel: {
    fontFamily: Outfit.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  chartValue: {
    fontFamily: Outfit.bold,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  chartBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chartBadgeText: {
    fontFamily: Outfit.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  chartArea: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
    height: 170,
    paddingTop: 8,
  },
  trendItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
    height: "100%",
  },
  trendBarTrack: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
    borderRadius: 999,
    overflow: "hidden",
    minHeight: 112,
  },
  trendBarFill: {
    width: "100%",
    borderRadius: 999,
    minHeight: 16,
  },
  trendRate: {
    fontFamily: Outfit.bold,
    fontSize: 12,
    lineHeight: 16,
  },
  trendDay: {
    fontFamily: Outfit.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  insightList: {
    gap: 12,
  },
});

function StatTile({
  stat,
  colors,
  width,
}: {
  stat: StatCard;
  colors: Palette;
  width: number;
}) {
  const accent = colors[stat.tint];

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
      <View style={[styles.statIcon, { backgroundColor: `${accent}15` }]}>
        {stat.icon}
      </View>

      <Text style={[styles.statLabel, { color: colors.text }]}>
        {stat.label}
      </Text>
      <Text style={[styles.statValue, { color: colors.text }]}>
        {stat.value}
      </Text>

      <View style={styles.statDeltaRow}>
        {stat.positive ? (
          <ArrowUpRight size={12} color={colors.secondary} strokeWidth={2.2} />
        ) : (
          <ArrowDownRight
            size={12}
            color={colors.destructive}
            strokeWidth={2.2}
          />
        )}
        <Text
          style={[
            styles.statDelta,
            { color: stat.positive ? colors.secondary : colors.destructive },
          ]}
        >
          {stat.delta}
        </Text>
      </View>
    </View>
  );
}

function InsightCard({
  insight,
  colors,
}: {
  insight: Insight;
  colors: Palette;
}) {
  return (
    <View
      style={[
        styles.insightCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
        },
      ]}
    >
      <View style={[styles.insightIcon, { backgroundColor: colors.primary }]}>
        {insight.icon}
      </View>

      <View style={styles.insightCopy}>
        <Text style={[styles.insightTitle, { color: colors.text }]}>
          {insight.title}
        </Text>
        <Text style={[styles.insightBody, { color: colors.textSecondary }]}>
          {insight.body}
        </Text>
      </View>
    </View>
  );
}

function TrendBar({ item, colors }: { item: DayPoint; colors: Palette }) {
  return (
    <View style={styles.trendItem}>
      <View style={styles.trendBarTrack}>
        <View
          style={[
            styles.trendBarFill,
            {
              height: `${item.rate}%`,
              backgroundColor:
                item.rate >= 95
                  ? colors.primary
                  : item.rate >= 90
                    ? colors.secondary
                    : colors.accent,
            },
          ]}
        />
      </View>
      <Text style={[styles.trendRate, { color: colors.text }]}>
        {item.label}
      </Text>
      <Text style={[styles.trendDay, { color: colors.textSecondary }]}>
        {item.day}
      </Text>
    </View>
  );
}

export default function ReportsScreen() {
  const { data: session, isPending } = authClient.useSession();
  const { theme } = useAppTheme();
  const { width: screenWidth } = useWindowDimensions();
  const colors = Colors[theme] as Palette;
  const stylesWithTheme = useMemo(() => createStyles(colors), [colors]);
  const statCardWidth = Math.floor((screenWidth - 52) / 2);

  if (isPending) {
    return (
      <SafeAreaView
        edges={["top"]}
        style={[
          stylesWithTheme.centered,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <SafeAreaView
      edges={["top"]}
      style={[stylesWithTheme.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={stylesWithTheme.scroll}
        contentContainerStyle={stylesWithTheme.scrollContent}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={stylesWithTheme.header}>
          <View style={stylesWithTheme.headerCopy}>
            <Text
              style={[stylesWithTheme.eyebrow, { color: colors.textSecondary }]}
            >
              Reports
            </Text>
            <Text style={[stylesWithTheme.title, { color: colors.text }]}>
              Attendance Overview
            </Text>
            <Text
              style={[
                stylesWithTheme.subtitle,
                { color: colors.textSecondary },
              ]}
            >
              A quick look at your attendance history, weekly rhythm, and
              progress.
            </Text>
          </View>

          <Pressable
            style={({ pressed }) => [
              stylesWithTheme.exportButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            <Download
              size={16}
              color={colors.primaryForeground}
              strokeWidth={2}
            />
            <Text
              style={[
                stylesWithTheme.exportButtonText,
                { color: colors.primaryForeground },
              ]}
            >
              Export
            </Text>
          </Pressable>
        </View>

        <View style={stylesWithTheme.statGrid}>
          {STAT_CARDS.map((stat) => (
            <StatTile
              key={stat.label}
              stat={stat}
              colors={colors}
              width={statCardWidth}
            />
          ))}
        </View>

        <View style={stylesWithTheme.section}>
          <View style={stylesWithTheme.sectionHeader}>
            <Text
              style={[stylesWithTheme.sectionTitle, { color: colors.text }]}
            >
              Weekly trend
            </Text>
            <View
              style={[
                stylesWithTheme.sectionPill,
                { backgroundColor: colors.primaryMuted },
              ]}
            >
              <Text
                style={[
                  stylesWithTheme.sectionPillText,
                  { color: colors.primary },
                ]}
              >
                Last 7 days
              </Text>
            </View>
          </View>

          <View
            style={[
              stylesWithTheme.chartCard,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
            ]}
          >
            <View style={stylesWithTheme.chartMetaRow}>
              <View>
                <Text
                  style={[
                    stylesWithTheme.chartLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Average attendance
                </Text>
                <Text
                  style={[stylesWithTheme.chartValue, { color: colors.text }]}
                >
                  92.6%
                </Text>
              </View>

              <View
                style={[
                  stylesWithTheme.chartBadge,
                  { backgroundColor: `${colors.primary}12` },
                ]}
              >
                <TrendingUp size={14} color={colors.primary} strokeWidth={2} />
                <Text
                  style={[
                    stylesWithTheme.chartBadgeText,
                    { color: colors.primary },
                  ]}
                >
                  Stable growth
                </Text>
              </View>
            </View>

            <View style={stylesWithTheme.chartArea}>
              {WEEKLY_TRENDS.map((item) => (
                <TrendBar key={item.day} item={item} colors={colors} />
              ))}
            </View>
          </View>
        </View>

        <View style={stylesWithTheme.section}>
          <Text style={[stylesWithTheme.sectionTitle, { color: colors.text }]}>
            What stands out
          </Text>

          <View style={stylesWithTheme.insightList}>
            {INSIGHTS.map((insight) => (
              <InsightCard
                key={insight.title}
                insight={insight}
                colors={colors}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Palette) =>
  StyleSheet.create({
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
      paddingTop: 12,
      paddingBottom: 36,
      gap: 18,
    },
    header: {
      gap: 14,
    },
    headerCopy: {
      gap: 6,
    },
    eyebrow: {
      fontFamily: Outfit.medium,
      fontSize: 13,
      lineHeight: 18,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    title: {
      fontFamily: Outfit.bold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontFamily: Outfit.regular,
      fontSize: 14,
      lineHeight: 21,
    },
    exportButton: {
      alignSelf: "flex-start",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 999,
    },
    exportButtonText: {
      fontFamily: Outfit.semiBold,
      fontSize: 13,
      lineHeight: 18,
    },
    locationBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.backgroundElement,
      borderWidth: 1,
      borderColor: colors.backgroundSelected,
      borderRadius: 22,
      padding: 14,
    },
    locationIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    locationCopy: {
      flex: 1,
      gap: 2,
    },
    bannerLabel: {
      fontFamily: Outfit.medium,
      fontSize: 12,
      lineHeight: 16,
    },
    bannerValue: {
      fontFamily: Outfit.semiBold,
      fontSize: 14,
      lineHeight: 19,
    },
    statGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 12,
    },
    statCard: {
    borderRadius: 22,
      borderWidth: 1,
      padding: 16,
      minHeight: 154,
      gap: 8,
    },
    statIcon: {
      width: 38,
      height: 38,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    statLabel: {
      fontFamily: Outfit.medium,
      fontSize: 13,
      lineHeight: 18,
    },
    statValue: {
      fontFamily: Outfit.bold,
      fontSize: 30,
      lineHeight: 34,
      letterSpacing: -0.7,
      marginTop: "auto",
    },
    statDeltaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statDelta: {
      fontFamily: Outfit.semiBold,
      fontSize: 12,
      lineHeight: 16,
    },
    section: {
      gap: 12,
    },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    sectionTitle: {
      fontFamily: Outfit.bold,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.2,
    },
    sectionPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 999,
    },
    sectionPillText: {
      fontFamily: Outfit.semiBold,
      fontSize: 12,
      lineHeight: 16,
    },
    chartCard: {
      borderRadius: 24,
      borderWidth: 1,
      padding: 16,
      gap: 16,
    },
    chartMetaRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    chartLabel: {
      fontFamily: Outfit.medium,
      fontSize: 12,
      lineHeight: 16,
    },
    chartValue: {
      fontFamily: Outfit.bold,
      fontSize: 24,
      lineHeight: 30,
      letterSpacing: -0.3,
    },
    chartBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    chartBadgeText: {
      fontFamily: Outfit.semiBold,
      fontSize: 12,
      lineHeight: 16,
    },
    chartArea: {
      flexDirection: "row",
      alignItems: "flex-end",
      justifyContent: "space-between",
      gap: 8,
      height: 170,
      paddingTop: 8,
    },
    trendItem: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      gap: 8,
      height: "100%",
    },
    trendBarTrack: {
      width: "100%",
      flex: 1,
      justifyContent: "flex-end",
      borderRadius: 999,
      backgroundColor: colors.backgroundSelected,
      overflow: "hidden",
      minHeight: 112,
    },
    trendBarFill: {
      width: "100%",
      borderRadius: 999,
      minHeight: 16,
    },
    trendRate: {
      fontFamily: Outfit.bold,
      fontSize: 12,
      lineHeight: 16,
    },
    trendDay: {
      fontFamily: Outfit.medium,
      fontSize: 11,
      lineHeight: 14,
    },
    insightList: {
      gap: 12,
    },
    insightCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      borderRadius: 22,
      borderWidth: 1,
      padding: 14,
    },
    insightIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    insightCopy: {
      flex: 1,
      gap: 3,
    },
    insightTitle: {
      fontFamily: Outfit.semiBold,
      fontSize: 14,
      lineHeight: 19,
    },
    insightBody: {
      fontFamily: Outfit.regular,
      fontSize: 12.5,
      lineHeight: 18,
    },
  });
