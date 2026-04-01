import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

interface MenuItem {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  route: string;
}

const MENU_ITEMS: MenuItem[] = [
  { icon: 'map-marker-multiple', label: 'Поля', route: '/fields/' },
  { icon: 'tractor-variant', label: 'Техніка', route: '/machinery/' },
  { icon: 'gas-station', label: 'Паливо', route: '/fuel/' },
  { icon: 'account-group', label: 'Персонал', route: '/hr/' },
  { icon: 'chart-bar', label: 'Економіка', route: '/economics/' },
  { icon: 'bell', label: 'Сповіщення', route: '/notifications' },
  { icon: 'cog', label: 'Налаштування', route: '/settings' },
];

export default function MoreTab() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { email, firstName, lastName } = useAuthStore();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.profile}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(firstName?.[0] ?? email?.[0] ?? 'A').toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.name}>
            {firstName && lastName ? `${firstName} ${lastName}` : email ?? 'User'}
          </Text>
          {(firstName || lastName) && email ? (
            <Text style={styles.emailText}>{email}</Text>
          ) : null}
        </View>
      </View>

      {MENU_ITEMS.map((item) => (
        <TouchableOpacity
          key={item.route}
          style={styles.menuItem}
          onPress={() => router.push(item.route as any)}
        >
          <MaterialCommunityIcons name={item.icon} size={22} color={colors.primary} />
          <Text style={styles.menuLabel}>{item.label}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <MaterialCommunityIcons name="logout" size={18} color={colors.error} />
        <Text style={styles.logoutText}>Вийти</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.textInverse, fontSize: 20, fontWeight: '700' },
  name: { ...typography.h3, color: colors.text },
  emailText: { ...typography.bodySmall, color: colors.textSecondary },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  menuLabel: { ...typography.body, color: colors.text, flex: 1 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
    justifyContent: 'center',
  },
  logoutText: { ...typography.label, color: colors.error },
});
