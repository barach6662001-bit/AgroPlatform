import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../../src/theme/colors';
import { useTranslation } from '../../src/i18n';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: { height: 60, paddingBottom: 8 },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.textInverse,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.dashboard,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="view-dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="warehouse"
        options={{
          title: t.tabs.warehouse,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="warehouse" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="grain"
        options={{
          title: t.tabs.grain,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="grain" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="operations"
        options={{
          title: t.tabs.operations,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="tractor" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: t.tabs.more,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dots-horizontal" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
