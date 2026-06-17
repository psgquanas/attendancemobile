import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    Switch,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import {
    User,
    Lock,
    Sun,
    Moon,
    Trash2,
    LogOut,
    BarChart3,
    ChevronRight,
} from 'lucide-react-native';

import { Image } from 'expo-image';

import { Colors } from '@/constants/theme';
import { authClient } from '@/lib/auth-client';
import { useAppTheme } from '@/context/theme-context';


interface SettingRowProps {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress?: () => void;
    colors: any;
    value?: boolean;
    onValueChange?: (val: boolean) => void;
}

interface StatItemProps {
    value: string;
    label: string;
    colors: any;
}


const StatItem: React.FC<StatItemProps> = ({ value, label, colors }) => {
    return (
        <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.statValue }]}>{value}</Text>
            <Text style={[styles.statLabel, { color: colors.subtext }]}>{label}</Text>
        </View>
    );
};

const SettingRow: React.FC<SettingRowProps> = ({
    icon,
    title,
    subtitle,
    onPress,
    colors,
    value,
    onValueChange,
}) => {
    const isSwitch = onValueChange !== undefined;

    return (
        <TouchableOpacity
            style={[styles.settingRow, { backgroundColor: colors.card }]}
            onPress={isSwitch ? undefined : onPress}
            activeOpacity={isSwitch ? 1 : 0.7}
        >
            <View style={[styles.settingIcon, { backgroundColor: colors.iconBg }]}>
                {icon}
            </View>
            <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
                <Text style={[styles.settingSubtitle, { color: colors.subtext }]}>{subtitle}</Text>
            </View>
            {isSwitch ? (
                <Switch
                    value={value}
                    onValueChange={onValueChange}
                    trackColor={{ false: colors.divider, true: colors.accent }}
                    thumbColor={Platform.OS === 'ios' ? undefined : (value ? '#FFFFFF' : '#F4F3F4')}
                />
            ) : (
                <ChevronRight size={18} color={colors.chevron} strokeWidth={1.5} />
            )}
        </TouchableOpacity>
    );
};

const Divider: React.FC<{ color: string }> = ({ color }) => (
    <View style={[styles.divider, { backgroundColor: color }]} />
);


const ProfileSettingsScreen: React.FC = () => {
    const [loggingOut, setLoggingOut] = useState(false);
    const { theme: colorMode, setThemeMode } = useAppTheme();
    const isDark = colorMode === 'dark';
    const themeColors = Colors[colorMode];

    const toggleTheme = (val: boolean) => {
        setThemeMode(val ? 'dark' : 'light');
    };

    const colors = {
        bg: themeColors.background,
        card: themeColors.backgroundElement,
        surface: themeColors.backgroundElement,
        text: themeColors.text,
        subtext: themeColors.textSecondary,
        sectionLabel: themeColors.textSecondary,
        accent: themeColors.primary,
        divider: themeColors.backgroundSelected,
        chevron: themeColors.textSecondary,
        statValue: themeColors.text,
        iconColor: themeColors.primary,
        iconBg: themeColors.primaryMuted,
    };

    const { data: session } = authClient.useSession();

    const user = session?.user;

    const handleLogout = async () => {
        if (loggingOut) return;

        setLoggingOut(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        router.replace('/(auth)/sign-in');
                    },
                },
            });
        } finally {
            setLoggingOut(false);
        }
    };

    return (
        <SafeAreaView
            style={[styles.safeArea, { backgroundColor: colors.bg }]}
            edges={['top']}
        >
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor={colors.bg}
            />

            {/* Header */}
            <View style={[styles.header, { backgroundColor: colors.bg }]}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Profile Card ── */}
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={styles.profileRow}>
                        <View style={styles.avatarWrapper}>
                            {user?.image ? (
                                <Image
                                    source={user.image}
                                    style={styles.avatarImage}
                                    contentFit="cover"
                                    transition={200}
                                />
                            ) : (
                                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.iconBg }]}>
                                    <User size={26} color={colors.iconColor} strokeWidth={1.8} />
                                </View>
                            )}
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={[styles.profileName, { color: colors.text }]}>
                                {user?.name}
                            </Text>
                            <Text style={[styles.profileEmail, { color: colors.subtext }]}>
                                {user?.email}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* ── Profile Insights ── */}
                <View style={[styles.card, styles.insightsCard, { backgroundColor: colors.card }]}>
                    <View style={styles.insightsHeader}>
                        <BarChart3 size={20} color={colors.iconColor} strokeWidth={1.8} />
                        <Text style={[styles.insightsTitle, { color: colors.text }]}>
                            Attendance Insights
                        </Text>
                    </View>

                    <View style={styles.statsRow}>
                        <StatItem value="35" label="Check-Ins" colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                        <StatItem value="45.1K" label="Absent" colors={colors} />
                        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
                        <StatItem value="40.1K" label="Total Classes" colors={colors} />
                    </View>
                </View>

                {/* ── Account Setup ── */}
                <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
                    How do you set up an account?
                </Text>

                <View style={[styles.groupCard, { backgroundColor: colors.card }]}>
                    <SettingRow
                        icon={<User size={18} color={colors.iconColor} strokeWidth={2} />}
                        title="Profile"
                        subtitle="Change profile picture"
                        colors={colors}
                    />
                    <Divider color={colors.divider} />
                    <SettingRow
                        icon={<Lock size={18} color={colors.iconColor} strokeWidth={2} />}
                        title="Account Security"
                        subtitle="Change Password"
                        colors={colors}
                    />
                </View>

                {/* ── Theme ── */}
                <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
                    Adjust the theme to your preferences
                </Text>

                <View style={[styles.groupCard, { backgroundColor: colors.card }]}>
                    <SettingRow
                        icon={isDark ? <Moon size={18} color={colors.iconColor} strokeWidth={2} /> : <Sun size={18} color={colors.iconColor} strokeWidth={2} />}
                        title="Theme Mode"
                        subtitle={`Currently set to ${isDark ? 'Dark Mode' : 'Light Mode'}`}
                        colors={colors}
                        value={isDark}
                        onValueChange={toggleTheme}
                    />
                </View>

                {/* ── Additional Settings ── */}
                <Text style={[styles.sectionLabel, { color: colors.sectionLabel }]}>
                    Additional settings
                </Text>

                <View style={[styles.groupCard, { backgroundColor: colors.card }]}>
                    <SettingRow
                        icon={<Trash2 size={18} color={colors.iconColor} strokeWidth={2} />}
                        title="Delete Account"
                        subtitle="Delete your account"
                        colors={colors}
                    />
                    <Divider color={colors.divider} />
                    <SettingRow
                        icon={<LogOut size={18} color={colors.iconColor} strokeWidth={2} />}
                        title="Log Out Account"
                        subtitle={loggingOut ? 'Signing out...' : 'Log out of your account'}
                        colors={colors}
                        onPress={handleLogout}
                    />
                </View>

                <View style={styles.bottomPad} />
            </ScrollView>
        </SafeAreaView>
    );
};


const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 14,
    },
    headerAction: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        width: 56,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontFamily: 'Outfit_700Bold',
        textAlign: 'center',
        letterSpacing: -0.3,
    },
    headerSpacer: {
        width: 56,
    },

    // Scroll
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 8,
    },

    // Cards
    card: {
        borderRadius: 14,
        marginBottom: 12,
        overflow: 'hidden',
    },
    groupCard: {
        borderRadius: 14,
        marginBottom: 8,
        overflow: 'hidden',
    },

    // Profile
    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    avatarWrapper: {
        marginRight: 12,
    },
    avatarPlaceholder: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 52,
        height: 52,
        borderRadius: 26,
    },
    profileInfo: {
        flex: 1,
    },
    profileName: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        letterSpacing: -0.2,
        marginBottom: 2,
    },
    profileEmail: {
        fontSize: 13,
        fontFamily: 'Outfit_400Regular',
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        marginHorizontal: 16,
    },

    switchAccountRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
    },
    switchAccountText: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
    },
    switchBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1.5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Insights
    insightsCard: {
        paddingBottom: 0,
    },
    insightsHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        gap: 8,
    },
    insightsTitle: {
        fontSize: 15,
        fontFamily: 'Outfit_600SemiBold',
    },

    statsRow: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 16,
        gap: 0,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    statValue: {
        fontSize: 22,
        fontFamily: 'Outfit_700Bold',
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        textAlign: 'center',
    },
    statDivider: {
        width: StyleSheet.hairlineWidth,
        marginVertical: 4,
    },

    // Section labels
    sectionLabel: {
        fontSize: 13,
        fontFamily: 'Outfit_500Medium',
        marginBottom: 8,
        marginTop: 14,
        paddingHorizontal: 4,
    },

    // Setting rows
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
    },
    settingIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    settingText: {
        flex: 1,
        gap: 2,
    },
    settingTitle: {
        fontSize: 15,
        fontFamily: 'Outfit_500Medium',
        letterSpacing: -0.1,
    },
    settingSubtitle: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        lineHeight: 16,
    },

    bottomPad: {
        height: 32,
    },
});

export default ProfileSettingsScreen;
