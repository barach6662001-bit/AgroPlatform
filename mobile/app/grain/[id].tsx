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
import { getGrainStorages } from '../../src/api/grain';
import { getGrainBatches, getGrainMovements } from '../../src/api/grain';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { GrainBatchDto, GrainMovementDto } from '../../src/types/grain';

const ownershipLabels: Record<number, string> = { 0: 'Власне', 1: 'Зберігання', 2: 'Давальницьке', 3: 'Інше' };

const movementTypeLabels: Record<string, string> = {
  Receipt: 'Прихід',
  Transfer: 'Перемiщення',
  Split: 'Розподіл',
  Merge: 'Об\'єднання',
  Issue: 'Видача',
  SaleDispatch: 'Відвантаження',
  Adjustment: 'Коригування',
  WriteOff: 'Списання',
};

export default function GrainDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: storages } = useQuery({
    queryKey: ['grain-storages'],
    queryFn: () => getGrainStorages(),
    staleTime: 30_000,
  });
  const storage = storages?.find((s) => s.id === id);

  const { data: batches, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['grain-batches', id],
    queryFn: () => getGrainBatches({ storageId: id, pageSize: 200 }),
    enabled: !!id,
    staleTime: 15_000,
  });

  if (isLoading) {
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
        <Text style={styles.headerName}>{storage?.name ?? 'Зерносховище'}</Text>
        {storage?.location ? <Text style={styles.headerSub}>{storage.location}</Text> : null}
        <View style={styles.statsRow}>
          <Text style={styles.stat}>
            {storage?.totalTons ?? 0} т / {storage?.capacityTons ?? '—'} т
          </Text>
          <Text style={styles.stat}>{storage?.batchCount ?? 0} партій</Text>
        </View>
      </View>

      {/* Batches */}
      <FlatList<GrainBatchDto>
        data={batches?.items ?? []}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <BatchCard batch={item} />}
        ListEmptyComponent={<Text style={styles.empty}>Партій зерна не знайдено</Text>}
      />

      {/* Shipment button */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(`/grain/shipment?storageId=${id}`)}
        >
          <Text style={styles.actionText}>Відвантаження</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BatchCard({ batch }: { batch: GrainBatchDto }) {
  const { data: movements } = useQuery({
    queryKey: ['grain-movements', batch.id],
    queryFn: () => getGrainMovements(batch.id),
    staleTime: 30_000,
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <Text style={styles.cardType}>{batch.grainType}</Text>
        <Text style={styles.cardQty}>{batch.quantityTons} т</Text>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.meta}>Початково: {batch.initialQuantityTons} т</Text>
        <Text style={styles.meta}>{ownershipLabels[batch.ownershipType] ?? ''}</Text>
      </View>

      {batch.moisturePercent != null ? (
        <Text style={styles.meta}>Вологість: {batch.moisturePercent}%</Text>
      ) : null}

      {batch.receivedDate ? (
        <Text style={styles.meta}>
          Отримано: {new Date(batch.receivedDate).toLocaleDateString('uk-UA')}
        </Text>
      ) : null}

      {batch.sourceFieldName ? (
        <Text style={styles.meta}>Поле: {batch.sourceFieldName}</Text>
      ) : null}

      {/* Recent movements */}
      {movements && movements.length > 0 ? (
        <View style={styles.movementsSection}>
          <Text style={styles.movementsTitle}>Рух зерна</Text>
          {movements.slice(0, 5).map((m: GrainMovementDto) => (
            <View key={m.id} style={styles.movementRow}>
              <Text style={styles.movementDate}>
                {new Date(m.movementDate).toLocaleDateString('uk-UA')}
              </Text>
              <Text style={styles.movementType}>
                {movementTypeLabels[m.movementType] ?? m.movementType}
              </Text>
              <Text style={styles.movementQty}>{m.quantityTons} т</Text>
            </View>
          ))}
        </View>
      ) : null}
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
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  stat: { ...typography.label, color: colors.primary },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { ...typography.h3, color: colors.text },
  cardQty: { ...typography.h3, color: colors.primary },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xs },
  meta: { ...typography.caption, color: colors.textSecondary, marginTop: 2 },
  movementsSection: { marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.sm },
  movementsTitle: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  movementRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  movementDate: { ...typography.caption, color: colors.textSecondary, width: 80 },
  movementType: { ...typography.caption, color: colors.text, flex: 1 },
  movementQty: { ...typography.caption, color: colors.primary, textAlign: 'right', width: 60 },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
  actions: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm + 4,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  actionText: { ...typography.label, color: colors.textInverse },
});
