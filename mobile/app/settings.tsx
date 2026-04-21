import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/stores/authStore';
import { useLangStore } from '../src/stores/langStore';
import { useThemeStore, type ThemeMode } from '../src/stores/themeStore';
import { useTheme } from '../src/hooks/useTheme';
import { spacing, radius } from '../src/theme/spacing';
import { typography } from '../src/theme/typography';
import Constants from 'expo-constants';

const roleLabels: Record<string, string> = {
  SuperAdmin: 'Суперадмін',
  CompanyAdmin: 'Адмін компанії',
  Manager: 'Менеджер',
  WarehouseOperator: 'Оператор складу',
  FieldWorker: 'Працівник поля',
};

const themeModeLabels: Record<ThemeMode, string> = {
  light: 'Світла',
  dark: 'Темна',
  system: 'Системна',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { colors, isDark, mode, setMode } = useTheme();
  const { email, firstName, lastName, role, logout } = useAuthStore();
  const { lang, setLang } = useLangStore();
  const setThemeMode = useThemeStore((s) => s.setMode);

  const handleLogout = () => {
    Alert.alert('Вихід', 'Ви впевнені?', [
      { text: 'Скасувати', style: 'cancel' },
      {
        text: 'Вийти',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const cycleTheme = () => {
    const modes: ThemeMode[] = ['system', 'light', 'dark'];
    const next = modes[(modes.indexOf(mode) + 1) % modes.length];
    setThemeMode(next);
  };

  const appVersion = Constants.expoConfig?.version ?? '0.1.0';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.backgroundSecondary }]} contentContainerStyle={styles.content}>
      {/* Profile */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Профіль</Text>
        <Text style={[typography.h3, { color: colors.text }]}>
          {firstName ?? ''} {lastName ?? ''}
        </Text>
        {email ? <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>{email}</Text> : null}
        {role ? (
          <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[typography.caption, { color: colors.primary }]}>{roleLabels[role] ?? role}</Text>
          </View>
        ) : null}
      </View>

      {/* Language */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Мова</Text>
        <View style={styles.row}>
          <Pressable
            style={[styles.langBtn, lang === 'uk' && { backgroundColor: colors.primary }]}
            onPress={() => setLang('uk')}
          >
            <Text style={[typography.body, { color: lang === 'uk' ? colors.textInverse : colors.text }]}>Українська</Text>
          </Pressable>
          <Pressable
            style={[styles.langBtn, lang === 'en' && { backgroundColor: colors.primary }]}
            onPress={() => setLang('en')}
          >
            <Text style={[typography.body, { color: lang === 'en' ? colors.textInverse : colors.text }]}>English</Text>
          </Pressable>
        </View>
      </View>

      {/* Theme */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Тема</Text>
        <Pressable style={styles.row} onPress={cycleTheme}>
          <Text style={[typography.body, { color: colors.text }]}>{themeModeLabels[mode]}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Натисніть для зміни</Text>
        </Pressable>
      </View>

      {/* App info */}
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>Додаток</Text>
        <Text style={[typography.bodySmall, { color: colors.text }]}>Версія: {appVersion}</Text>
      </View>

      {/* Logout */}
      <Pressable style={[styles.logoutBtn, { borderColor: colors.error }]} onPress={handleLogout}>
        <Text style={[typography.body, { color: colors.error, fontWeight: '600' }]}>Вийти з акаунту</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md, paddingBottom: spacing.xxl, gap: spacing.md },
  section: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, gap: spacing.xs },
  sectionTitle: { ...typography.caption, textTransform: 'uppercase', marginBottom: spacing.xs },
  badge: { alignSelf: 'flex-start', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm, marginTop: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  langBtn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: radius.md },
  logoutBtn: { borderWidth: 1, borderRadius: radius.lg, alignItems: 'center', paddingVertical: spacing.md },
});
