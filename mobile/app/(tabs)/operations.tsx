import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { getOperations } from '../../src/api/operations';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';

const STATUS_COLORS: Record<string, string> = {
  completed: colors.success,
  inProgress: colors.warning,
  planned: colors.info,
};

export default function OperationsTab() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['operations'],
    queryFn: () => getOperations({}),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const items = (data?.items ?? []);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/operations/${item.id}`)}
          >
            <View style={styles.row}>
              <Text style={styles.cardName}>{item.operationType}</Text>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: item.isCompleted ? STATUS_COLORS.completed : STATUS_COLORS.planned },
                ]}
              >
                <Text style={styles.badgeText}>{item.isCompleted ? 'Виконано' : 'Заплановано'}</Text>
              </View>
            </View>
            {item.fieldName ? (
              <Text style={styles.cardSub}>{item.fieldName}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Операцій не знайдено</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { ...typography.h3, color: colors.text, flex: 1 },
  cardSub: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: { ...typography.caption, color: '#fff', fontWeight: '600' },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
});
