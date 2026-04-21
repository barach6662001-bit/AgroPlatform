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
import { createTransfer, getWarehouses, getWarehouseItems, getBalances } from '../../src/api/warehouses';
import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';
import { enqueueOperation } from '../../src/utils/offlineQueue';
import SearchableModal from '../../src/components/SearchableModal';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { WarehouseDto, WarehouseItemDto } from '../../src/types/warehouse';

const UNITS = ['кг', 'т', 'л', 'шт'];

export default function TransferScreen() {
  const { warehouseId: paramWhId } = useLocalSearchParams<{ warehouseId?: string }>();
  const router = useRouter();
  const online = useOnlineStatus();
  const queryClient = useQueryClient();

  const [sourceWh, setSourceWh] = useState<WarehouseDto | null>(null);
  const [destWh, setDestWh] = useState<WarehouseDto | null>(null);
  const [selectedItem, setSelectedItem] = useState<WarehouseItemDto | null>(null);
  const [qty, setQty] = useState('');
  const [unit, setUnit] = useState('кг');
  const [note, setNote] = useState('');
  const [srcModal, setSrcModal] = useState(false);
  const [destModal, setDestModal] = useState(false);
  const [itemModal, setItemModal] = useState(false);

  const { data: whData } = useQuery({
    queryKey: ['warehouses'],
    queryFn: () => getWarehouses({ pageSize: 200 }),
    staleTime: 30_000,
  });

  if (paramWhId && !sourceWh && whData?.items) {
    const found = whData.items.find((w) => w.id === paramWhId);
    if (found) setSourceWh(found);
  }

  const { data: itemsData } = useQuery({
    queryKey: ['warehouse-items'],
    queryFn: () => getWarehouseItems({ pageSize: 500 }),
    staleTime: 30_000,
  });

  const srcId = sourceWh?.id ?? paramWhId;
  const itemId = selectedItem?.id;

  const { data: balData } = useQuery({
    queryKey: ['balance-preview', srcId, itemId],
    queryFn: () => getBalances({ warehouseId: srcId!, itemId: itemId!, pageSize: 1 }),
    enabled: !!srcId && !!itemId,
    staleTime: 10_000,
  });

  const currentBalance = balData?.items?.[0]?.balanceBase ?? 0;
  const currentUnit = balData?.items?.[0]?.baseUnit ?? unit;
  const qtyNum = parseFloat(qty) || 0;
  const afterBalance = currentBalance - qtyNum;
  const insufficient = qtyNum > 0 && afterBalance < 0;

  const destOptions = (whData?.items ?? []).filter((w) => w.id !== srcId);

  const mutation = useMutation({
    mutationFn: () =>
      createTransfer({
        sourceWarehouseId: srcId!,
        destinationWarehouseId: destWh!.id,
        itemId: itemId!,
        unitCode: unit,
        quantity: qtyNum,
        note: note || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-balances'] });
      Alert.alert('Готово', 'Переміщення записано', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Помилка при збереженні';
      Alert.alert('Помилка', msg);
    },
  });

  const handleSubmit = () => {
    if (!srcId || !destWh || !itemId || qtyNum <= 0 || insufficient) return;

    if (!online) {
      enqueueOperation({
        method: 'POST',
        url: '/api/warehouses/transfer',
        data: {
          sourceWarehouseId: srcId,
          destinationWarehouseId: destWh.id,
          itemId,
          unitCode: unit,
          quantity: qtyNum,
          note: note || undefined,
        },
      });
      Alert.alert('Офлайн', 'Збережено офлайн. Синхронізується при підключенні.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }

    mutation.mutate();
  };

  const canSubmit = !!srcId && !!destWh && !!itemId && qtyNum > 0 && !insufficient && !mutation.isPending;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Source warehouse */}
        <Text style={styles.label}>Склад-відправник</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setSrcModal(true)}>
          <Text style={sourceWh ? styles.pickerText : styles.pickerPlaceholder}>
            {sourceWh?.name ?? 'Оберіть склад'}
          </Text>
        </TouchableOpacity>

        {/* Destination warehouse */}
        <Text style={styles.label}>Склад-отримувач</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setDestModal(true)}>
          <Text style={destWh ? styles.pickerText : styles.pickerPlaceholder}>
            {destWh?.name ?? 'Оберіть склад'}
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
        {srcId && itemId ? (
          <View style={[styles.preview, insufficient && styles.previewError]}>
            <Text style={styles.previewLabel}>Баланс (склад-відправник)</Text>
            <Text style={insufficient ? styles.previewRed : styles.previewGreen}>
              Зараз: {currentBalance} {currentUnit} → Після: {afterBalance} {currentUnit}
            </Text>
            {insufficient ? (
              <Text style={styles.insufficientText}>
                Недостатньо: {afterBalance} {currentUnit}
              </Text>
            ) : null}
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
            <Text style={styles.submitText}>Виконати переміщення</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      <SearchableModal<WarehouseDto>
        visible={srcModal}
        onClose={() => setSrcModal(false)}
        onSelect={(w) => { setSourceWh(w); if (destWh?.id === w.id) setDestWh(null); }}
        data={whData?.items ?? []}
        searchKey="name"
        renderItem={(w) => `${w.name}${w.location ? ` — ${w.location}` : ''}`}
        title="Склад-відправник"
      />

      <SearchableModal<WarehouseDto>
        visible={destModal}
        onClose={() => setDestModal(false)}
        onSelect={setDestWh}
        data={destOptions}
        searchKey="name"
        renderItem={(w) => `${w.name}${w.location ? ` — ${w.location}` : ''}`}
        title="Склад-отримувач"
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
  scrollContent: { padding: spacing.md, paddingBottom: spacing.xxl },
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
  previewError: { borderColor: colors.error },
  previewLabel: { ...typography.label, color: colors.text, marginBottom: spacing.xs },
  previewGreen: { ...typography.body, color: colors.success },
  previewRed: { ...typography.body, color: colors.error },
  insufficientText: { ...typography.caption, color: colors.error, marginTop: spacing.xs, fontWeight: '600' },
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
