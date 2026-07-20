import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{bill.title}</Text>
        <Text style={styles.subtitle}>{bill.splitMode} split · ${Number(bill.total).toFixed(2)}</Text>
        <View style={[styles.statusBadge, settled ? styles.statusPaid : styles.statusPending]}>
          <Text style={styles.statusText}>{settled ? 'Settled' : 'Pending'}</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>People</Text>
        {bill.participants.map((participant) => (
          <View key={participant.id} style={styles.personRow}>
            <View style={styles.personInfo}>
              <Text style={styles.personName}>{participant.name}</Text>
              <Text style={styles.muted}>${Number(participant.amount).toFixed(2)} due</Text>
            </View>
            <TouchableOpacity
              style={[styles.payButton, participant.status === 'paid' && styles.undoButton]}
              onPress={() => setStatus(participant, participant.status === 'paid' ? 'pending' : 'paid')}
            >
              <Ionicons
                name={participant.status === 'paid' ? 'refresh' : 'checkmark'}
                size={18}
                color={participant.status === 'paid' ? theme.text : '#000'}
              />
              <Text style={[styles.payButtonText, participant.status === 'paid' && { color: theme.text }]}>
                {participant.status === 'paid' ? 'Undo' : 'Paid'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Items</Text>
        {bill.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemText}>{item.name}</Text>
            <Text style={styles.itemText}>${Number(item.total).toFixed(2)}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, gap: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.background },
  card: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  title: { color: theme.text, fontSize: 24, fontWeight: '700' },
  subtitle: { color: theme.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  statusBadge: { alignSelf: 'flex-start', marginTop: 12, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 6 },
  statusPaid: { backgroundColor: theme.success },
  statusPending: { backgroundColor: theme.warning },
  statusText: { color: '#000', fontWeight: '700' },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '600', marginBottom: 12 },
  personRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
  personInfo: { flex: 1 },
  personName: { color: theme.text, fontSize: 16, fontWeight: '600' },
  muted: { color: theme.textSecondary },
  payButton: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  undoButton: { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 },
  payButtonText: { color: '#000', fontWeight: '700' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  itemText: { color: theme.text },
});
