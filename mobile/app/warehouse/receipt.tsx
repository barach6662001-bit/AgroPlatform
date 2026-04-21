import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createReceipt, getWarehouses, getWarehouseItems, getBalances } from '../../src/api/warehouses';
import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';
import { enqueueOperation } from '../../src/utils/offlineQueue';
import SearchableModal from '../../src/components/SearchableModal';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { WarehouseDto, WarehouseItemDto } from '../../src/types/warehouse';

const UNITS = ['кг', 'т', 'л', 'шт'];

export default function ReceiptScreen() {
  const { warehouseId: paramWhId } = useLocalSearchParams<{ warehouseId?: string }>();
  const router = useRouter();
  const online = useOnlineStatus();
  const queryClient = useQueryClient();

  const [selectedWh, setSelectedWh] = useState<WarehouseDto | null>(null);
  const [selectedItem, setSelectedItem] = useState<WarehouseItemDto | null>(null);
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('кг');
  const [note, setNote] = useState('');
  const [whModal, setWhModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);

  const { data: whData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses({ pageSize: 200 }),
    staleTime: 30_000,
  });

  // Pre-fill warehouse from route params
  if (paramWhId && !selectedWh && whData?.items) {
    const found = whData.items.find((w) => w.id === paramWhId);
    if (found) setSelectedWh(found);
  }

  const { data: itemsData } = useQuery({
    queryKey: ['warehouse-items'],
    queryFn: () => getWarehouseItems({ pageSize: 500 }),
    staleTime: 30_000,
  });

  const whId = selectedWh?.id ?? paramWhId;
  const itemId = selectedItem?.id;

  const { data: balData } = useQuery({
    queryKey: ['balance-preview', whId, itemId],
    queryFn: () => getBalances({ warehouseId: whId!, itemId: itemId!, pageSize: 1 }),
    enabled: !!whId && !!itemId,
    staleTime: 10_000,
  });

  const currentBalance = balData?.items?.[0]?.balanceBase ?? 0;
  const currentUnit = balData?.items?.[0]?.baseUnit ?? unit;
  const qtyNum = parseFloat(qty) || 0;

  const mutation = useMutation({
    mutationFn: () =>
      createReceipt({
        warehouseId: whId!,
        itemId: itemId!,
        unitCode: unit,
        quantity: qtyNum,
        note: note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-balances'] });
      Alert.alert('Готово', 'Прихід записано', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Помилка при збереженні';
      Alert.alert('Помилка', msg);
    },
  });

  const handleSubmit = () => {
    if (!whId || !itemId || qtyNum <= 0) return;

    if (!online) {
      enqueueOperation({
        method: 'POST',
        url: '/api/warehouses/receipt',
        data: { warehouseId: whId, itemId, unitCode: unit, quantity: qtyNum, note: note || undefined },
      });
      Alert.alert('Офлайн', 'Збережено офлайн. Синхронізується при підключенні.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    mutation.mutate();
  };

  const canSubmit = !!whId && !!itemId && qtyNum > 0 && !mutation.isPending;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Warehouse picker */}
        <Text style={styles.label}>Склад</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setWhModal(true)}>
          <Text style={selectedWh ? styles.pickerText : styles.pickerPlaceholder}>
            {selectedWh?.name ?? 'Оберіть склад'}
          </Text>
        </TouchableOpacity>

        {/* Item picker */}
        <Text style={styles.label}>Товар</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setItemModal(true)}>
          <Text style={selectedItem ? styles.pickerText : styles.pickerPlaceholder}>
            {selectedItem ? `${selectedItem.name} (${selectedItem.code})` : 'Оберіть товар'}
          </Text>
        </TouchableOpacity>

        {/* Quantity */}
        <Text style={styles.label}>Кількість</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          value={qty}
          onChangeText={setQty}
        />

        {/* Unit */}
        <Text style={styles.label}>Одиниця</Text>
        <View style={styles.unitRow}>
          {UNITS.map((u) => (
            <TouchableOpacity
              key={u}
              style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
              onPress={() => setUnit(u)}
            >
              <Text style={[styles.unitText, unit === u && styles.unitTextActive]}>{u}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Note */}
        <Text style={styles.label}>Примітка</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={3}
          placeholder="Необов'язково"
          placeholderTextColor={colors.textSecondary}
          value={note}
          onChangeText={setNote}
        />

        {/* Balance preview */}
        {whId && itemId ? (
          <View style={styles.preview}>
            <Text style={styles.previewLabel}>Баланс</Text>
            <Text style={styles.previewGreen}>
              Зараз: {currentBalance} {currentUnit} → Після: {currentBalance + qtyNum} {currentUnit}
            </Text>
          </View>
        ) : null}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
          disabled={!canSubmit}
          onPress={handleSubmit}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitText}>Записати прихід</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <SearchableModal<WarehouseDto>
        visible={whModal}
        onClose={() => setWhModal(false)}
        onSelect={setSelectedWh}
        data={whData?.items ?? []}
        searchKey="name"
        renderItem={(w) => `${w.name}${w.location ? ` — ${w.location}` : ''}`}
        title="Оберіть склад"
      />

      <SearchableModal<WarehouseItemDto>
        visible={itemModal}
        onClose={() => setItemModal(false)}
        onSelect={setSelectedItem}
        data={itemsData?.items ?? []}
        searchKey="name"
        renderItem={(i) => `${i.name} (${i.code})`}
        title="Оберіть товар"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.backgroundSecondary },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  label: { ...typography.label, color: colors.text, marginTop: spacing.md, marginBottom: spacing.xs },
  picker: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pickerText: { ...typography.body, color: colors.text },
  pickerPlaceholder: { ...typography.body, color: colors.textSecondary },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  unitRow: { flexDirection: 'row', gap: spacing.sm },
  unitBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  unitBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  unitText: { ...typography.label, color: colors.text },
  unitTextActive: { color: colors.textInverse },
  preview: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  previewLabel: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  previewGreen: { ...typography.body, color: colors.success },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { ...typography.label, color: colors.textInverse },
});
