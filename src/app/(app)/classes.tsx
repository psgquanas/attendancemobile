import { Calendar1, Users, Plus, UserPlus } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    useColorScheme,
} from 'react-native';
import { Colors } from '@/constants/theme';

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

const ProgressBar = ({
    value,
    color,
    trackColor,
}: {
    value: number;
    color: string;
    trackColor: string;
}) => (
    <View style={[styles.progressTrack, { backgroundColor: trackColor }]}>
        <View
            style={[
                styles.progressFill,
                {
                    width: `${value}%` as any,
                    backgroundColor: color,
                    shadowColor: color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.6,
                    shadowRadius: 6,
                    elevation: 4,
                },
            ]}
        />
    </View>
);

const MyClassCard = ({
    item,
    colors,
}: {
    item: MyClass;
    colors: typeof Colors[keyof typeof Colors];
}) => (
    <View style={[styles.card, styles.cardShadow, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
        {/* Accent left bar */}
        <View
            style={[
                styles.accentBar,
                { backgroundColor: colors.primary, shadowColor: colors.primary },
            ]}
        />

        {/* Header row */}
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                <View style={[styles.codeChip, { backgroundColor: colors.primaryMuted }]}>
                    <Text style={[styles.codeText, { color: colors.primary }]}>Code: {item.code}</Text>
                </View>
            </View>
            <TouchableOpacity hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[styles.icon, { color: colors.textSecondary }]}>⋮</Text>
            </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
            <View style={styles.statItem}>
                <Calendar1 size={16} color={colors.textSecondary} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.sessions} Sessions</Text>
            </View>
            <View style={styles.statItem}>
                <Users size={16} color={colors.textSecondary} />
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{item.members} Members</Text>
            </View>
        </View>

        {/* Attendance bar */}
        <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />
        <View style={styles.attendanceRow}>
            <Text style={[styles.attendanceLabel, { color: colors.textSecondary }]}>Avg. Attendance</Text>
            <Text style={[styles.attendanceValue, { color: colors.primary }]}>
                {item.avgAttendance}%
            </Text>
        </View>
        <ProgressBar
            value={item.avgAttendance}
            color={colors.primary}
            trackColor={colors.backgroundSelected}
        />
    </View>
);

const JoinedClassCard = ({
    item,
    colors,
}: {
    item: JoinedClass;
    colors: typeof Colors[keyof typeof Colors];
}) => (
    <View style={[styles.card, styles.cardShadow, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
        {/* Accent left bar */}
        <View
            style={[
                styles.accentBar,
                { backgroundColor: colors.secondary, shadowColor: colors.secondary },
            ]}
        />

        {/* Header row */}
        <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text, flex: 1 }]}>{item.name}</Text>
                    {item.isLive && (
                        <View style={[styles.liveBadge, { backgroundColor: (colors as any).destructive + '20', borderColor: (colors as any).destructive }]}>
                            <Text style={[styles.liveText, { color: (colors as any).destructive }]}>LIVE</Text>
                        </View>
                    )}
                </View>
                <View style={styles.hostRow}>
                    <Text style={styles.hostIcon}>👤</Text>
                    <Text style={[styles.hostLabel, { color: colors.textSecondary }]}>Host: {item.host}</Text>
                </View>
            </View>
        </View>

        {/* Attendance bar */}
        <View style={[styles.divider, { backgroundColor: colors.backgroundSelected }]} />
        <View style={styles.attendanceRow}>
            <Text style={[styles.attendanceLabel, { color: colors.textSecondary }]}>Your Attendance</Text>
            <Text style={[styles.attendanceValue, { color: colors.secondary }]}>
                {item.attendance}%
            </Text>
        </View>
        <ProgressBar
            value={item.attendance}
            color={colors.secondary}
            trackColor={colors.backgroundSelected}
        />
    </View>
);

const MyClassesScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'my' | 'joined'>('my');
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

    const fabColor = activeTab === 'my' ? colors.primary : colors.secondary;
    const fabIconColor = activeTab === 'my' ? colors.primaryForeground : colors.secondaryForeground;

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <StatusBar
                barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={colors.background}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Segmented Control */}
                <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundSelected }]}>
                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            activeTab === 'my' && [styles.segmentButtonActive, { backgroundColor: colors.backgroundElement }],
                        ]}
                        onPress={() => setActiveTab('my')}
                        activeOpacity={0.85}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                { color: activeTab === 'my' ? colors.primary : colors.textSecondary },
                            ]}
                        >
                            My Classes
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.segmentButton,
                            activeTab === 'joined' && [styles.segmentButtonActive, { backgroundColor: colors.backgroundElement }],
                        ]}
                        onPress={() => setActiveTab('joined')}
                        activeOpacity={0.85}
                    >
                        <Text
                            style={[
                                styles.segmentText,
                                { color: activeTab === 'joined' ? colors.secondary : colors.textSecondary },
                            ]}
                        >
                            Joined Classes
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Cards */}
                <View style={styles.cardList}>
                    {activeTab === 'my'
                        ? myClasses.map((item) => <MyClassCard key={item.id} item={item} colors={colors} />)
                        : joinedClasses.map((item) => (
                            <JoinedClassCard key={item.id} item={item} colors={colors} />
                        ))}
                </View>
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={[
                    styles.fab,
                    {
                        backgroundColor: fabColor,
                        shadowColor: fabColor,
                        borderColor: fabColor + '50',
                    },
                ]}
                activeOpacity={0.85}
            >
                {activeTab === 'my'
                    ? <Plus size={22} color={fabIconColor} strokeWidth={2.5} />
                    : <UserPlus size={22} color={fabIconColor} strokeWidth={2} />}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 110,
        gap: 16,
    },

    // Segmented control
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: 999,
        padding: 4,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    segmentText: {
        fontSize: 14,
        fontFamily: 'Outfit_600SemiBold',
        letterSpacing: 0.1,
    },

    // Card list
    cardList: {
        gap: 16,
    },

    // Card base
    card: {
        borderRadius: 12,
        padding: 20,
        borderWidth: 1,
        overflow: 'hidden',
        gap: 12,
    },
    cardShadow: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },

    // Accent left bar
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4,
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
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    codeText: {
        fontSize: 11,
        fontFamily: 'Outfit_500Medium',
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
    statLabel: {
        fontSize: 12,
        fontFamily: 'Outfit_500Medium',
        letterSpacing: 0.05,
    },

    // Host row
    hostRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
        paddingLeft: 0,
    },
    hostIcon: {
        fontSize: 11,
    },
    hostLabel: {
        fontSize: 12,
        fontFamily: 'Outfit_500Medium',
    },

    // Live badge
    liveBadge: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    liveText: {
        fontSize: 10,
        fontFamily: 'Outfit_700Bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },

    // Divider
    divider: {
        height: 1,
        marginVertical: 4,
    },

    // Attendance
    attendanceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        paddingLeft: 8,
    },
    attendanceLabel: {
        fontSize: 12,
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
        bottom: 100,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 8,
        borderWidth: 1,
        zIndex: 40,
    },
});

export default MyClassesScreen;