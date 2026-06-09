import React from 'react';
import { Redirect } from 'expo-router';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Clock,
  CircleCheck,
  FileText,
  PlusCircle,
  MapPin,
} from 'lucide-react-native';
import { Colors } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';

type StatCard = {
  label: string;
  value: string | number;
  accent: string;
};

type Session = {
  id: string;
  title: string;
  room: string;
  time: string;
  status: 'live' | 'upcoming';
  checkedIn?: number;
};

type ActivityItem = {
  id: string;
  icon: React.ReactNode;
  title: string;
  time: string;
  accentColor: string;
};

function StatCardItem({ card, colors }: { card: StatCard; colors: typeof Colors[keyof typeof Colors] }) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.backgroundElement }]}>
      <View style={[styles.statAccentBar, { backgroundColor: card.accent }]} />
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{card.label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{card.value}</Text>
    </View>
  );
}

function SessionCard({ session, colors }: { session: Session; colors: typeof Colors[keyof typeof Colors] }) {
  const isLive = session.status === 'live';
  return (
    <View style={[
      styles.sessionCard,
      {
        backgroundColor: colors.backgroundElement,
        borderColor: colors.backgroundSelected,
      }
    ]}>
      <View style={styles.sessionCardHeader}>
        <View style={[
          styles.statusPill,
          { backgroundColor: isLive ? 'rgba(239, 68, 68, 0.12)' : colors.backgroundSelected }
        ]}>
          {isLive && <View style={styles.liveDot} />}
          <Text style={[
            styles.statusPillText,
            { color: isLive ? '#EF4444' : colors.textSecondary }
          ]}>
            {isLive ? 'LIVE' : 'Upcoming'}
          </Text>
        </View>
        <View style={styles.sessionTime}>
          <Clock size={12} color={colors.textSecondary} strokeWidth={1.5} />
          <Text style={[styles.sessionTimeText, { color: colors.textSecondary }]}>{session.time}</Text>
        </View>
      </View>

      <View style={styles.sessionCardBody}>
        <Text style={[styles.sessionTitle, { color: colors.text }]} numberOfLines={1}>
          {session.title}
        </Text>
        <View style={styles.sessionRoomContainer}>
          <MapPin size={12} color={colors.textSecondary} strokeWidth={1.5} />
          <Text style={[styles.sessionRoom, { color: colors.textSecondary }]} numberOfLines={1}>
            {session.room}
          </Text>
        </View>
      </View>

      <View style={styles.sessionFooter}>
        {isLive && session.checkedIn !== undefined ? (
          <>
            <View style={styles.avatarStack}>
              {['A', 'M'].map((l, i) => (
                <View
                  key={i}
                  style={[
                    styles.avatar,
                    {
                      backgroundColor: colors.backgroundSelected,
                      borderColor: colors.backgroundElement,
                      marginLeft: i === 0 ? 0 : -8,
                    }
                  ]}
                >
                  <Text style={[styles.avatarText, { color: colors.text }]}>{l}</Text>
                </View>
              ))}
            </View>
            <Text style={[styles.checkedInText, { color: colors.textSecondary }]}>
              +{session.checkedIn} Checked-in
            </Text>
          </>
        ) : (
          <Text style={[styles.waitingText, { color: colors.textSecondary }]}>
            Waiting to start...
          </Text>
        )}
      </View>
    </View>
  );
}

function ActivityRow({ item, isLast, colors }: {
  item: ActivityItem;
  isLast: boolean;
  colors: typeof Colors[keyof typeof Colors];
}) {
  return (
    <View style={styles.activityRow}>
      {!isLast && <View style={[styles.timelineLine, { backgroundColor: colors.backgroundSelected }]} />}
      <View style={[styles.activityIcon, { backgroundColor: colors.background, borderColor: colors.backgroundSelected }]}>
        {item.icon}
      </View>
      <View style={styles.activityContent}>
        <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
        <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{item.time}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const { data: session, isPending } = authClient.useSession();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const ACCENT_BLUE = '#6366F1';
  const ACCENT_AMBER = '#F59E0B';
  const ACCENT_GREEN = '#10B981';
  const ACCENT_PINK = '#F472B6';

  if (isPending) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.text} size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const statCards: StatCard[] = [
    { label: 'Classes Created', value: 12, accent: ACCENT_BLUE },
    { label: 'Classes Joined', value: 8, accent: ACCENT_AMBER },
    { label: 'Overall Attendance', value: '94%', accent: ACCENT_GREEN },
    { label: 'Active Sessions', value: 3, accent: ACCENT_PINK },
  ];

  const sessions: Session[] = [
    { id: '1', title: 'Advanced Mathematics', room: 'Room 302-B', time: '10:00 AM', status: 'live', checkedIn: 22 },
    { id: '2', title: 'Data Structures', room: 'Lab 4A', time: '11:30 AM', status: 'upcoming' },
  ];

  const activities: ActivityItem[] = [
    {
      id: '1',
      icon: <CircleCheck size={14} color={ACCENT_BLUE} strokeWidth={1.5} />,
      title: 'Checked into Physics',
      time: 'Today, 09:15 AM',
      accentColor: ACCENT_BLUE,
    },
    {
      id: '2',
      icon: <FileText size={14} color={ACCENT_AMBER} strokeWidth={1.5} />,
      title: 'Weekly Report Generated',
      time: 'Yesterday, 18:00 PM',
      accentColor: ACCENT_AMBER,
    },
    {
      id: '3',
      icon: <PlusCircle size={14} color={colors.textSecondary} strokeWidth={1.5} />,
      title: 'Created new class "Seminar"',
      time: 'Oct 12, 14:30 PM',
      accentColor: colors.textSecondary,
    },
    {
      id: '4',
      icon: <PlusCircle size={14} color={colors.textSecondary} strokeWidth={1.5} />,
      title: 'Created new class "Seminar"',
      time: 'Oct 12, 14:30 PM',
      accentColor: colors.textSecondary,
    },
    {
      id: '5',
      icon: <PlusCircle size={14} color={colors.textSecondary} strokeWidth={1.5} />,
      title: 'Created new class "Seminar"',
      time: 'Oct 12, 14:30 PM',
      accentColor: colors.textSecondary,
    },
  ];

  return (
    <View style={[styles.safe, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Stat Cards */}
        <View style={styles.statGrid}>
          {statCards.map((card, i) => (
            <StatCardItem key={i} card={card} colors={colors} />
          ))}
        </View>

        {/* Active Sessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Sessions</Text>
            <TouchableOpacity>
              <Text style={[styles.viewAll, { color: ACCENT_BLUE }]}>View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.hScroll}
            contentContainerStyle={styles.hScrollContent}
          >
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} colors={colors} />
            ))}
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, styles.sectionLast]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
          <View style={styles.timeline}>
            {activities.map((item, i) => (
              <ActivityRow
                key={item.id}
                item={item}
                isLast={i === activities.length - 1}
                colors={colors}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  appName: {
    fontSize: 10,
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  headerGreetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: -0.5,
  },
  logoutBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  logoutBtnText: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110, // padding to avoid floating tab bar overlap
    gap: 24,
  },

  // Stat grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 16,
    minHeight: 96,
    justifyContent: 'space-between',
    overflow: 'hidden',
  },
  statAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Outfit_500Medium',
    letterSpacing: 0.2,
  },
  statValue: {
    fontSize: 26,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: -0.5,
    marginTop: 8,
  },

  // Section
  section: { gap: 12 },
  sectionLast: { paddingBottom: 8 },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 0.1,
  },
  viewAll: {
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
  },
  hScroll: {
    marginHorizontal: -20,
  },
  hScrollContent: {
    paddingLeft: 20,
    paddingRight: 6,
  },

  // Session cards
  sessionCard: {
    borderRadius: 16,
    padding: 16,
    width: 250,
    height: 145,
    marginRight: 14,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  sessionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  statusPillText: {
    fontSize: 10,
    fontFamily: 'Outfit_700Bold',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sessionTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionTimeText: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
  },
  sessionCardBody: {
    gap: 2,
  },
  sessionTitle: {
    fontSize: 15,
    fontFamily: 'Outfit_600SemiBold',
  },
  sessionRoomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sessionRoom: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 24, // keep constant height for both states
  },
  avatarStack: {
    flexDirection: 'row',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 9,
    fontFamily: 'Outfit_700Bold',
  },
  checkedInText: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
  },
  waitingText: {
    fontSize: 11,
    fontFamily: 'Outfit_500Medium',
  },

  // Timeline
  timeline: {
    marginLeft: 8,
    gap: 0,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 20,
    position: 'relative',
  },
  timelineLine: {
    position: 'absolute',
    left: 13,
    top: 28,
    bottom: -20,
    width: 1,
  },
  activityIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  activityContent: {
    flex: 1,
    paddingTop: 2,
  },
  activityTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    lineHeight: 20,
  },
  activityTime: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
    marginTop: 2,
  },
});