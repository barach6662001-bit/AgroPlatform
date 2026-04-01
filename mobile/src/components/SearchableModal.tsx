import { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface SearchableModalProps<T> {
  visible: boolean;
  onClose: () => void;
  onSelect: (item: T) => void;
  data: T[];
  searchKey: keyof T;
  renderItem: (item: T) => string;
  title?: string;
}

export default function SearchableModal<T>({
  visible,
  onClose,
  onSelect,
  data,
  searchKey,
  renderItem,
  title = 'Оберіть',
}: SearchableModalProps<T>) {
  const [search, setSearch] = useState('');

  const filtered = data.filter((item) => {
    const val = String((item as Record<string, unknown>)[searchKey as string] ?? '');
    return val.toLowerCase().includes(search.toLowerCase());
  });

  const handleSelect = (item: T) => {
    onSelect(item);
    setSearch('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>✕</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Пошук..."
            placeholderTextColor={colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            autoCapitalize="none"
          />

          <FlatList
            data={filtered}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.row} onPress={() => handleSelect(item)}>
                <Text style={styles.rowText}>{renderItem(item)}</Text>
              </TouchableOpacity>
            )}
            ListEmptyComponent={<Text style={styles.empty}>Нічого не знайдено</Text>}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '80%',
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { ...typography.h3, color: colors.text },
  close: { fontSize: 20, color: colors.textSecondary, padding: spacing.xs },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
    margin: spacing.md,
    padding: spacing.sm + 4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowText: { ...typography.body, color: colors.text },
  empty: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: spacing.lg,
  },
});
