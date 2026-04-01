import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { getOperationById, completeOperation } from '../../src/api/operations';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { AgroOperationResourceDto, AgroOperationMachineryDto } from '../../src/types/operation';

const opTypeLabels: Record<string, string> = {
  Sowing: 'Посів',
  Fertilizing: 'Удобрення',
  PlantProtection: 'Захист рослин',
  SoilTillage: 'Обробіток ґрунту',
  Harvesting: 'Збирання',
};

export default function OperationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: op, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['operation', id],
    queryFn: () => getOperationById(id!),
    enabled: !!id,
    staleTime: 15_000,
  });

  const completeMutation = useMutation({
    mutationFn: () =>
      completeOperation(id!, { completedDate: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operation', id] });
      queryClient.invalidateQueries({ queryKey: ['operations'] });
      Alert.alert('Готово', 'Операцію завершено');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Помилка';
      Alert.alert('Помилка', msg);
    },
  });

  if (isLoading || !op) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <__RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerType}>{opTypeLabels[op.operationType] ?? op.operationType}</Text>
          <View style={[styles.statusBadge, op.isCompleted ? styles.statusDone : styles.statusPlanned]}>
            <Text style={styles.statusText}>{op.isCompleted ? 'Завершено' : 'Заплановано'}</Text>
          </View>
        </View>
        <Text style={styles.fieldName}>{op.fieldName}</Text>
        {op.description ? <Text style={styles.desc}>{op.description}</Text> : null}
      </View>

      {/* Details */}
      <View style={styles.section}>
        <DetailRow label="Заплановано" value={new Date(op.plannedDate).toLocaleDateString('uk-UA')} />
        {op.completedDate ? (
          <DetailRow label="Завершено" value={new Date(op.completedDate).toLocaleDateString('uk-UA')} />
        ) : null}
        {op.performedByName ? <DetailRow label="Виконавець" value={op.performedByName} /> : null}
        {op.areaProcessed ? <DetailRow label="Оброблено" value={`${op.areaProcessed} га`} /> : null}
      </View>

      {/* Resources */}
      {op.resources && op.resources.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ресурси</Text>
          {op.resources.map((r: AgroOperationResourceDto) => (
            <View key={r.id} style={styles.resRow}>
              <Text style={styles.resName}>{r.warehouseItemName}</Text>
              <Text style={styles.resQty}>
                {r.actualQuantity != null ? `${r.actualQuantity}` : '—'} / {r.plannedQuantity} {r.unitCode}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Machinery */}
      {op.machineryUsed && op.machineryUsed.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Техніка</Text>
          {op.machineryUsed.map((m: AgroOperationMachineryDto) => (
            <View key={m.id} style={styles.resRow}>
              <Text style={styles.resName}>{m.machineName}</Text>
              <Text style={styles.resQty}>
                {m.hoursWorked != null ? `${m.hoursWorked} год` : ''}
                {m.fuelUsed != null ? ` / ${m.fuelUsed} л` : ''}
                {m.operatorName ? ` — ${m.operatorName}` : ''}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {/* Complete button */}
      {!op.isCompleted ? (
        <TouchableOpacity
          style={[styles.completeBtn, completeMutation.isPending && styles.btnDisabled]}
          disabled={completeMutation.isPending}
          onPress={() =>
            Alert.alert('Підтвердження', 'Завершити цю операцію?', [
              { text: 'Ні', style: 'cancel' },
              { text: 'Так', onPress: () => completeMutation.mutate() },
            ])
          }
        >
          {completeMutation.isPending ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.completeText}>Завершити операцію</Text>
          )}
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

// RefreshControl import alias to avoid JSX conflict
import { RefreshControl as __RefreshControl } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  scrollContent: { paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerType: { ...typography.h2, color: colors.text },
  statusBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.sm },
  statusDone: { backgroundColor: colors.success },
  statusPlanned: { backgroundColor: colors.warning },
  statusText: { ...typography.caption, color: colors.textInverse, fontWeight: '600' },
  fieldName: { ...typography.body, color: colors.primary, marginTop: spacing.xs },
  desc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  section: {
    backgroundColor: colors.surface,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  detailLabel: { ...typography.bodySmall, color: colors.textSecondary },
  detailValue: { ...typography.bodySmall, color: colors.text, fontWeight: '500' },
  resRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  resName: { ...typography.body, color: colors.text, flex: 1 },
  resQty: { ...typography.bodySmall, color: colors.primary },
  completeBtn: {
    backgroundColor: colors.success,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  completeText: { ...typography.label, color: colors.textInverse },
});
