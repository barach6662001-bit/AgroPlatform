import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

interface Props {
  pending: number;
}

export function OfflineBanner({ pending }: Props) {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Офлайн режим. Очікує синхронізації: {pending}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFE69C',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  text: {
    ...typography.bodySmall,
    color: colors.warning,
  },
});
