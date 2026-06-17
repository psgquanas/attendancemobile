import React, { useState } from 'react';
import { Stack } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Calendar1,
  GraduationCap,
  Layers3,
  Plus,
  UserPlus,
  Users,
  Sparkles,
  Radio,
} from 'lucide-react-native';

import { Colors, Outfit } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

interface MyClass {
  id: string;
  name: string;
  code: string;
  sessions: number;
  members: number;
  avgAttendance: number;
}

interface JoinedClass {
  id: string;
  name: string;
  host: string;
  isLive: boolean;
  attendance: number;
  sessionsLeft: string;
}

type TabKey = 'my' | 'joined';

const myClasses: MyClass[] = [
  {
    id: '1',
    name: 'Intro to UI Design',
    code: 'ABCD-123',
    sessions: 24,
    members: 45,
    avgAttendance: 92,
  },
  {
    id: '2',
    name: 'Mobile UX Fundamentals',
    code: 'MXUF-456',
    sessions: 18,
    members: 32,
    avgAttendance: 87,
  },
];

const joinedClasses: JoinedClass[] = [
  {
    id: '1',
    name: 'Advanced Figma Systems',
    host: 'Jane Doe',
    isLive: true,
    attendance: 84,
    sessionsLeft: '3 sessions left',
  },
  {
    id: '2',
    name: 'Design Tokens Workshop',
    host: 'Mark Evans',
    isLive: false,
    attendance: 76,
    sessionsLeft: '5 sessions left',
  },
];

type Palette = (typeof Colors)[keyof typeof Colors];

function StatCard({
  label,
  value,
  helper,
  icon,
  color,
  colors,
  width,
}: {
  label: string;
  value: string;
  helper: string;
  icon: React.ReactNode;
  color: string;
  colors: Palette;
  width: number;
}) {
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
      <View style={[styles.statIconWrap, { backgroundColor: `${color}14` }]}>
        {icon}
      </View>
      <Text style={[styles.statLabel, { color: colors.text }]} selectable>
        {label}
      </Text>
      <Text
        style={[styles.statValue, { color: colors.text }]}
        selectable
        numberOfLines={1}
      >
        {value}
      </Text>
      <Text style={[styles.statHelper, { color: colors.textSecondary }]} selectable>
        {helper}
      </Text>
    </View>
  );
}

function SegmentButton({
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
        styles.segmentButton,
        {
          backgroundColor: active ? colors.primary : colors.backgroundSelected,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.segmentLabel,
          { color: active ? colors.primaryForeground : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.segmentBadge,
          {
            backgroundColor: active ? colors.primaryForeground : colors.backgroundElement,
          },
        ]}
      >
        <Text
          style={[
            styles.segmentBadgeText,
            { color: active ? colors.primary : colors.text },
          ]}
        >
          {count}
        </Text>
      </View>
    </Pressable>
  );
}

function MyClassCard({
  item,
  colors,
}: {
  item: MyClass;
  colors: Palette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.classCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.classAccent, { backgroundColor: colors.primary }]} />

      <View style={styles.classBody}>
        <View style={styles.classHeader}>
          <View style={styles.classTitleBlock}>
            <Text style={[styles.classTitle, { color: colors.text }]} selectable>
              {item.name}
            </Text>
            <View style={[styles.codeChip, { backgroundColor: colors.primaryMuted }]}>
              <Text style={[styles.codeChipText, { color: colors.primary }]} selectable>
                {item.code}
              </Text>
            </View>
          </View>
          <View style={[styles.classMetaChip, { backgroundColor: `${colors.primary}14` }]}>
            <Sparkles size={13} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.classMetaChipText, { color: colors.primary }]} selectable>
              Managed
            </Text>
          </View>
        </View>

        <View style={styles.classStatsRow}>
          <View style={styles.classStat}>
            <Calendar1 size={15} color={colors.textSecondary} strokeWidth={1.8} />
            <Text style={[styles.classStatValue, { color: colors.text }]} selectable>
              {item.sessions}
            </Text>
            <Text style={[styles.classStatLabel, { color: colors.textSecondary }]} selectable>
              Sessions
            </Text>
          </View>

          <View style={[styles.classStatDivider, { backgroundColor: colors.backgroundSelected }]} />

          <View style={styles.classStat}>
            <Users size={15} color={colors.textSecondary} strokeWidth={1.8} />
            <Text style={[styles.classStatValue, { color: colors.text }]} selectable>
              {item.members}
            </Text>
            <Text style={[styles.classStatLabel, { color: colors.textSecondary }]} selectable>
              Members
            </Text>
          </View>

          <View style={[styles.classStatDivider, { backgroundColor: colors.backgroundSelected }]} />

          <View style={styles.classStat}>
            <Layers3 size={15} color={colors.textSecondary} strokeWidth={1.8} />
            <Text style={[styles.classStatValue, { color: colors.text }]} selectable>
              {item.avgAttendance}%
            </Text>
            <Text style={[styles.classStatLabel, { color: colors.textSecondary }]} selectable>
              Attendance
            </Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]} selectable>
            Average attendance
          </Text>
          <Text style={[styles.progressValue, { color: colors.primary }]} selectable>
            {item.avgAttendance}%
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSelected }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.avgAttendance}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

function JoinedClassCard({
  item,
  colors,
}: {
  item: JoinedClass;
  colors: Palette;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.classCard,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.backgroundSelected,
          opacity: pressed ? 0.92 : 1,
        },
      ]}
    >
      <View style={[styles.classAccent, { backgroundColor: colors.secondary }]} />

      <View style={styles.classBody}>
        <View style={styles.classHeader}>
          <View style={styles.classTitleBlock}>
            <View style={styles.titleRow}>
              <Text style={[styles.classTitle, { color: colors.text, flex: 1 }]} selectable>
                {item.name}
              </Text>
              {item.isLive ? (
                <View style={[styles.liveBadge, { backgroundColor: `${colors.destructive}18`, borderColor: colors.destructive }]}>
                  <Radio size={11} color={colors.destructive} strokeWidth={2} />
                  <Text style={[styles.liveBadgeText, { color: colors.destructive }]} selectable>
                    Live
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.hostText, { color: colors.textSecondary }]} selectable>
              Hosted by {item.host}
            </Text>
          </View>
        </View>

        <View style={styles.joinedMetaRow}>
          <View style={[styles.joinedMetaChip, { backgroundColor: colors.primaryMuted }]}>
            <UserPlus size={13} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.joinedMetaText, { color: colors.primary }]} selectable>
              {item.sessionsLeft}
            </Text>
          </View>
          <View style={[styles.joinedMetaChip, { backgroundColor: colors.backgroundSelected }]}>
            <Layers3 size={13} color={colors.textSecondary} strokeWidth={2} />
            <Text style={[styles.joinedMetaText, { color: colors.textSecondary }]} selectable>
              {item.attendance}% attendance
            </Text>
          </View>
        </View>

        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]} selectable>
            Your progress
          </Text>
          <Text style={[styles.progressValue, { color: colors.secondary }]} selectable>
            {item.attendance}%
          </Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.backgroundSelected }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${item.attendance}%`,
                backgroundColor: colors.secondary,
              },
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

export default function MyClassesScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('my');
  const { theme } = useAppTheme();
  const colors = Colors[theme];
  const isDark = theme === 'dark';
  const { width: screenWidth } = useWindowDimensions();
  const summaryCardWidth = (screenWidth - 40 - 12) / 2;

  const summary = {
    myCount: myClasses.length,
    joinedCount: joinedClasses.length,
    liveCount: joinedClasses.filter((item) => item.isLive).length,
    memberCount: myClasses.reduce((total, item) => total + item.members, 0),
  };

  const visibleClasses = activeTab === 'my' ? myClasses : joinedClasses;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <Stack.Screen options={{ title: 'Classes' }} />
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroBlock}>
          <View style={styles.heroHeader}>
            <View style={styles.heroCopy}>
              <Text style={[styles.kicker, { color: colors.textSecondary }]} selectable>
                Class overview
              </Text>
              <Text style={[styles.heroTitle, { color: colors.text }]} selectable>
                Organize your rooms and the courses you joined
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]} selectable>
                A quick snapshot of active classes, attendance, and what is live right now.
              </Text>
            </View>

            <View style={[styles.heroBadge, { backgroundColor: colors.primary }]}>
              <GraduationCap size={18} color={colors.primaryForeground} strokeWidth={1.9} />
              <Text style={styles.heroBadgeText} selectable>
                {summary.liveCount} live
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <StatCard
              label="My classes"
              value={`${summary.myCount}`}
              helper="Created by you"
              icon={<Sparkles size={18} color={colors.primary} strokeWidth={1.9} />}
              color={colors.primary}
              colors={colors}
              width={summaryCardWidth}
            />
            <StatCard
              label="Joined classes"
              value={`${summary.joinedCount}`}
              helper="Visible on your feed"
              icon={<Layers3 size={18} color={colors.secondary} strokeWidth={1.9} />}
              color={colors.secondary}
              colors={colors}
              width={summaryCardWidth}
            />
            <StatCard
              label="Live now"
              value={`${summary.liveCount}`}
              helper="Needs attention"
              icon={<Radio size={18} color={colors.destructive} strokeWidth={1.9} />}
              color={colors.destructive}
              colors={colors}
              width={summaryCardWidth}
            />
            <StatCard
              label="Total members"
              value={`${summary.memberCount}`}
              helper="Across your classes"
              icon={<Users size={18} color={colors.primary} strokeWidth={1.9} />}
              color={colors.primary}
              colors={colors}
              width={summaryCardWidth}
            />
          </View>
        </View>

        <View style={styles.segmentRow}>
          <SegmentButton
            active={activeTab === 'my'}
            label="My Classes"
            count={summary.myCount}
            colors={colors}
            onPress={() => setActiveTab('my')}
          />
          <SegmentButton
            active={activeTab === 'joined'}
            label="Joined"
            count={summary.joinedCount}
            colors={colors}
            onPress={() => setActiveTab('joined')}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]} selectable>
            {activeTab === 'my' ? 'Your classes' : 'Joined classes'}
          </Text>
          <Text style={[styles.sectionMeta, { color: colors.textSecondary }]} selectable>
            {visibleClasses.length} total
          </Text>
        </View>

        <View style={styles.classList}>
          {activeTab === 'my'
            ? myClasses.map((item) => <MyClassCard key={item.id} item={item} colors={colors} />)
            : joinedClasses.map((item) => <JoinedClassCard key={item.id} item={item} colors={colors} />)}
        </View>

        <View
          style={[
            styles.footerCard,
            {
              backgroundColor: colors.backgroundElement,
              borderColor: colors.backgroundSelected,
            },
          ]}
        >
          <View style={styles.footerCopy}>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]} selectable>
              Quick action
            </Text>
            <Text style={[styles.footerTitle, { color: colors.text }]} selectable>
              Create a new class or invite more students
            </Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.footerButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.86 : 1,
              },
            ]}
          >
            <Plus size={16} color={colors.primaryForeground} strokeWidth={2.3} />
            <Text style={[styles.footerButtonText, { color: colors.primaryForeground }]} selectable>
              New
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 128,
    gap: 18,
  },

  heroBlock: {
    gap: 16,
  },
  heroHeader: {
    gap: 14,
  },
  heroCopy: {
    gap: 8,
  },
  kicker: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontFamily: Outfit.bold,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: Outfit.regular,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  heroBadgeText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
    color: '#FFFFFF',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  statIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },
  statValue: {
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Outfit.bold,
    letterSpacing: -0.4,
    fontVariant: ['tabular-nums'],
  },
  statHelper: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.regular,
  },

  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  segmentLabel: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },
  segmentBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  segmentBadgeText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.bold,
    fontVariant: ['tabular-nums'],
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontFamily: Outfit.bold,
    letterSpacing: -0.2,
  },
  sectionMeta: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.medium,
  },

  classList: {
    gap: 12,
  },
  classCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 22,
    overflow: 'hidden',
    borderCurve: 'continuous',
  },
  classAccent: {
    width: 5,
  },
  classBody: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  classHeader: {
    gap: 10,
  },
  classTitleBlock: {
    gap: 8,
  },
  classTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: Outfit.semiBold,
    letterSpacing: -0.2,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  codeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  codeChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.semiBold,
    letterSpacing: 0.4,
  },
  classMetaChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  classMetaChipText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.semiBold,
  },
  classStatsRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  classStat: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  classStatValue: {
    fontSize: 18,
    lineHeight: 22,
    fontFamily: Outfit.bold,
    fontVariant: ['tabular-nums'],
  },
  classStatLabel: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.regular,
  },
  classStatDivider: {
    width: StyleSheet.hairlineWidth,
    marginVertical: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  progressLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.medium,
  },
  progressValue: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.bold,
    fontVariant: ['tabular-nums'],
  },
  progressTrack: {
    width: '100%',
    height: 7,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
  },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  liveBadgeText: {
    fontSize: 10,
    lineHeight: 12,
    fontFamily: Outfit.bold,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  hostText: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: Outfit.regular,
  },
  joinedMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  joinedMetaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  joinedMetaText: {
    fontSize: 11,
    lineHeight: 14,
    fontFamily: Outfit.semiBold,
  },

  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    borderWidth: 1,
    borderRadius: 22,
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
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  footerTitle: {
    fontSize: 15,
    lineHeight: 21,
    fontFamily: Outfit.bold,
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  footerButtonText: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: Outfit.semiBold,
  },
});
