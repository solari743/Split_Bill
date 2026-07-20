import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';

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
      const total = Number(subtotal) + Number(draft.tax || 0) + Number(draft.tip || 0) + Number(draft.fees || 0);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.label}>Merchant</Text>
        <TextInput
          style={styles.input}
          value={draft.merchant}
          onChangeText={(merchant) => setDraft((current) => ({ ...current, merchant }))}
        />
        <Text style={styles.confidence}>Scan confidence: {Math.round((draft.confidence || 0) * 100)}%</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Items</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setDraft((current) => ({
              ...current,
              items: [...current.items, { name: '', quantity: 1, unit: 0, total: 0 }],
            }))}
          >
            <Ionicons name="add" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {draft.items.map((item, index) => (
          <View key={item.id || index} style={styles.itemRow}>
            <TextInput
              style={[styles.input, styles.itemName]}
              placeholder="Item name"
              placeholderTextColor={theme.textTertiary}
              value={item.name}
              onChangeText={(value) => updateItem(index, 'name', value)}
            />
            <TextInput
              style={[styles.input, styles.moneyInput]}
              keyboardType="decimal-pad"
              value={money(item.total)}
              onChangeText={(value) => {
                updateItem(index, 'total', value);
                updateItem(index, 'unit', value);
              }}
            />
          </View>
        ))}
      </View>

      <View style={styles.card}>
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
                style={[styles.input, styles.moneyInput]}
                keyboardType="decimal-pad"
                value={money(value)}
                onChangeText={(text) => setDraft((current) => ({ ...current, [field]: text }))}
              />
            ) : (
              <Text style={styles.totalValue}>${Number(value).toFixed(2)}</Text>
            )}
          </View>
        ))}
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalText}>Total</Text>
          <Text style={styles.grandTotalText}>
            ${(Number(subtotal) + Number(draft.tax || 0) + Number(draft.tip || 0) + Number(draft.fees || 0)).toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={continueToSplit} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Saving...' : 'Confirm Receipt'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  label: { color: theme.textTertiary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase' },
  input: {
    minHeight: 44,
    color: theme.text,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
  },
  confidence: { marginTop: 8, color: theme.textSecondary },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '600' },
  iconButton: { padding: 8 },
  itemRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  itemName: { flex: 1 },
  moneyInput: { width: 96, textAlign: 'right' },
  totalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  totalLabel: { color: theme.text, fontSize: 16 },
  totalValue: { color: theme.text, fontSize: 16, fontWeight: '600' },
  grandTotal: {
    borderTopColor: theme.border,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  grandTotalText: { color: theme.text, fontSize: 20, fontWeight: '700' },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  primaryButtonText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
