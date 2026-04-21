import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getFieldById } from '../../src/api/fields';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { CropHistoryDto } from '../../src/types/field';

const cropLabels: Record<string, string> = {
  Wheat: 'Пшениця', Barley: 'Ячмінь', Corn: 'Кукурудза', Sunflower: 'Соняшник',
  Soybean: 'Соя', Rapeseed: 'Ріпак', SugarBeet: 'Буряк', Potato: 'Картопля',
  Fallow: 'Пар', Other: 'Інше',
};

export default function FieldDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: field, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['field', id],
    queryFn: () => getFieldById(id!),
    enabled: !!id,
    staleTime: 15_000,
  });

  if (isLoading || !field) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<__RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{field.name}</Text>
        <Text style={styles.area}>{field.areaHectares} га</Text>
      </View>

      <View style={styles.section}>
        {field.currentCrop ? (
          <DetailRow label="Культура" value={cropLabels[field.currentCrop] ?? field.currentCrop} />
        ) : null}
        {field.soilType ? <DetailRow label="Тип ґрунту" value={field.soilType} /> : null}
        {field.cadastralNumber ? <DetailRow label="Кадастровий №" value={field.cadastralNumber} /> : null}
        {field.notes ? <DetailRow label="Нотатки" value={field.notes} /> : null}
      </View>

      {field.cropHistory && field.cropHistory.length > 0 ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Історія культур</Text>
          {field.cropHistory.map((h: CropHistoryDto) => (
            <View key={h.id} style={styles.historyRow}>
              <Text style={styles.historyYear}>{h.year}</Text>
              <Text style={styles.historyCrop}>{cropLabels[h.cropType] ?? h.cropType}</Text>
              <Text style={styles.historyYield}>
                {h.yieldTonnesPerHa != null ? `${h.yieldTonnesPerHa} т/га` : '—'}
              </Text>
            </View>
          ))}
        </View>
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

import { RefreshControl as __RefreshControl } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: { ...typography.h2, color: colors.text },
  area: { ...typography.h3, color: colors.primary },
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
  detailValue: { ...typography.bodySmall, color: colors.text, fontWeight: '500', textAlign: 'right', flex: 1, marginLeft: spacing.md },
  historyRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs, borderBottomWidth: 1, borderBottomColor: colors.border },
  historyYear: { ...typography.label, color: colors.text, width: 50 },
  historyCrop: { ...typography.body, color: colors.text, flex: 1 },
  historyYield: { ...typography.bodySmall, color: colors.primary, width: 80, textAlign: 'right' },
});
