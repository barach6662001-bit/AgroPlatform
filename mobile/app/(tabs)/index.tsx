import { ScrollView, StyleSheet, Text, View, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../../src/api/analytics';
import { KpiCard } from '../../src/components/KpiCard';
import { OfflineBanner } from '../../src/components/OfflineBanner';
import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';
import { getPendingCount } from '../../src/utils/offlineQueue';
import { useAuthStore } from '../../src/stores/authStore';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

export default function DashboardScreen() {
  const online = useOnlineStatus();
  const pending = getPendingCount();
  const { firstName, lastName, email } = useAuthStore();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => getDashboard(),
    staleTime: 30_000,
    enabled: online,
  });

  const formatUAH = (value?: number) =>
    value !== undefined ? `${value.toLocaleString('uk-UA')} ₴` : '—';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {!online && pending >= 0 && <OfflineBanner pending={pending} />}

      <View style={styles.header}>
        <Text style={styles.greeting}>
          Привіт, {firstName ?? email ?? 'Агроном'} 👋
        </Text>
        <Text style={styles.subtitle}>Огляд підприємства</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.kpiRow}>
            <KpiCard
              icon="trending-up"
              label="Дохід"
              value={formatUAH(data?.totalRevenue)}
              positive
            />
            <KpiCard
              icon="trending-down"
              label="Витрати"
              value={formatUAH(data?.totalCosts)}
              positive={false}
            />
            <KpiCard
              icon="calculator"
              label="Прибуток"
              value={formatUAH(
                data?.totalRevenue !== undefined && data?.totalCosts !== undefined
                  ? data.totalRevenue - data.totalCosts
                  : undefined
              )}
              positive={(data?.totalRevenue ?? 0) > (data?.totalCosts ?? 0)}
            />
            <KpiCard
              icon="silo"
              label="Полів"
              value={data?.totalFields !== undefined ? String(data.totalFields) : '—'}
            />
            <KpiCard
              icon="tractor"
              label="Операцій"
              value={data?.totalOperations !== undefined ? String(data.totalOperations) : '—'}
            />
          </ScrollView>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Активні операції</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{data?.pendingOperations ?? '—'}</Text>
                <Text style={styles.statLabel}>Заплановано</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{data?.completedOperations ?? '—'}</Text>
                <Text style={styles.statLabel}>Завершено</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{data?.totalOperations ?? '—'}</Text>
                <Text style={styles.statLabel}>Всього</Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  content: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  kpiRow: {
    marginBottom: spacing.lg,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.number,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
