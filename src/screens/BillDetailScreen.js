import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { Divider, formatCurrency, Row, Section, StatusBadge } from '../components/FinanceUI';

export default function BillDetailScreen({ route }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [bill, setBill] = useState(route.params.bill || null);

  useEffect(() => {
    const load = async () => {
      if (!bill && route.params.billId) {
        const data = await apiRequest(`/bills/${route.params.billId}`);
        setBill(data.bill);
      }
    };
    load();
  }, [route.params.billId]);

  const setStatus = async (participant, status) => {
    try {
      const data = await apiRequest(`/bills/${bill.id}/participants/${participant.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setBill(data.bill);
    } catch (error) {
      Alert.alert('Could not update status', error.message);
    }
  };

  if (!bill) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>Loading bill...</Text>
      </View>
    );
  }

  const settled = bill.participants.every((participant) => participant.status === 'paid');
  const pendingTotal = bill.participants
    .filter((participant) => participant.status !== 'paid')
    .reduce((sum, participant) => sum + Number(participant.amount || 0), 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>{bill.splitMode} split</Text>
        <Text style={styles.title}>{bill.title}</Text>
        <Text style={styles.total}>{formatCurrency(bill.total)}</Text>
        <View style={styles.heroMeta}>
          <StatusBadge status={settled ? 'settled' : 'pending'} />
          <Text style={styles.muted}>{formatCurrency(pendingTotal)} outstanding</Text>
        </View>
      </View>

      <Section title="Settlement">
        {bill.participants.map((participant, index) => (
          <View key={participant.id}>
            <Row
              title={participant.name}
              subtitle={`${formatCurrency(participant.amount)} due`}
              right={(
                <TouchableOpacity
                  style={[styles.statusButton, participant.status === 'paid' && styles.undoButton]}
                  onPress={() => setStatus(participant, participant.status === 'paid' ? 'pending' : 'paid')}
                >
                  <Ionicons
                    name={participant.status === 'paid' ? 'refresh' : 'checkmark'}
                    size={17}
                    color={participant.status === 'paid' ? theme.text : '#000'}
                  />
                  <Text style={[styles.statusButtonText, participant.status === 'paid' && { color: theme.text }]}>
                    {participant.status === 'paid' ? 'Undo' : 'Paid'}
                  </Text>
                </TouchableOpacity>
              )}
            />
            {index < bill.participants.length - 1 && <Divider />}
          </View>
        ))}
      </Section>

      <Section title="Receipt Items">
        {bill.items.map((item, index) => (
          <View key={item.id}>
            <Row
              title={item.name}
              subtitle={`Qty ${item.quantity}`}
              right={<Text style={styles.itemAmount}>{formatCurrency(item.total)}</Text>}
            />
            {index < bill.items.length - 1 && <Divider />}
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingTop: 20, paddingBottom: 30 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  hero: { paddingHorizontal: 20, paddingBottom: 20 },
  kicker: { color: theme.textTertiary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: theme.text, fontSize: 26, fontWeight: '800', marginTop: 8 },
  total: { color: theme.text, fontSize: 36, fontWeight: '800', marginTop: 4 },
  heroMeta: { marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  muted: { color: theme.textSecondary },
  statusButton: {
    minHeight: 38,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: theme.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  undoButton: { backgroundColor: theme.cardDark, borderColor: theme.border, borderWidth: 1 },
  statusButtonText: { color: '#000', fontWeight: '800' },
  itemAmount: { color: theme.text, fontSize: 16, fontWeight: '800' },
});
