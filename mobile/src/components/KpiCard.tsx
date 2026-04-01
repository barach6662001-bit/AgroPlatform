import { StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  positive?: boolean;
}

export function KpiCard({ icon, label, value, positive }: Props) {
  const valueColor = positive === undefined ? colors.text : positive ? colors.success : colors.error;

  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 180,
    padding: spacing.md,
    marginRight: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  value: {
    ...typography.h3,
    marginTop: spacing.xs,
  },
});
