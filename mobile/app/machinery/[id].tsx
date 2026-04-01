import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getMachineById } from '../../src/api/machinery';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { WorkLogDto, FuelLogDto } from '../../src/types/machinery';

const statusLabels: Record<string, string> = {
  Active: 'Активна', UnderRepair: 'В ремонті', Decommissioned: 'Списана',
};

export default function MachineryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: machine, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['machine', id],
    queryFn: () => getMachineById(id!),
    enabled: !!id,
    staleTime: 15_000,
  });

  if (isLoading || !machine) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{machine.name}</Text>
        <Text style={styles.sub}>
          {machine.brand ?? ''} {machine.model ?? ''} {machine.year ? `(${machine.year})` : ''}
        </Text>
        <Text style={styles.status}>{statusLabels[machine.status] ?? machine.status}</Text>
      </View>

      <View style={styles.section}>
        <Row label="Інвентарний №" value={machine.inventoryNumber} />
        <Row label="Паливо" value={machine.fuelType} />
        {machine.fuelConsumptionPerHour ? <Row label="Витрата/год" value={`${machine.fuelConsumptionPerHour} л`} /> : null}
        {machine.assignedDriverName ? <Row label="Водій" value={machine.assignedDriverName} /> : null}
        <Row label="Всього годин" value={String(machine.totalHoursWorked ?? 0)} />
        <Row label="Всього палива" value={`${machine.totalFuelConsumed ?? 0} л`} />
        {machine.nextMaintenanceDate ? <Row label="Наст. ТО" value={new Date(machine.nextMaintenanceDate).toLocaleDateString('uk-UA')} /> : null}
      </View>

      {machine.recentWorkLogs && machine.recentWorkLogs.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Останні роботи</Text>
          {machine.recentWorkLogs.slice(0, 5).map((w: WorkLogDto) => (
            <View key={w.id} style={styles.logRow}>
              <Text style={styles.logDate}>{new Date(w.date).toLocaleDateString('uk-UA')}</Text>
              <Text style={styles.logVal}>{w.hoursWorked} год</Text>
              {w.description ? <Text style={styles.logDesc}>{w.description}</Text> : null}
            </View>
          ))}
        </View>
      ) : null}

      {machine.recentFuelLogs && machine.recentFuelLogs.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Останні заправки</Text>
          {machine.recentFuelLogs.slice(0, 5).map((f: FuelLogDto) => (
            <View key={f.id} style={styles.logRow}>
              <Text style={styles.logDate}>{new Date(f.date).toLocaleDateString('uk-UA')}</Text>
              <Text style={styles.logVal}>{f.quantity} л ({f.fuelType})</Text>
            </View>
          ))}
        </View>
      ) : null}
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { backgroundColor: colors.surface, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  name: { ...typography.h2, color: colors.text },
  sub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  status: { ...typography.label, color: colors.primary, marginTop: spacing.xs },
  section: { backgroundColor: colors.surface, marginTop: spacing.sm, padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, borderBottomWidth: 1, borderBottomColor: colors.border },
  sectionTitle: { ...typography.label, color: colors.text, marginBottom: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  rowLabel: { ...typography.bodySmall, color: colors.textSecondary },
  rowValue: { ...typography.bodySmall, color: colors.text, fontWeight: '500' },
  logRow: { flexDirection: 'row', flexWrap: 'wrap', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  logDate: { ...typography.caption, color: colors.textSecondary, width: 80 },
  logVal: { ...typography.caption, color: colors.text },
  logDesc: { ...typography.caption, color: colors.textSecondary, width: '100%' },
});
