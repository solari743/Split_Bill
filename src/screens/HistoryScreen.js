import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function HistoryScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    const loadBills = async () => {
      try {
        const data = await apiRequest('/bills');
        setBills(data.bills);
      } catch {
        setBills([]);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadBills);
    return unsubscribe;
  }, [navigation]);

  const totalSpent = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);

  const renderBill = ({ item }) => {
    const settled = item.participants.every((participant) => participant.status === 'paid');
    return (
      <TouchableOpacity style={styles.billCard} onPress={() => navigation.navigate('BillDetail', { billId: item.id })}>
        <View style={styles.billIcon}>
          <Ionicons name="receipt-outline" size={24} color={theme.primary} />
        </View>
        <View style={styles.billInfo}>
          <Text style={styles.billName}>{item.title}</Text>
          <Text style={styles.billDate}>{new Date(item.createdAt).toLocaleDateString()} · {item.participants.length} people</Text>
        </View>
        <View style={styles.billAmount}>
          <Text style={styles.billTotal}>${Number(item.total).toFixed(2)}</Text>
          <View style={[styles.statusBadge, settled ? styles.statusSettled : styles.statusPending]}>
            <Text style={[styles.statusText, settled ? styles.statusTextSettled : styles.statusTextPending]}>
              {settled ? 'Settled' : 'Pending'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Bills</Text>
          <Text style={styles.summaryValue}>{bills.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Tracked</Text>
          <Text style={styles.summaryValue}>${totalSpent.toFixed(2)}</Text>
        </View>
      </View>

      <FlatList
        data={bills}
        renderItem={renderBill}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>No bills yet.</Text>}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    margin: 16,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: theme.border },
  summaryLabel: { fontSize: 14, color: theme.textTertiary, marginBottom: 8 },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: theme.text },
  listContainer: { padding: 16, paddingTop: 0 },
  billCard: {
    backgroundColor: theme.card,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  billIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.cardAccentDark || theme.cardAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billInfo: { flex: 1, justifyContent: 'center' },
  billName: { fontSize: 16, fontWeight: '600', color: theme.text, marginBottom: 4 },
  billDate: { fontSize: 14, color: theme.textTertiary },
  billAmount: { alignItems: 'flex-end', justifyContent: 'center' },
  billTotal: { fontSize: 16, fontWeight: 'bold', color: theme.text, marginBottom: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusSettled: { backgroundColor: '#e8f5e9' },
  statusPending: { backgroundColor: '#fff3e0' },
  statusText: { fontSize: 12, fontWeight: '600' },
  statusTextSettled: { color: '#2e7d32' },
  statusTextPending: { color: '#f57c00' },
  emptyText: { color: theme.textTertiary, textAlign: 'center', marginTop: 32 },
});
