import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { Divider, formatCurrency, PrimaryButton } from '../components/FinanceUI';

function money(value) {
  return String(value ?? 0);
}

export default function ReceiptReviewScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState(route.params.receiptDraft);

  const subtotal = useMemo(
    () => draft.items.reduce((sum, item) => sum + Number(item.total || 0), 0),
    [draft.items]
  );
  const total = Number(subtotal) + Number(draft.tax || 0) + Number(draft.tip || 0) + Number(draft.fees || 0);

  const updateItem = (index, field, value) => {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      )),
    }));
  };

  const continueToSplit = async () => {
    try {
      setSaving(true);
      const data = await apiRequest(`/receipt-drafts/${draft.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          merchant: draft.merchant,
          receiptDate: draft.receiptDate,
          subtotal,
          tax: Number(draft.tax || 0),
          tip: Number(draft.tip || 0),
          fees: Number(draft.fees || 0),
          total,
          items: draft.items.map((item) => ({
            id: item.id,
            name: item.name,
            quantity: Number(item.quantity || 1),
            unit: Number(item.unit || item.total || 0),
            total: Number(item.total || 0),
          })),
        }),
      });
      navigation.navigate('Participants', { receiptDraft: data.receiptDraft });
    } catch (error) {
      Alert.alert('Could not save receipt', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Review scan</Text>
          <TextInput
            style={styles.merchantInput}
            value={draft.merchant}
            onChangeText={(merchant) => setDraft((current) => ({ ...current, merchant }))}
          />
          <Text style={styles.meta}>Confidence {Math.round((draft.confidence || 0) * 100)}%</Text>
        </View>

        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Text style={styles.sectionTitle}>Items</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setDraft((current) => ({
                ...current,
                items: [...current.items, { name: '', quantity: 1, unit: 0, total: 0 }],
              }))}
            >
              <Ionicons name="add" size={18} color="#000" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {draft.items.map((item, index) => (
            <View key={item.id || index}>
              <View style={styles.itemRow}>
                <TextInput
                  style={styles.itemName}
                  placeholder="Item name"
                  placeholderTextColor={theme.textTertiary}
                  value={item.name}
                  onChangeText={(value) => updateItem(index, 'name', value)}
                />
                <TextInput
                  style={styles.itemAmount}
                  keyboardType="decimal-pad"
                  value={money(item.total)}
                  onChangeText={(value) => {
                    updateItem(index, 'total', value);
                    updateItem(index, 'unit', value);
                  }}
                />
              </View>
              {index < draft.items.length - 1 && <Divider inset={0} />}
            </View>
          ))}
        </View>

        <View style={styles.totalsCard}>
          {[
            ['Subtotal', subtotal, null],
            ['Tax', draft.tax, 'tax'],
            ['Tip', draft.tip, 'tip'],
            ['Fees', draft.fees, 'fees'],
          ].map(([label, value, field]) => (
            <View key={label} style={styles.totalRow}>
              <Text style={styles.totalLabel}>{label}</Text>
              {field ? (
                <TextInput
                  style={styles.totalInput}
                  keyboardType="decimal-pad"
                  value={money(value)}
                  onChangeText={(text) => setDraft((current) => ({ ...current, [field]: text }))}
                />
              ) : (
                <Text style={styles.totalValue}>{formatCurrency(value)}</Text>
              )}
            </View>
          ))}
          <View style={styles.grandTotal}>
            <Text style={styles.grandTotalText}>Total</Text>
            <Text style={styles.grandTotalAmount}>{formatCurrency(total)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Confirm receipt" icon="checkmark" onPress={continueToSplit} loading={saving} />
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 112 },
  header: { marginBottom: 18 },
  kicker: { color: theme.textTertiary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  merchantInput: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  meta: { color: theme.textSecondary, marginTop: 8 },
  receiptCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  receiptHeader: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  sectionTitle: { color: theme.text, fontSize: 15, fontWeight: '800', textTransform: 'uppercase' },
  addButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addButtonText: { color: '#000', fontWeight: '800' },
  itemRow: { minHeight: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 12 },
  itemName: { flex: 1, color: theme.text, fontSize: 16, fontWeight: '700' },
  itemAmount: {
    width: 92,
    color: theme.text,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '800',
    backgroundColor: theme.inputBackground,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 42,
  },
  totalsCard: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 16,
  },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  totalLabel: { color: theme.textSecondary, fontSize: 15, fontWeight: '700' },
  totalValue: { color: theme.text, fontSize: 15, fontWeight: '800' },
  totalInput: {
    width: 92,
    minHeight: 40,
    color: theme.text,
    textAlign: 'right',
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    backgroundColor: theme.inputBackground,
    paddingHorizontal: 10,
    fontWeight: '800',
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.divider,
    paddingTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  grandTotalText: { color: theme.text, fontSize: 18, fontWeight: '800' },
  grandTotalAmount: { color: theme.text, fontSize: 24, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
