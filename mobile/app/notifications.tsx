import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationDto,
} from '../src/api/notifications';
import { colors } from '../src/theme/colors';
import { spacing, radius } from '../src/theme/spacing';
import { typography } from '../src/theme/typography';

const typeColors: Record<string, string> = {
  info: colors.primary,
  warning: colors.warning,
  error: colors.error,
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'щойно';
  if (mins < 60) return `${mins} хв тому`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} год тому`;
  return `${Math.floor(hrs / 24)} д тому`;
}

export default function NotificationsScreen() {
  const qc = useQueryClient();

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => getNotifications(),
    staleTime: 15_000,
  });

  const markRead = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAll = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const notifications = data ?? [];
  const unread = notifications.filter((n) => !n.isRead).length;

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <View style={styles.container}>
      {unread > 0 && (
        <Pressable style={styles.markAll} onPress={() => markAll.mutate()}>
          <Text style={styles.markAllText}>Прочитати все ({unread})</Text>
        </Pressable>
      )}

      <FlatList<NotificationDto>
        data={notifications}
        keyExtractor={(item) => item.id}
        onRefresh={refetch}
        refreshing={isRefetching}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.card, !item.isRead && styles.unread]}
            onPress={() => { if (!item.isRead) markRead.mutate(item.id); }}
          >
            <View style={styles.row}>
              <View style={[styles.dot, { backgroundColor: typeColors[item.type] ?? colors.primary }]} />
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.time}>{timeAgo(item.createdAtUtc)}</Text>
            </View>
            <Text style={styles.body} numberOfLines={2}>{item.body}</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Сповіщень немає</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  markAll: { padding: spacing.md, alignItems: 'flex-end' },
  markAllText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
  list: { padding: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  card: { backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  unread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  dot: { width: 8, height: 8, borderRadius: 4 },
  title: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  time: { ...typography.caption, color: colors.textSecondary },
  body: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs },
  empty: { ...typography.body, color: colors.textSecondary, textAlign: 'center', paddingTop: 40 },
});
