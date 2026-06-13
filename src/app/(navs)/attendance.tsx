import { useMemo } from 'react';
import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    useColorScheme,
    View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    MapPin,
    CircleCheck,
} from 'lucide-react-native';

import { Colors, Outfit } from '@/constants/theme';

type Palette = typeof Colors.light;

type CalendarCell = {
    day: number;
    muted?: boolean;
    marked?: boolean;
    selected?: boolean;
};

type AttendanceEntry = {
    id: string;
    day: string;
    weekday: string;
    checkIn: string;
    checkOut: string;
    totalHours: string;
    location: string;
    featured?: boolean;
};

const MONTH_LABEL = 'November 2023';
const LOCATION_LABEL = 'Office, West Jakarta, Indonesia';

const CALENDAR_WEEKS: Array<Array<CalendarCell | null>> = [
    [{ day: 29, muted: true }, { day: 30, muted: true }, { day: 31, muted: true }, { day: 1 }, { day: 2 }, { day: 3 }, { day: 4, muted: true }],
    [{ day: 5, muted: true }, { day: 6 }, { day: 7 }, { day: 8 }, { day: 9 }, { day: 10 }, { day: 11, muted: true }],
    [{ day: 12, muted: true }, { day: 13, marked: true }, { day: 14, marked: true }, { day: 15, marked: true }, { day: 16 }, { day: 17 }, { day: 18, muted: true }],
    [{ day: 19, muted: true }, { day: 20 }, { day: 21 }, { day: 22 }, { day: 23, selected: true }, { day: 24 }, { day: 25, muted: true }],
    [{ day: 26, muted: true }, { day: 27 }, { day: 28 }, { day: 29 }, { day: 30 }, { day: 1, muted: true }, { day: 2, muted: true }],
];

const ATTENDANCE_HISTORY: AttendanceEntry[] = [
    {
        id: '23',
        day: '23',
        weekday: 'Thu',
        checkIn: '07:58',
        checkOut: '-',
        totalHours: '-',
        location: LOCATION_LABEL,
        featured: true,
    },
    {
        id: '22',
        day: '22',
        weekday: 'Wed',
        checkIn: '07:57',
        checkOut: '17:00',
        totalHours: '08:03',
        location: LOCATION_LABEL,
    },
    {
        id: '21',
        day: '21',
        weekday: 'Tue',
        checkIn: '08:03',
        checkOut: '17:08',
        totalHours: '08:05',
        location: LOCATION_LABEL,
    },
];

function CalendarDay({
    cell,
    colors,
}: {
    cell: CalendarCell | null;
    colors: Palette;
}) {
    if (!cell) {
        return <View style={styles.calendarDay} />;
    }

    const isMuted = Boolean(cell.muted);
    const isSelected = Boolean(cell.selected);

    return (
        <View
            style={[
                styles.calendarDay,
                isSelected && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                    shadowColor: colors.primary,
                },
            ]}
        >
            <Text
                style={[
                    styles.calendarDayText,
                    {
                        color: isSelected ? colors.primaryForeground : isMuted ? colors.textSecondary : colors.text,
                    },
                ]}
            >
                {cell.day}
            </Text>
            {cell.marked && !isSelected && <View style={[styles.calendarDot, { backgroundColor: colors.secondary }]} />}
            {isSelected && <View style={[styles.calendarDot, { backgroundColor: colors.primaryForeground }]} />}
        </View>
    );
}

function AttendanceCard({
    entry,
    colors,
}: {
    entry: AttendanceEntry;
    colors: Palette;
}) {
    const featured = Boolean(entry.featured);

    return (
        <View
            style={[
                styles.attendanceCard,
                {
                    backgroundColor: featured ? colors.primary : colors.backgroundElement,
                    borderColor: featured ? colors.primary : colors.backgroundSelected,
                },
            ]}
        >
            <View
                style={[
                    styles.dateBlock,
                    {
                        backgroundColor: featured ? colors.backgroundElement : colors.primary,
                    },
                ]}
            >
                <Text
                    style={[
                        styles.dateValue,
                        {
                            color: featured ? colors.primary : colors.primaryForeground,
                        },
                    ]}
                >
                    {entry.day}
                </Text>
                <Text
                    style={[
                        styles.dateWeekday,
                        {
                            color: featured ? colors.textSecondary : 'rgba(255,255,255,0.9)',
                        },
                    ]}
                >
                    {entry.weekday}
                </Text>
            </View>

            <View style={styles.cardBody}>
                <View style={styles.metricRow}>
                    <View style={styles.metric}>
                        <Text
                            style={[
                                styles.metricValue,
                                { color: featured ? colors.primaryForeground : colors.text },
                            ]}
                        >
                            {entry.checkIn}
                        </Text>
                        <Text
                            style={[
                                styles.metricLabel,
                                { color: featured ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                            ]}
                        >
                            Check In
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.metricDivider,
                            { backgroundColor: featured ? 'rgba(255,255,255,0.18)' : colors.backgroundSelected },
                        ]}
                    />

                    <View style={styles.metric}>
                        <Text
                            style={[
                                styles.metricValue,
                                { color: featured ? colors.primaryForeground : colors.text },
                            ]}
                        >
                            {entry.checkOut}
                        </Text>
                        <Text
                            style={[
                                styles.metricLabel,
                                { color: featured ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                            ]}
                        >
                            Check Out
                        </Text>
                    </View>

                    <View
                        style={[
                            styles.metricDivider,
                            { backgroundColor: featured ? 'rgba(255,255,255,0.18)' : colors.backgroundSelected },
                        ]}
                    />

                    <View style={styles.metric}>
                        <Text
                            style={[
                                styles.metricValue,
                                { color: featured ? colors.primaryForeground : colors.text },
                            ]}
                        >
                            {entry.totalHours}
                        </Text>
                        <Text
                            style={[
                                styles.metricLabel,
                                { color: featured ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
                            ]}
                        >
                            Total Hours
                        </Text>
                    </View>
                </View>

                <View style={styles.locationRow}>
                    <MapPin size={13} color={featured ? colors.primaryForeground : colors.secondary} strokeWidth={2} />
                    <Text
                        style={[
                            styles.locationText,
                            { color: featured ? 'rgba(255,255,255,0.84)' : colors.textSecondary },
                        ]}
                        numberOfLines={1}
                    >
                        {entry.location}
                    </Text>
                    {featured && (
                        <View style={[styles.statusPill, { backgroundColor: colors.secondary }]}>
                            <CircleCheck size={12} color={colors.secondaryForeground} strokeWidth={2} />
                            <Text style={[styles.statusText, { color: colors.secondaryForeground }]}>On time</Text>
                        </View>
                    )}
                </View>
            </View>
        </View>
    );
}

export default function Attendance() {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'dark' ? 'dark' : 'light'] as Palette;
    const router = useRouter();

    const calendarHeader = useMemo(
        () => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        [],
    );

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                contentInsetAdjustmentBehavior="automatic"
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.hero}>
                    <View style={styles.topRow}>
                        <Pressable
                            onPress={() => router.back()}
                            hitSlop={12}
                            style={({ pressed }) => [
                                styles.backButton,
                                {
                                    backgroundColor: colors.backgroundElement,
                                    borderColor: colors.backgroundSelected,
                                    opacity: pressed ? 0.82 : 1,
                                },
                            ]}
                        >
                            <ChevronLeft size={20} color={colors.text} strokeWidth={2} />
                        </Pressable>

                        <View style={styles.titleWrap}>
                            <Text style={[styles.eyebrow, { color: colors.textSecondary }]}>Attendance History</Text>
                            <Text style={[styles.title, { color: colors.text }]}>Track every check-in</Text>
                        </View>

                        <View style={styles.spacer} />
                    </View>

                    <View style={[styles.monthCard, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
                        <View style={styles.monthHeader}>
                            <Pressable
                                hitSlop={10}
                                style={({ pressed }) => [
                                    styles.monthArrow,
                                    { backgroundColor: colors.background, opacity: pressed ? 0.8 : 1 },
                                ]}
                            >
                                <ChevronLeft size={16} color={colors.primary} strokeWidth={2} />
                            </Pressable>

                            <View style={styles.monthLabelWrap}>
                                <CalendarDays size={15} color={colors.secondary} strokeWidth={2} />
                                <Text style={[styles.monthLabel, { color: colors.text }]}>{MONTH_LABEL}</Text>
                            </View>

                            <Pressable
                                hitSlop={10}
                                style={({ pressed }) => [
                                    styles.monthArrow,
                                    { backgroundColor: colors.background, opacity: pressed ? 0.8 : 1 },
                                ]}
                            >
                                <ChevronRight size={16} color={colors.primary} strokeWidth={2} />
                            </Pressable>
                        </View>

                        <View style={styles.calendarGrid}>
                            <View style={styles.weekHeader}>
                                {calendarHeader.map((day) => (
                                    <Text key={day} style={[styles.weekLabel, { color: colors.textSecondary }]}>
                                        {day}
                                    </Text>
                                ))}
                            </View>

                            <View style={styles.calendarBody}>
                                {CALENDAR_WEEKS.map((week, weekIndex) => (
                                    <View key={`week-${weekIndex}`} style={styles.calendarWeek}>
                                        {week.map((cell, cellIndex) => (
                                            <CalendarDay
                                                key={cell ? `${weekIndex}-${cellIndex}-${cell.day}` : `empty-${weekIndex}-${cellIndex}`}
                                                cell={cell}
                                                colors={colors}
                                            />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Attendance</Text>
                    <View style={[styles.sectionChip, { backgroundColor: colors.primaryMuted ?? colors.backgroundSelected }]}>
                        <Text style={[styles.sectionChipText, { color: colors.primary }]}>3 Records</Text>
                    </View>
                </View>

                <View style={styles.historyList}>
                    {ATTENDANCE_HISTORY.map((entry) => (
                        <AttendanceCard key={entry.id} entry={entry} colors={colors} />
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 32,
        gap: 18,
    },
    hero: {
        gap: 16,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    titleWrap: {
        flex: 1,
        gap: 2,
    },
    eyebrow: {
        fontSize: 13,
        lineHeight: 18,
        fontFamily: Outfit.medium,
        letterSpacing: 0.2,
    },
    title: {
        fontSize: 24,
        lineHeight: 30,
        fontFamily: Outfit.bold,
        letterSpacing: -0.4,
    },
    spacer: {
        width: 42,
    },
    monthCard: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 14,
        gap: 14,
    },
    monthHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    monthArrow: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    monthLabelWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    monthLabel: {
        fontSize: 16,
        lineHeight: 22,
        fontFamily: Outfit.bold,
    },
    calendarGrid: {
        gap: 12,
    },
    weekHeader: {
        flexDirection: 'row',
    },
    weekLabel: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        lineHeight: 16,
        fontFamily: Outfit.medium,
    },
    calendarBody: {
        gap: 8,
    },
    calendarWeek: {
        flexDirection: 'row',
        gap: 4,
    },
    calendarDay: {
        flex: 1,
        minHeight: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    calendarDayText: {
        fontSize: 15,
        lineHeight: 18,
        fontFamily: Outfit.semiBold,
    },
    calendarDot: {
        width: 5,
        height: 5,
        borderRadius: 99,
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
    sectionChip: {
        minHeight: 30,
        paddingHorizontal: 12,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionChipText: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: Outfit.semiBold,
    },
    historyList: {
        gap: 12,
    },
    attendanceCard: {
        flexDirection: 'row',
        gap: 12,
        borderRadius: 24,
        borderWidth: 1,
        padding: 12,
    },
    dateBlock: {
        width: 64,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        gap: 2,
    },
    dateValue: {
        fontSize: 28,
        lineHeight: 32,
        fontFamily: Outfit.bold,
        letterSpacing: -0.6,
    },
    dateWeekday: {
        fontSize: 12,
        lineHeight: 16,
        fontFamily: Outfit.medium,
    },
    cardBody: {
        flex: 1,
        justifyContent: 'center',
        gap: 10,
    },
    metricRow: {
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    metric: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        paddingHorizontal: 4,
    },
    metricValue: {
        fontSize: 16,
        lineHeight: 20,
        fontFamily: Outfit.bold,
    },
    metricLabel: {
        fontSize: 10,
        lineHeight: 14,
        fontFamily: Outfit.regular,
    },
    metricDivider: {
        width: 1,
        borderRadius: 999,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 6,
        flexWrap: 'wrap',
    },
    locationText: {
        flex: 1,
        fontSize: 12,
        lineHeight: 16,
        fontFamily: Outfit.medium,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    statusText: {
        fontSize: 11,
        lineHeight: 14,
        fontFamily: Outfit.semiBold,
    },
});
