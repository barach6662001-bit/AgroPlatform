import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../src/theme/colors';
import { spacing } from '../src/theme/spacing';
import { typography } from '../src/theme/typography';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Notifications (Coming in Phase 2)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.backgroundSecondary, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  text: { ...typography.h3, color: colors.text, textAlign: 'center' },
});
