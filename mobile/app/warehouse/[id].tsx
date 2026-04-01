import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getWarehouses, getBalances } from '../../src/api/warehouses';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { BalanceDto } from '../../src/types/warehouse';

const warehouseTypeLabel = (t: number) =>
  t === 1 ? 'Основний' : t === 2 ? 'Допоміжний' : 'Склад';

export default function WarehouseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const {
    data: whList,
    isLoading: whLoading,
  } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses(),
    staleTime: 30_000,
  });

  const warehouse = whList?.items?.find((w) => w.id === id);

  const {
    data: balances,
    isLoading: balLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['warehouse-balances', id],
    queryFn: () => getBalances({ warehouseId: id, pageSize: 200 }),
    enabled: !!id,
    staleTime: 15_000,
  });

  if (whLoading || balLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerName}>{warehouse?.name ?? 'Склад'}</Text>
        {warehouse?.location ? (
          <Text style={styles.headerSub}>{warehouse.location}</Text>
        ) : null}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{warehouseTypeLabel(warehouse?.type ?? 0)}</Text>
        </View>
      </View>

      {/* Balances */}
      <FlatList<BalanceDto>
        data={balances?.items ?? []}
        keyExtractor={(item) => `${item.itemId}-${item.batchId ?? ''}`}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{item.itemName}</Text>
              <Text style={styles.cardQty}>
                {item.balanceBase} {item.baseUnit}
              </Text>
            </View>
            {item.itemCode ? (
              <Text style={styles.cardCode}>{item.itemCode}</Text>
            ) : null}
            {item.lastUpdatedUtc ? (
              <Text style={styles.cardDate}>
                Оновлено: {new Date(item.lastUpdatedUtc).toLocaleDateString('uk-UA')}
              </Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Склад порожній. Зробіть перший прихід</Text>
        }
      />

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.success }]}
          onPress={() => router.push(`/warehouse/receipt?warehouseId=${id}`)}
        >
          <Text style={styles.actionText}>Прихід</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.warning }]}
          onPress={() => router.push(`/warehouse/issue?warehouseId=${id}`)}
        >
          <Text style={styles.actionText}>Витрата</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.info }]}
          onPress={() => router.push(`/warehouse/transfer?warehouseId=${id}`)}
        >
          <Text style={styles.actionText}>Переміщення</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerName: { ...typography.h2, color: colors.text },
  headerSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.sm,
  },
  badgeText: { ...typography.caption, color: colors.textInverse },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { ...typography.body, color: colors.text, flex: 1, marginRight: spacing.sm },
  cardQty: { ...typography.h3, color: colors.primary },
  cardCode: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  cardDate: { ...typography.caption, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
  actions: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionText: { ...typography.label, color: colors.textInverse },
});
