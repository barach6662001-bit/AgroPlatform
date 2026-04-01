import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getCostRecords } from '../../src/api/economics';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { CostRecordDto } from '../../src/types/economics';

const categoryLabels: Record<string, string> = {
  Fuel: 'Паливо',
  Seeds: 'Насіння',
  Fertilizer: 'Добрива',
  Pesticides: 'Пестициди',
  Salary: 'Зарплата',
  Maintenance: 'Обслуговування',
  Other: 'Інше',
  Sale: 'Продаж',
};

export default function EconomicsScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['costRecords'],
    queryFn: () => getCostRecords({ pageSize: 100 }),
    staleTime: 30_000,
  });

  const records = data?.items ?? [];

  const total = records.reduce((s, r) => s + r.amount, 0);

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>Загалом</Text>
        <Text style={[styles.summaryValue, total >= 0 ? styles.expense : styles.income]}>
          {total >= 0 ? '-' : '+'}{Math.abs(total).toLocaleString('uk-UA')} грн
        </Text>
      </View>

      <FlatList<CostRecordDto>
        data={records}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.category}>{categoryLabels[item.category] ?? item.category}</Text>
              <Text style={[styles.amount, item.amount < 0 ? styles.income : styles.expense]}>
                {item.amount < 0 ? '+' : '-'}{Math.abs(item.amount).toLocaleString('uk-UA')} {item.currency ?? 'UAH'}
              </Text>
            </View>
            {item.description ? <Text style={styles.desc} numberOfLines={1}>{item.description}</Text> : null}
            <Text style={styles.date}>{new Date(item.date).toLocaleDateString('uk-UA')}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Записів немає</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  summary: { padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border, alignItems: 'center' },
  summaryLabel: { ...typography.caption, color: colors.textSecondary },
  summaryValue: { ...typography.h2, marginTop: spacing.xs },
  expense: { color: colors.error },
  income: { color: colors.success },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  category: { ...typography.body, color: colors.text, fontWeight: '600' },
  amount: { ...typography.number, fontSize: 16 },
  desc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  date: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
});
