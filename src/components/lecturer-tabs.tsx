import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import {
  BarChart3,
  GraduationCap,
  House,
  ScanBarcode,
  User,
} from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';

const VISIBLE_TABS = ['index', 'classes', 'check-in', 'reports', 'profile'];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const scheme = useColorScheme();
  const colorMode = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorMode];
  const isDark = colorMode === 'dark';

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: colors.backgroundElement,
          borderColor: colors.border,
          shadowColor: isDark ? '#000000' : colors.primary,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        if (!VISIBLE_TABS.includes(route.name)) return null;

        const options = descriptors[route.key].options as any;
        const isFocused = state.index === index;
        const isCenterTab = route.name === 'check-in';
        const label = options.title !== undefined ? options.title : route.name;

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

        const iconColor = isCenterTab
          ? colors.primaryForeground
          : isFocused
            ? colors.primaryForeground
            : colors.textSecondary;

        const icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color: iconColor,
              size: isCenterTab ? 24 : 20,
            })
          : null;

        if (isCenterTab) {
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.centerSlot,
                pressed && styles.pressed,
              ]}
            >
              <View
                style={[
                  styles.centerButton,
                  {
                    backgroundColor: colors.secondary,
                    borderColor: colors.background,
                    shadowColor: colors.secondary,
                  },
                  isFocused && {
                    borderColor: colors.primaryMuted,
                    shadowOpacity: isDark ? 0.58 : 0.24,
                    transform: [{ translateY: -2 }, { scale: 1.03 }],
                  },
                ]}
              >
                {icon}
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={({ pressed }) => [
              styles.tabItemBase,
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.regularTab}>
              <View
                style={[
                  styles.iconShell,
                  isFocused && {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
              >
                {icon}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? colors.primary : colors.textSecondary,
                    fontFamily: isFocused
                      ? 'Outfit_700Bold'
                      : 'Outfit_600SemiBold',
                  },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colorMode = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorMode];

  return (
    <Tabs
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background,
          paddingBottom: 108,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <House size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="classes"
        options={{
          title: 'Classes',
          tabBarIcon: ({ color, size }) => (
            <GraduationCap size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="check-in"
        options={{
          title: 'Check In',
          tabBarIcon: ({ color, size }) => (
            <ScanBarcode size={size} color={color} strokeWidth={1.8} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <BarChart3 size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <User size={size} color={color} strokeWidth={1.6} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    minHeight: 84,
    borderRadius: 32,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingTop: 10,
    paddingBottom: 12,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 30,
    elevation: 22,
  },
  tabItemBase: {
    flex: 1,
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  regularTab: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconShell: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSlot: {
    flex: 1.1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 66,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 10,
  },
  tabLabel: {
    fontSize: 11,
    letterSpacing: 0.15,
  },
  pressed: {
    opacity: 0.84,
  },
});
