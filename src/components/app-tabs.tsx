import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs, router } from 'expo-router';
import {
  LayoutDashboard,
  GraduationCap,
  ClipboardList,
  ScanLine,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react-native';
import { TouchableOpacity, View, StyleSheet, Text } from 'react-native';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

const VISIBLE_TABS = ['index', 'classes', 'attendance', 'check-in', 'reports'];

function HeaderRight({ colors }: { colors: typeof Colors[keyof typeof Colors] }) {
  return (
    <View style={styles.headerRight}>
      <TouchableOpacity
        onPress={() => router.push('/(app)/notifications')}
        style={styles.headerIcon}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Bell size={24} color={colors.text} strokeWidth={1.5} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push('/(app)/settings')}
        style={styles.headerIcon}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Settings size={24} color={colors.text} strokeWidth={1.5} />
      </TouchableOpacity>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'dark' : (scheme ?? 'dark')];
  const isDark = scheme === 'dark' || scheme === 'unspecified';

  const tabBarStyle = {
    backgroundColor: isDark ? '#1A1A1A' : colors.background,
    borderColor: isDark ? '#2E2E2E' : 'transparent',
    borderWidth: isDark ? StyleSheet.hairlineWidth : 0,
    shadowColor: '#000',
    shadowOpacity: isDark ? 0.6 : 0.12,
    shadowRadius: 24,
  };

  return (
    <View style={[styles.tabBarContainer, tabBarStyle]}>
      {state.routes.map((route, index) => {
        // Filter out non-main tabs (like notifications or settings)
        if (!VISIBLE_TABS.includes(route.name)) return null;

        const options = descriptors[route.key].options as any;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const label = options.title !== undefined ? options.title : route.name;
        const iconColor = isFocused ? '#F5C518' : colors.textSecondary;
        const icon = options.tabBarIcon ? options.tabBarIcon({ focused: isFocused, color: iconColor, size: 20 }) : null;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={[
              isFocused ? styles.tabItemActive : styles.tabItemInactive,
              isFocused && { backgroundColor: colors.backgroundSelected }
            ]}
          >
            {icon}
            {isFocused && (
              <Text style={[styles.tabLabel, { color: '#F5C518' }]} numberOfLines={1}>
                {label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'dark' : (scheme ?? 'dark')];

  const headerStyle = {
    backgroundColor: colors.background,
    borderBottomColor: colors.backgroundElement,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0,
    elevation: 0,
  };

  const screenOptions = {
    headerStyle,
    headerTintColor: colors.text,
    headerTitle: () => null,
    headerRight: () => <HeaderRight colors={colors} />,
    headerRightContainerStyle: { paddingRight: 16 },
    sceneStyle: { paddingBottom: 108 },
  };

  return (
    <Tabs
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={screenOptions}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => (
            <GraduationCap size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <ClipboardList size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="check-in"
        options={{
          title: 'Check-In',
          tabBarIcon: ({ color, size }) => (
            <ScanLine size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} strokeWidth={1.5} />
          ),
        }}
      />

      <Tabs.Screen name="notifications" options={{ href: null, title: 'Notifications' }} />
      <Tabs.Screen name="settings" options={{ href: null, title: 'Settings' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerIcon: {
    padding: 6,
    borderRadius: 8,
  },
  tabBarContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    borderRadius: 36,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    shadowOffset: { width: 0, height: 8 },
    elevation: 16,
  },
  tabItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
  },
  tabItemInactive: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  tabLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: 0.1,
  },
});