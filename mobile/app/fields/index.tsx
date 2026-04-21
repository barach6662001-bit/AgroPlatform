import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getFields } from '../../src/api/fields';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { FieldDto } from '../../src/types/field';

const cropLabels: Record<string, string> = {
  Wheat: 'Пшениця', Barley: 'Ячмінь', Corn: 'Кукурудза', Sunflower: 'Соняшник',
  Soybean: 'Соя', Rapeseed: 'Ріпак', SugarBeet: 'Буряк', Potato: 'Картопля',
  Fallow: 'Пар', Other: 'Інше',
};

export default function FieldsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['fields'],
    queryFn: () => getFields({ pageSize: 200 }),
    staleTime: 30_000,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList<FieldDto>
        data={data?.items ?? []}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => router.push(`/fields/${item.id}`)}>
            <View style={styles.cardRow}>
              <Text style={styles.cardName}>{item.name}</Text>
              <Text style={styles.cardArea}>{item.areaHectares} га</Text>
            </View>
            {item.currentCrop ? (
              <Text style={styles.cardCrop}>{cropLabels[item.currentCrop] ?? item.currentCrop}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Полів не знайдено</Text>}
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
  cardName: { ...typography.h3, color: colors.text, flex: 1 },
  cardArea: { ...typography.label, color: colors.primary },
  cardCrop: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
});
