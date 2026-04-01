import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getFuelTanks, getFuelTransactions } from '../../src/api/fuel';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { FuelTankDto, FuelTransactionDto } from '../../src/types/fuel';

const fuelTypeLabels: Record<number, string> = { 0: 'Дизель', 1: 'Бензин', 2: 'Електро', 3: 'Газ' };

export default function FuelScreen() {
  const { data: tanks, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['fuel-tanks'],
    queryFn: () => getFuelTanks(),
    staleTime: 30_000,
  });

  const { data: transactions } = useQuery({
    queryKey: ['fuel-transactions-recent'],
    queryFn: () => getFuelTransactions({ pageSize: 10 }),
    staleTime: 30_000,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tanks ?? []}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.sectionTitle}>Паливні ємності</Text>}
        renderItem={({ item }: { item: FuelTankDto }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardQty}>{Math.round(item.fillPercentage)}%</Text>
            </View>
            <Text style={styles.cardSub}>
              {item.currentLiters} / {item.capacityLiters} л — {fuelTypeLabels[item.fuelType] ?? 'Інше'}
            </Text>
            <View style={styles.bar}>
              <View style={[styles.barFill, { width: `${Math.min(item.fillPercentage, 100)}%` }]} />
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Ємностей не знайдено</Text>}
        ListFooterComponent={
          transactions && transactions.length > 0 ? (
            <View style={styles.txSection}>
              <Text style={styles.sectionTitle}>Останні операції</Text>
              {transactions.slice(0, 5).map((tx: FuelTransactionDto) => (
                <View key={tx.id} style={styles.txRow}>
                  <Text style={styles.txDate}>{new Date(tx.transactionDate).toLocaleDateString('uk-UA')}</Text>
                  <Text style={[styles.txType, tx.transactionType === 'Supply' ? styles.txSupply : styles.txIssue]}>
                    {tx.transactionType === 'Supply' ? '+' : '−'}{tx.quantityLiters} л
                  </Text>
                  <Text style={styles.txTank}>{tx.tankName}</Text>
                </View>
              ))}
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { ...typography.h3, color: colors.text },
  cardQty: { ...typography.h3, color: colors.primary },
  cardSub: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  bar: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginTop: spacing.sm },
  barFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
  txSection: { marginTop: spacing.lg },
  txRow: { flexDirection: 'row', gap: spacing.sm, paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  txDate: { ...typography.caption, color: colors.textSecondary, width: 80 },
  txType: { ...typography.label, width: 80 },
  txSupply: { color: colors.success },
  txIssue: { color: colors.error },
  txTank: { ...typography.caption, color: colors.text, flex: 1 },
});
