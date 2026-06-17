import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
    ArrowLeft,
    CalendarCheck,
    CreditCard,
    Bell,
    Trophy,
    BookOpen,
    CheckCircle2,
} from 'lucide-react-native';

import { Colors } from '@/constants/theme';

// ─── Types ───────────────────────────────────────────────────────────────────

type FilterTab = 'All' | 'Unread' | 'Read';

interface NotificationItem {
    id: string;
    title: string;
    body: string;
    time: string;
    read: boolean;
    icon: 'booking' | 'payment' | 'reminder' | 'achievement' | 'class';
    group: 'Today' | 'Earlier';
    highlight?: { word: string };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const NOTIFICATIONS: NotificationItem[] = [
    {
        id: '1',
        title: 'Attendance Confirmed',
        body: 'Your attendance for CS301 has been recorded for today\'s session. Tap to ',
        time: '10:04 am',
        read: false,
        icon: 'booking',
        group: 'Today',
        highlight: { word: 'view details' },
    },
    {
        id: '2',
        title: 'Class Schedule Updated',
        body: 'Your MKT202 class has been moved to Room B-12. Check the updated schedule.',
        time: '9:23 am',
        read: false,
        icon: 'class',
        group: 'Today',
    },
    {
        id: '3',
        title: 'Session Reminder',
        body: "You have an upcoming lecture in 30 minutes. Don't forget to show up on time!",
        time: '10:04 am',
        read: true,
        icon: 'reminder',
        group: 'Earlier',
    },
    {
        id: '4',
        title: 'Class Cancelled',
        body: 'Your PHY101 class has been cancelled. You can ',
        time: '9:23 am',
        read: true,
        icon: 'reminder',
        group: 'Earlier',
        highlight: { word: 'reschedule' },
    },
    {
        id: '5',
        title: 'Report Generated',
        body: 'Your monthly attendance report is ready. A summary has been sent to your email.',
        time: '9:45 am',
        read: true,
        icon: 'payment',
        group: 'Earlier',
    },
    {
        id: '6',
        title: 'Goal Achieved',
        body: "Great job! You've attended your 30th class. Keep up the perfect streak!",
        time: '9:45 am',
        read: true,
        icon: 'achievement',
        group: 'Earlier',
    },
];

// ─── Icon Map ─────────────────────────────────────────────────────────────────

function NotifIcon({
    type,
    colors,
}: {
    type: NotificationItem['icon'];
    colors: any;
}) {
    const iconProps = { size: 20, strokeWidth: 1.6, color: colors.accent };
    const map = {
        booking: <CalendarCheck {...iconProps} />,
        payment: <CreditCard {...iconProps} />,
        reminder: <Bell {...iconProps} />,
        achievement: <Trophy {...iconProps} />,
        class: <BookOpen {...iconProps} />,
    };
    return (
        <View style={[styles.iconWrap, { backgroundColor: colors.iconBg }]}>
            {map[type]}
        </View>
    );
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotifRow({
    item,
    colors,
    isLast,
}: {
    item: NotificationItem;
    colors: any;
    isLast: boolean;
}) {
    const [pressed, setPressed] = useState(false);

    const bodyParts = item.highlight
        ? item.body.split(item.highlight.word)
        : null;

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPressIn={() => setPressed(true)}
            onPressOut={() => setPressed(false)}
            style={[
                styles.notifRow,
                { backgroundColor: pressed ? colors.accentMuted : 'transparent' },
            ]}
        >
            {/* Unread indicator */}
            {!item.read && (
                <View
                    style={[styles.unreadDot, { backgroundColor: colors.unreadDot }]}
                />
            )}

            <NotifIcon type={item.icon} colors={colors} />

            <View style={styles.notifContent}>
                <View style={styles.notifHeader}>
                    <Text
                        style={[
                            styles.notifTitle,
                            {
                                color: colors.text,
                                fontFamily: item.read ? 'Outfit_500Medium' : 'Outfit_700Bold',
                            },
                        ]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={[styles.notifTime, { color: colors.textMuted }]}>
                        {item.time}
                    </Text>
                </View>

                <Text style={[styles.notifBody, { color: colors.textSecondary }]}>
                    {bodyParts ? (
                        <>
                            {bodyParts[0]}
                            <Text style={[styles.notifHighlight, { color: colors.accent }]}>
                                {item.highlight!.word}
                            </Text>
                            {bodyParts[1]}
                        </>
                    ) : (
                        item.body
                    )}
                </Text>
            </View>

            {!isLast && (
                <View
                    style={[styles.divider, { backgroundColor: colors.divider }]}
                />
            )}
        </TouchableOpacity>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
    const scheme = useColorScheme();
    const colorMode = scheme === 'dark' ? 'dark' : 'light';
    const isDark = colorMode === 'dark';
    const themeColors = Colors[colorMode];

    const colors = {
        background: themeColors.background,
        surface: themeColors.backgroundElement,
        border: themeColors.backgroundSelected,
        text: themeColors.text,
        textSecondary: themeColors.textSecondary,
        textMuted: themeColors.textSecondary,
        accent: themeColors.primary,
        accentMuted: `${themeColors.primary}12`,
        iconBg: themeColors.primaryMuted,
        divider: themeColors.backgroundSelected,
        pillActive: themeColors.primary,
        pillActiveFg: themeColors.primaryForeground,
        pillInactive: themeColors.backgroundSelected,
        pillInactiveFg: themeColors.textSecondary,
        unreadDot: themeColors.primary,
    };

    const [activeTab, setActiveTab] = useState<FilterTab>('All');
    const [notifications, setNotifications] =
        useState<NotificationItem[]>(NOTIFICATIONS);

    const filtered = notifications.filter((n) => {
        if (activeTab === 'Unread') return !n.read;
        if (activeTab === 'Read') return n.read;
        return true;
    });

    const groups: Array<'Today' | 'Earlier'> = ['Today', 'Earlier'];

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markAllRead = () =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    const TABS: FilterTab[] = ['All', 'Unread', 'Read'];

    return (
        <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            {/* ── Header ── */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={styles.headerIcon}
                    activeOpacity={0.7}
                    onPress={() => router.back()}
                >
                    <ArrowLeft size={22} color={colors.text} strokeWidth={1.8} />
                </TouchableOpacity>

                <View style={styles.headerCenter}>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>
                        Notifications
                    </Text>
                    {unreadCount > 0 && (
                        <View
                            style={[styles.badge, { backgroundColor: colors.unreadDot }]}
                        >
                            <Text style={[styles.badgeText, { color: colors.pillActiveFg }]}>
                                {unreadCount}
                            </Text>
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.headerIcon, { backgroundColor: colors.iconBg }]}
                    activeOpacity={0.7}
                    onPress={markAllRead}
                >
                    <CheckCircle2 size={20} color={colors.accent} strokeWidth={1.6} />
                </TouchableOpacity>
            </View>

            {/* ── Filter Tabs ── */}
            <View style={[styles.tabRow, { backgroundColor: colors.background }]}>
                {TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setActiveTab(tab)}
                            activeOpacity={0.8}
                            style={[
                                styles.pill,
                                {
                                    backgroundColor: isActive
                                        ? colors.pillActive
                                        : colors.pillInactive,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.pillText,
                                    {
                                        color: isActive
                                            ? colors.pillActiveFg
                                            : colors.pillInactiveFg,
                                    },
                                ]}
                            >
                                {tab}
                            </Text>
                            {tab === 'Unread' && unreadCount > 0 && (
                                <View
                                    style={[
                                        styles.pillBadge,
                                        {
                                            backgroundColor: isActive
                                                ? colors.pillActiveFg
                                                : colors.unreadDot,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.pillBadgeText,
                                            {
                                                color: isActive ? colors.pillActive : colors.pillActiveFg,
                                            },
                                        ]}
                                    >
                                        {unreadCount}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </View>

            {/* ── List ── */}
            <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Bell size={36} color={colors.textMuted} strokeWidth={1.4} />
                        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                            No {activeTab.toLowerCase()} notifications
                        </Text>
                    </View>
                ) : (
                    groups.map((group) => {
                        const items = filtered.filter((n) => n.group === group);
                        if (items.length === 0) return null;

                        return (
                            <View key={group}>
                                <Text
                                    style={[styles.groupLabel, { color: colors.textSecondary }]}
                                >
                                    {group}
                                </Text>

                                <View
                                    style={[
                                        styles.groupCard,
                                        {
                                            backgroundColor: colors.surface,
                                            borderColor: colors.border,
                                        },
                                    ]}
                                >
                                    {items.map((item, idx) => (
                                        <NotifRow
                                            key={item.id}
                                            item={item}
                                            colors={colors}
                                            isLast={idx === items.length - 1}
                                        />
                                    ))}
                                </View>
                            </View>
                        );
                    })
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    safe: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    headerIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        letterSpacing: -0.3,
    },
    badge: {
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: 'Outfit_700Bold',
    },
    tabRow: {
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    pillText: {
        fontSize: 13,
        letterSpacing: 0.1,
        fontFamily: 'Outfit_600SemiBold',
    },
    pillBadge: {
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    pillBadgeText: {
        fontSize: 10,
        fontFamily: 'Outfit_700Bold',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        gap: 8,
    },
    groupLabel: {
        fontSize: 12,
        letterSpacing: 0.6,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 8,
        fontFamily: 'Outfit_600SemiBold',
    },
    groupCard: {
        borderRadius: 20,
        borderWidth: 1,
        overflow: 'hidden',
        marginBottom: 8,
    },
    notifRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        position: 'relative',
    },
    unreadDot: {
        position: 'absolute',
        left: 6,
        top: 20,
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    iconWrap: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    notifContent: {
        flex: 1,
        gap: 4,
    },
    notifHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    notifTitle: {
        fontSize: 14,
        letterSpacing: -0.1,
        flex: 1,
    },
    notifTime: {
        fontSize: 11,
        fontFamily: 'Outfit_400Regular',
        flexShrink: 0,
    },
    notifBody: {
        fontSize: 12.5,
        lineHeight: 18,
        fontFamily: 'Outfit_400Regular',
    },
    notifHighlight: {
        fontFamily: 'Outfit_700Bold',
    },
    divider: {
        position: 'absolute',
        bottom: 0,
        left: 72,
        right: 16,
        height: 1,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 80,
        gap: 12,
    },
    emptyText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
    },
});