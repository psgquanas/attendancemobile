import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import {
  BarChart3,
  GraduationCap,
  House,
  ScanBarcode,
  Settings,
} from 'lucide-react-native';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';

const VISIBLE_TABS = ['index', 'classes', 'check-in', 'reports', 'settings'];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme: colorMode } = useAppTheme();
  const colors = Colors[colorMode];
  const isDark = colorMode === 'dark';

  return (
    <View
      style={[
        styles.tabBarContainer,
        {
          backgroundColor: isDark ? '#1C1C1C' : '#FFFFFF',
          borderTopColor: isDark ? '#2A2A2A' : '#F0F0F0',
          shadowColor: '#000000',
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

        const activeColor = colors.primary;
        const inactiveColor = isDark ? '#666666' : '#AAAAAA';

        const iconColor = isCenterTab
          ? colors.primaryForeground
          : isFocused
            ? activeColor
            : inactiveColor;

        const icon = options.tabBarIcon
          ? options.tabBarIcon({
            focused: isFocused,
            color: iconColor,
            size: isCenterTab ? 22 : 22,
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
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                  isFocused && {
                    shadowOpacity: 0.45,
                    transform: [{ scale: 1.04 }],
                  },
                  !isFocused && {
                    shadowOpacity: 0.2,
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
            <View style={styles.tabContent}>
              {icon}
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isFocused ? activeColor : inactiveColor,
                    fontFamily: isFocused
                      ? 'Outfit_600SemiBold'
                      : 'Outfit_400Regular',
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
  const { theme: colorMode } = useAppTheme();
  const isDark = colorMode === 'dark';

  return (
    <Tabs
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: isDark ? Colors.dark.background : Colors.light.background,
          paddingBottom: 80,
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
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Settings size={size} color={color} strokeWidth={1.6} />
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
    left: 0,
    right: 0,
    bottom: 0,
    height: 80,
    borderTopWidth: 1,
    paddingHorizontal: 4,
    paddingBottom: 16,
    paddingTop: 8,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 16,
  },
  tabItemBase: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: 0.1,
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    // Lift the button above the bar
    marginTop: -28,
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 12,
  },
  pressed: {
    opacity: 0.75,
  },
});