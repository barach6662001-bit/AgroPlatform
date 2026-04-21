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
import { getGrainBatches, createGrainMovement } from '../../src/api/grain';
import { colors } from '../../src/theme/colors';
import { spacing, radius } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import type { GrainBatchDto } from '../../src/types/grain';

export default function ShipmentScreen() {
  const { storageId, batchId: paramBatchId } = useLocalSearchParams<{
    storageId?: string;
    batchId?: string;
  }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedBatch, setSelectedBatch] = useState<GrainBatchDto | null>(null);
  const [qty, setQty] = useState('');
  const [buyer, setBuyer] = useState('');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [batchModal, setBatchModal] = useState(false);

  const { data: batchesData } = useQuery({
    queryKey: ['grain-batches', storageId],
    queryFn: () => getGrainBatches({ storageId, pageSize: 200 }),
    staleTime: 30_000,
  });

  if (paramBatchId && !selectedBatch && batchesData?.items) {
    const found = batchesData.items.find((b) => b.id === paramBatchId);
    if (found) setSelectedBatch(found);
  }

  const qtyNum = parseFloat(qty) || 0;
  const priceNum = parseFloat(price) || 0;
  const batchId = selectedBatch?.id ?? paramBatchId;
  const available = selectedBatch?.quantityTons ?? 0;
  const insufficient = qtyNum > 0 && qtyNum > available;

  const mutation = useMutation({
    mutationFn: () =>
      createGrainMovement(batchId!, {
        movementType: 'SaleDispatch',
        quantityTons: qtyNum,
        movementDate: new Date().toISOString(),
        buyerName: buyer || undefined,
        pricePerTon: priceNum || undefined,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grain-batches'] });
      queryClient.invalidateQueries({ queryKey: ['grain-movements'] });
      Alert.alert('Готово', 'Відвантаження записано', [{ text: 'OK', onPress: () => router.back() }]);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Помилка при збереженні';
      Alert.alert('Помилка', msg);
    },
  });

  const canSubmit = !!batchId && qtyNum > 0 && !insufficient && !mutation.isPending;

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Batch picker */}
        <Text style={styles.label}>Партія зерна</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setBatchModal(true)}>
          <Text style={selectedBatch ? styles.pickerText : styles.pickerPlaceholder}>
            {selectedBatch
              ? `${selectedBatch.grainType} — ${selectedBatch.quantityTons} т`
              : 'Оберіть партію'}
          </Text>
        </TouchableOpacity>

        {selectedBatch ? (
          <Text style={styles.hint}>
            Доступно: {selectedBatch.quantityTons} т ({selectedBatch.grainType})
          </Text>
        ) : null}

        {/* Quantity */}
        <Text style={styles.label}>Кількість (т)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          value={qty}
          onChangeText={setQty}
        />

        {insufficient ? (
          <Text style={styles.errorText}>Недостатньо: доступно лише {available} т</Text>
        ) : null}

        {/* Buyer */}
        <Text style={styles.label}>Покупець</Text>
        <TextInput
          style={styles.input}
          placeholder="Назва покупця"
          placeholderTextColor={colors.textSecondary}
          value={buyer}
          onChangeText={setBuyer}
        />

        {/* Price */}
        <Text style={styles.label}>Ціна за тонну (грн)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor={colors.textSecondary}
          value={price}
          onChangeText={setPrice}
        />

        {qtyNum > 0 && priceNum > 0 ? (
          <Text style={styles.totalText}>Сума: {(qtyNum * priceNum).toLocaleString('uk-UA')} грн</Text>
        ) : null}

        {/* Notes */}
        <Text style={styles.label}>Примітка</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={3}
          placeholder="Необов'язково"
          placeholderTextColor={colors.textSecondary}
          value={notes}
          onChangeText={setNotes}
        />

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitDisabled]}
          disabled={!canSubmit}
          onPress={() => mutation.mutate()}
        >
          {mutation.isPending ? (
            <ActivityIndicator color={colors.textInverse} />
          ) : (
            <Text style={styles.submitText}>Записати відвантаження</Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Batch picker modal (simple inline) */}
      {batchModal ? (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Оберіть партію</Text>
              <TouchableOpacity onPress={() => setBatchModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {(batchesData?.items ?? []).map((b) => (
                <TouchableOpacity
                  key={b.id}
                  style={styles.modalRow}
                  onPress={() => { setSelectedBatch(b); setBatchModal(false); }}
                >
                  <Text style={styles.modalRowText}>
                    {b.grainType} — {b.quantityTons} т
                    {b.ownerName ? ` (${b.ownerName})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
              {(batchesData?.items ?? []).length === 0 ? (
                <Text style={styles.modalEmpty}>Партій не знайдено</Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      ) : null}
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
  hint: { ...typography.caption, color: colors.primary, marginTop: spacing.xs },
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
  errorText: { ...typography.caption, color: colors.error, marginTop: spacing.xs, fontWeight: '600' },
  totalText: { ...typography.label, color: colors.success, marginTop: spacing.xs },
  submitBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { ...typography.label, color: colors.textInverse },
  modalOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '60%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: { ...typography.h3, color: colors.text },
  modalClose: { fontSize: 20, color: colors.textSecondary, padding: spacing.xs },
  modalRow: {
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalRowText: { ...typography.body, color: colors.text },
  modalEmpty: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center', padding: spacing.lg },
});
