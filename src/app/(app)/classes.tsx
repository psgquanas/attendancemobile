import { Calendar1, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
} from 'react-native';

const colors = {
    primaryFixedDim: '#c0c1ff',
    outlineVariant: '#464554',
    surface: '#121316',
    surfaceBright: '#38393c',
    tertiary: '#ffb3ad',
    inverseOnSurface: '#2f3033',
    surfaceContainerHighest: '#343538',
    surfaceContainerLowest: '#0d0e11',
    secondaryFixed: '#ffddb8',
    surfaceVariant: '#343538',
    surfaceDim: '#121316',
    surfaceContainer: '#1e2022',
    outline: '#908fa0',
    background: '#121316',
    errorContainer: '#93000a',
    onTertiary: '#68000a',
    onBackground: '#e3e2e6',
    onSecondaryContainer: '#5b3800',
    onPrimary: '#1000a9',
    secondaryContainer: '#ee9800',
    tertiaryContainer: '#ff5451',
    surfaceTint: '#c0c1ff',
    onSurfaceVariant: '#c7c4d7',
    primary: '#c0c1ff',
    inverseSurface: '#e3e2e6',
    onPrimaryFixed: '#07006c',
    secondary: '#ffb95f',
    onSurface: '#e3e2e6',
    surfaceContainerLow: '#1a1b1e',
    primaryFixed: '#e1e0ff',
    onTertiaryContainer: '#5c0008',
    onSecondary: '#472a00',
    inversePrimary: '#494bd6',
    secondaryFixedDim: '#ffb95f',
    error: '#ffb4ab',
    surfaceContainerHigh: '#292a2d',
    primaryContainer: '#8083ff',
    onPrimaryContainer: '#0d0096',
    onError: '#690005',
    onErrorContainer: '#ffdad6',
};

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

// ─── Data ─────────────────────────────────────────────────────────────────────
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
    },
    {
        id: '2',
        name: 'Design Tokens Workshop',
        host: 'Mark Evans',
        isLive: false,
        attendance: 76,
    },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const ProgressBar = ({
    value,
    color,
    glowColor,
}: {
    value: number;
    color: string;
    glowColor: string;
}) => (
    <View style={styles.progressTrack}>
        <View
            style={[
                styles.progressFill,
                {
                    width: `${value}%` as any,
                    backgroundColor: color,
                    shadowColor: glowColor,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.7,
                    shadowRadius: 6,
                    elevation: 4,
                },
            ]}
        />
    </View>
);

const MyClassCard = ({ item }: { item: MyClass }) => (
    <View style={[styles.card, styles.cardShadow]}>
        {/* Accent left bar */}
        <View
            style={[
                styles.accentBar,
                {
                    backgroundColor: colors.primaryContainer,
                    shadowColor: colors.primaryContainer,
                },
            ]}
        />

        {/* Header row */}
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <View style={styles.codeChip}>
                    <Text style={styles.codeText}>Code: {item.code}</Text>
                </View>
            </View>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.icon, { color: colors.onSurfaceVariant }]}>⋮</Text>
            </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Text style={styles.statIcon}><Calendar1 size={18} color={colors.onSurfaceVariant} /></Text>
                <Text style={styles.statLabel}>{item.sessions} Sessions</Text>
            </View>
            <View style={styles.statItem}>
                <Text style={styles.statIcon}><Users size={18} color={colors.onSurfaceVariant} /></Text>
                <Text style={styles.statLabel}>{item.members} Members</Text>
            </View>
        </View>

        {/* Attendance bar */}
        <View style={styles.divider} />
        <View style={styles.attendanceRow}>
            <Text style={styles.attendanceLabel}>Avg. Attendance</Text>
            <Text style={[styles.attendanceValue, { color: colors.primaryFixedDim }]}>
                {item.avgAttendance}%
            </Text>
        </View>
        <ProgressBar
            value={item.avgAttendance}
            color={colors.primaryContainer}
            glowColor={colors.primaryContainer}
        />
    </View>
);

const JoinedClassCard = ({ item }: { item: JoinedClass }) => (
    <View style={[styles.card, styles.cardShadow]}>
        {/* Accent left bar */}
        <View
            style={[
                styles.accentBar,
                { backgroundColor: colors.secondaryContainer },
            ]}
        />

        {/* Header row */}
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { flex: 1 }]}>{item.name}</Text>
                    {item.isLive && (
                        <View style={styles.liveBadge}>
                            <Text style={styles.liveText}>LIVE</Text>
                        </View>
                    )}
                </View>
                <View style={styles.hostRow}>
                    <Text style={styles.hostIcon}>👤</Text>
                    <Text style={styles.hostLabel}>Host: {item.host}</Text>
                </View>
            </View>
        </View>

        {/* Attendance bar */}
        <View style={styles.divider} />
        <View style={styles.attendanceRow}>
            <Text style={styles.attendanceLabel}>Your Attendance</Text>
            <Text style={[styles.attendanceValue, { color: colors.secondaryFixedDim }]}>
                {item.attendance}%
            </Text>
        </View>
        <ProgressBar
            value={item.attendance}
            color={colors.secondaryContainer}
            glowColor={colors.secondaryContainer}
        />
    </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MyClassesScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'my' | 'joined'>('my');

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={colors.background} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Segmented Control */}
                <View style={styles.segmentedControl}>
                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            activeTab === 'my' && styles.segmentButtonActive,
                        ]}
                        onPress={() => setActiveTab('my')}
                        activeOpacity={0.85}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                activeTab === 'my'
                                    ? styles.segmentTextActive
                                    : styles.segmentTextInactive,
                            ]}
                        >
                            My Classes
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            activeTab === 'joined' && styles.segmentButtonActive,
                        ]}
                        onPress={() => setActiveTab('joined')}
                        activeOpacity={0.85}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                activeTab === 'joined'
                                    ? styles.segmentTextActive
                                    : styles.segmentTextInactive,
                            ]}
                        >
                            Joined Classes
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Cards */}
                <View style={styles.cardList}>
                    {activeTab === 'my'
                        ? myClasses.map((item) => <MyClassCard key={item.id} item={item} />)
                        : joinedClasses.map((item) => (
                            <JoinedClassCard key={item.id} item={item} />
                        ))}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
                <Text style={styles.fabIcon}>＋</Text>
                <Text style={styles.fabLabel}>New Class</Text>
            </TouchableOpacity>
        </View>
    );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 110, // Avoid overlapping floating bottom tab bar
        gap: 16,
    },

    // Segmented control
    segmentedControl: {
        flexDirection: 'row',
        backgroundColor: colors.surfaceContainerLowest,
        borderRadius: 999,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(70,69,84,0.1)',
        marginBottom: 8,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 9,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentButtonActive: {
        backgroundColor: colors.surfaceContainerHighest,
        borderWidth: 1,
        borderColor: 'rgba(70,69,84,0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        letterSpacing: 0.1,
    },
    segmentTextActive: {
        color: colors.primaryFixedDim,
    },
    segmentTextInactive: {
        color: colors.onSurfaceVariant,
    },

    // Card list
    cardList: {
        gap: 16,
    },

    // Card base
    card: {
        backgroundColor: colors.surfaceContainer,
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(70,69,84,0.2)',
        overflow: 'hidden',
        gap: 12,
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
    },

    // Accent left bar
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 4,
    },

    // Card header
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingLeft: 8,
    },
    cardTitle: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.onSurface,
        letterSpacing: 0.1,
        marginBottom: 8,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap',
    },

    // Code chip
    codeChip: {
        alignSelf: 'flex-start',
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: 'rgba(70,69,84,0.3)',
    },
    codeText: {
        fontSize: 11,
        fontFamily: 'Outfit_500Medium',
        color: colors.onSurfaceVariant,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    icon: {
        fontSize: 22,
        lineHeight: 24,
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        gap: 24,
        paddingLeft: 8,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statIcon: {
        fontSize: 13,
    },
    statLabel: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
        fontFamily: 'Outfit_500Medium',
        letterSpacing: 0.05,
    },

    // Host row
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    hostIcon: {
        fontSize: 11,
    },
    hostLabel: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
        fontFamily: 'Outfit_500Medium',
    },

    // Live badge
    liveBadge: {
        backgroundColor: 'rgba(147,0,10,0.2)',
        borderWidth: 1,
        borderColor: colors.errorContainer,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    liveText: {
        fontSize: 10,
        fontFamily: 'Outfit_700Bold',
        color: colors.error,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    // Divider
    divider: {
        height: 1,
        backgroundColor: 'rgba(70,69,84,0.2)',
        marginVertical: 4,
    },

    // Attendance
    attendanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    attendanceLabel: {
        fontSize: 12,
        color: colors.onSurfaceVariant,
        fontFamily: 'Outfit_500Medium',
        letterSpacing: 0.05,
    },
    attendanceValue: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        letterSpacing: 0.1,
    },
    progressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: colors.surfaceContainerHighest,
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 999,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: 100, // sit right above the custom floating tab bar
        right: 24,
        backgroundColor: colors.primaryContainer,
        borderRadius: 999,
        paddingHorizontal: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        shadowColor: colors.primaryContainer,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        borderColor: 'rgba(192,193,255,0.3)',
        zIndex: 40,
    },
    fabIcon: {
        fontSize: 20,
        color: colors.onPrimaryContainer,
        fontFamily: 'Outfit_500Medium',
        lineHeight: 22,
    },
    fabLabel: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.onPrimaryContainer,
        letterSpacing: 0.1,
    },
});

export default MyClassesScreen;