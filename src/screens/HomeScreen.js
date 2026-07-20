import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [dashboard, setDashboard] = useState(null);

  const recentBills = dashboard?.recentBills || [];
  const openParticipants = dashboard?.openParticipants || [];

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.profileButton}>
          <Ionicons name="person-circle-outline" size={28} color={theme.text} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const data = await apiRequest('/dashboard');
        setDashboard(data);
      } catch {
        setDashboard(null);
      }
    };

    const unsubscribe = navigation.addListener('focus', loadDashboard);
    return unsubscribe;
  }, [navigation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.statsWrapper}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="arrow-down" size={20} color={theme.error} />
          </View>
          <View>
            <Text style={styles.statLabel}>You Owe</Text>
            <Text style={styles.statAmountNegative}>${Number(dashboard?.summary?.youOwe || 0).toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainerGreen}>
            <Ionicons name="arrow-up" size={20} color={theme.success} />
          </View>
          <View>
            <Text style={styles.statLabel}>Owed to You</Text>
            <Text style={styles.statAmountPositive}>${Number(dashboard?.summary?.owedToYou || 0).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionChips}>
        <TouchableOpacity style={styles.chip} onPress={() => navigation.navigate('ScanReceipt')}>
          <Ionicons name="receipt-outline" size={18} color={theme.primary} />
          <Text style={styles.chipText}>New Bill</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => navigation.navigate('History')}>
          <Ionicons name="time-outline" size={18} color={theme.primary} />
          <Text style={styles.chipText}>History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listCard}>
          {recentBills.map((bill, index) => (
            <View key={bill.id}>
              <TouchableOpacity style={styles.billItem} onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}>
                <View style={styles.billLeft}>
                  <View style={styles.billIconCircle}>
                    <Ionicons name="receipt-outline" size={20} color={theme.primary} />
                  </View>
                  <View style={styles.billDetails}>
                    <Text style={styles.billName}>{bill.title}</Text>
                    <Text style={styles.billSubtext}>{new Date(bill.createdAt).toLocaleDateString()} · {bill.people} people</Text>
                  </View>
                </View>
                <View style={styles.billRight}>
                  <Text style={styles.billAmount}>${Number(bill.total).toFixed(2)}</Text>
                  <Text style={bill.status === 'settled' ? styles.billYourShareGreen : styles.billYourShare}>
                    {bill.status === 'settled' ? 'Settled' : 'Pending'}
                  </Text>
                </View>
              </TouchableOpacity>
              {index < recentBills.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          {recentBills.length === 0 && (
            <Text style={styles.emptyText}>Scan a receipt to create your first bill.</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, styles.sectionInset]}>Open Tabs</Text>
        <View style={styles.listCard}>
          {openParticipants.map((participant, index) => (
            <View key={participant.participantId}>
              <TouchableOpacity style={styles.friendItem} onPress={() => navigation.navigate('BillDetail', { billId: participant.billId })}>
                <View style={styles.friendLeft}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendInitial}>{participant.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View>
                    <Text style={styles.friendName}>{participant.name}</Text>
                    <Text style={styles.billSubtext}>{participant.billTitle}</Text>
                  </View>
                </View>
                <Text style={styles.friendOwesYou}>owes ${Number(participant.amount).toFixed(2)}</Text>
              </TouchableOpacity>
              {index < openParticipants.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
          {openParticipants.length === 0 && (
            <Text style={styles.emptyText}>No open tabs right now.</Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  profileButton: { marginRight: 16 },
  statsWrapper: { marginTop: 24, alignItems: 'center', gap: 12 },
  statCard: {
    width: '85%',
    backgroundColor: theme.card,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.cardDark || theme.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statIconContainerGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.cardAccentDark || theme.cardAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statLabel: { fontSize: 12, color: theme.textTertiary, marginBottom: 4, textTransform: 'uppercase' },
  statAmountNegative: { fontSize: 20, fontWeight: '600', color: theme.error },
  statAmountPositive: { fontSize: 20, fontWeight: '600', color: theme.success },
  actionChips: { flexDirection: 'row', paddingHorizontal: 20, marginVertical: 32, gap: 8 },
  chip: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    gap: 6,
  },
  chipText: { fontSize: 13, color: theme.text, fontWeight: '500' },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  sectionInset: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '600', color: theme.text },
  seeAll: { fontSize: 15, color: theme.primary, fontWeight: '500' },
  listCard: {
    backgroundColor: theme.card,
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  billItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  billLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  billIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: theme.cardAccentDark || theme.cardAccent,
  },
  billDetails: { flex: 1 },
  billName: { fontSize: 16, fontWeight: '500', color: theme.text },
  billSubtext: { fontSize: 13, color: theme.textTertiary },
  billRight: { alignItems: 'flex-end' },
  billAmount: { fontSize: 16, fontWeight: '500', color: theme.text },
  billYourShare: { fontSize: 13, color: theme.textSecondary },
  billYourShareGreen: { fontSize: 13, color: theme.success, fontWeight: '500' },
  divider: { height: 1, backgroundColor: theme.border, marginLeft: 68 },
  friendItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  friendLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  friendInitial: { fontSize: 16, fontWeight: '600', color: '#000' },
  friendName: { fontSize: 16, fontWeight: '500', color: theme.text },
  friendOwesYou: { fontSize: 14, color: theme.success, fontWeight: '500' },
  emptyText: { color: theme.textTertiary, padding: 16, textAlign: 'center' },
});
