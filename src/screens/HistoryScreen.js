import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, StatusBadge } from '../components/FinanceUI';

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

  const totalTracked = bills.reduce((sum, bill) => sum + Number(bill.total || 0), 0);
  const openBills = bills.filter((bill) => bill.participants.some((participant) => participant.status !== 'paid')).length;

  const renderBill = ({ item }) => {
    const settled = item.participants.every((participant) => participant.status === 'paid');
    return (
      <TouchableOpacity style={styles.billRow} onPress={() => navigation.navigate('BillDetail', { billId: item.id })}>
        <View style={styles.iconCircle}>
          <Ionicons name="receipt-outline" size={20} color={theme.primary} />
        </View>
        <View style={styles.billInfo}>
          <Text style={styles.billName} numberOfLines={1}>{item.title}</Text>
          <Text style={styles.billMeta}>{new Date(item.createdAt).toLocaleDateString()} - {item.participants.length} people</Text>
        </View>
        <View style={styles.billRight}>
          <Text style={styles.billTotal}>{formatCurrency(item.total)}</Text>
          <StatusBadge status={settled ? 'settled' : 'pending'} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.summary}>
        <View>
          <Text style={styles.summaryLabel}>Total tracked</Text>
          <Text style={styles.summaryValue}>{formatCurrency(totalTracked)}</Text>
        </View>
        <View style={styles.summaryPill}>
          <Text style={styles.summaryPillText}>{openBills} open</Text>
        </View>
      </View>

      <FlatList
        data={bills}
        renderItem={renderBill}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={(
          <View style={styles.emptyState}>
            <Ionicons name="archive-outline" size={26} color={theme.textTertiary} />
            <Text style={styles.emptyTitle}>No history yet</Text>
            <Text style={styles.emptyText}>Confirmed bills will appear here.</Text>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  summary: {
    margin: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: { color: theme.textTertiary, fontSize: 13, fontWeight: '700', textTransform: 'uppercase' },
  summaryValue: { color: theme.text, fontSize: 30, fontWeight: '800', marginTop: 4 },
  summaryPill: { backgroundColor: theme.cardAccentDark || theme.cardAccent, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 7 },
  summaryPillText: { color: theme.primary, fontWeight: '800' },
  listContainer: { marginHorizontal: 20, paddingBottom: 28, borderRadius: 8, overflow: 'hidden' },
  billRow: {
    minHeight: 74,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  separator: { height: 1, backgroundColor: theme.divider, marginHorizontal: 20 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.cardAccentDark || theme.cardAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  billInfo: { flex: 1, minWidth: 0 },
  billName: { color: theme.text, fontSize: 16, fontWeight: '800' },
  billMeta: { color: theme.textTertiary, fontSize: 13, marginTop: 3 },
  billRight: { alignItems: 'flex-end', marginLeft: 10 },
  billTotal: { color: theme.text, fontWeight: '800', marginBottom: 6 },
  emptyState: {
    alignItems: 'center',
    padding: 28,
    backgroundColor: theme.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyTitle: { color: theme.text, fontWeight: '800', marginTop: 8 },
  emptyText: { color: theme.textTertiary, marginTop: 4 },
});
