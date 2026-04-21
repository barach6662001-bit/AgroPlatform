import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getMachines } from '../../src/api/machinery';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { MachineDto } from '../../src/types/machinery';

const typeLabels: Record<string, string> = {
  Tractor: 'Трактор', Combine: 'Комбайн', Sprayer: 'Обприскувач',
  Seeder: 'Сівалка', Cultivator: 'Культиватор', Truck: 'Вантажівка', Other: 'Інше',
};
const statusColors: Record<string, string> = {
  Active: colors.success, UnderRepair: colors.warning, Decommissioned: colors.error,
};
const statusLabels: Record<string, string> = {
  Active: 'Активна', UnderRepair: 'В ремонті', Decommissioned: 'Списана',
};

export default function MachineryListScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['machines'],
    queryFn: () => getMachines({ pageSize: 200 }),
    staleTime: 30_000,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList<MachineDto>
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/machinery/${item.id}`)}>
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{item.name}</Text>
              <View style={[styles.badge, { backgroundColor: statusColors[item.status] ?? colors.textSecondary }]}> 
                <Text style={styles.badgeText}>{statusLabels[item.status] ?? item.status}</Text>
              </View>
            </View>
            <Text style={styles.cardSub}>
              {typeLabels[item.type] ?? item.type}{item.brand ? ` — ${item.brand}` : ''}{item.model ? ` ${item.model}` : ''}
            </Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Техніку не знайдено</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { ...typography.h3, color: colors.text, flex: 1, marginRight: spacing.sm },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  badgeText: { ...typography.caption, color: colors.textInverse, fontWeight: '600' },
  cardSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
});
