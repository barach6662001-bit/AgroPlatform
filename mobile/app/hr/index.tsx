import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { getEmployees } from '../../src/api/hr';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { EmployeeDto } from '../../src/types/hr';

const salaryTypeLabels: Record<string, string> = { Hourly: 'Погодинна', Piecework: 'Відрядна' };

export default function HRScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['employees'],
    queryFn: () => getEmployees(true),
    staleTime: 30_000,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      <FlatList<EmployeeDto>
        data={data ?? []}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.lastName} {item.firstName}</Text>
            {item.position ? <Text style={styles.position}>{item.position}</Text> : null}
            <Text style={styles.salary}>
              {salaryTypeLabels[item.salaryType] ?? item.salaryType}
              {item.hourlyRate ? ` — ${item.hourlyRate} грн/год` : ''}
            </Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Працівників не знайдено</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  name: { ...typography.h3, color: colors.text },
  position: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  salary: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
});
