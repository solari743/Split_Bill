import React, { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { Divider, formatCurrency, MoneyText, Row, Section, StatusBadge } from '../components/FinanceUI';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const [dashboard, setDashboard] = useState(null);

  const recentBills = dashboard?.recentBills || [];
  const openParticipants = dashboard?.openParticipants || [];
  const netBalance = Number(dashboard?.summary?.owedToYou || 0) - Number(dashboard?.summary?.youOwe || 0);

  const summaryLabel = useMemo(() => {
    if (netBalance > 0) return 'Net owed to you';
    if (netBalance < 0) return 'Net you owe';
    return 'All settled';
  }, [netBalance]);

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>Split Bill</Text>
        <Text style={styles.balanceLabel}>{summaryLabel}</Text>
        <MoneyText value={Math.abs(netBalance)} positive={netBalance > 0} negative={netBalance < 0} large />
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Open tabs</Text>
            <Text style={styles.metricValue}>{dashboard?.summary?.openTabs || 0}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Owed to you</Text>
            <Text style={[styles.metricValue, styles.positive]}>{formatCurrency(dashboard?.summary?.owedToYou)}</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>You owe</Text>
            <Text style={[styles.metricValue, styles.negative]}>{formatCurrency(dashboard?.summary?.youOwe)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('ScanReceipt')}>
          <Ionicons name="scan-outline" size={20} color="#000" />
          <Text style={styles.actionButtonText}>Scan receipt</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryAction} onPress={() => navigation.navigate('History')}>
          <Ionicons name="time-outline" size={20} color={theme.text} />
          <Text style={styles.secondaryActionText}>History</Text>
        </TouchableOpacity>
      </View>

      <Section
        title="Recent Activity"
        action={recentBills.length > 0 && (
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.linkText}>See all</Text>
          </TouchableOpacity>
        )}
      >
        {recentBills.map((bill, index) => (
          <View key={bill.id}>
            <Row
              icon="receipt-outline"
              title={bill.title}
              subtitle={`${new Date(bill.createdAt).toLocaleDateString()} - ${bill.people} people`}
              onPress={() => navigation.navigate('BillDetail', { billId: bill.id })}
              right={(
                <>
                  <Text style={styles.rowAmount}>{formatCurrency(bill.total)}</Text>
                  <StatusBadge status={bill.status} />
                </>
              )}
            />
            {index < recentBills.length - 1 && <Divider />}
          </View>
        ))}
        {recentBills.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={24} color={theme.textTertiary} />
            <Text style={styles.emptyTitle}>No bills yet</Text>
            <Text style={styles.emptyText}>Scan a receipt to start tracking who owes what.</Text>
          </View>
        )}
      </Section>

      <Section title="Open Tabs">
        {openParticipants.map((participant, index) => (
          <View key={participant.participantId}>
            <Row
              title={participant.name}
              subtitle={participant.billTitle}
              onPress={() => navigation.navigate('BillDetail', { billId: participant.billId })}
              right={<Text style={styles.positiveAmount}>{formatCurrency(participant.amount)}</Text>}
            />
            {index < openParticipants.length - 1 && <Divider />}
          </View>
        ))}
        {openParticipants.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="checkmark-circle-outline" size={24} color={theme.success} />
            <Text style={styles.emptyTitle}>Nothing pending</Text>
            <Text style={styles.emptyText}>You are clear for now.</Text>
          </View>
        )}
      </Section>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingTop: 18, paddingBottom: 28 },
  profileButton: { marginRight: 16 },
  hero: { paddingHorizontal: 20, paddingBottom: 18 },
  kicker: { color: theme.textTertiary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  balanceLabel: { color: theme.textSecondary, fontSize: 15, marginTop: 16, marginBottom: 4 },
  metrics: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    borderRadius: 8,
    flexDirection: 'row',
    paddingVertical: 14,
  },
  metric: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  metricDivider: { width: 1, backgroundColor: theme.divider },
  metricLabel: { color: theme.textTertiary, fontSize: 12, marginBottom: 5 },
  metricValue: { color: theme.text, fontSize: 15, fontWeight: '800' },
  positive: { color: theme.success },
  negative: { color: theme.error },
  actions: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, marginBottom: 28 },
  actionButton: {
    flex: 1,
    minHeight: 52,
    backgroundColor: theme.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  actionButtonText: { color: '#000', fontWeight: '800', fontSize: 15 },
  secondaryAction: {
    width: 116,
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionText: { color: theme.text, fontWeight: '800', fontSize: 15 },
  linkText: { color: theme.primary, fontWeight: '800' },
  rowAmount: { color: theme.text, fontWeight: '800', marginBottom: 6 },
  positiveAmount: { color: theme.success, fontWeight: '800', fontSize: 16 },
  emptyState: { alignItems: 'center', padding: 24 },
  emptyTitle: { color: theme.text, fontWeight: '800', marginTop: 8 },
  emptyText: { color: theme.textTertiary, textAlign: 'center', marginTop: 4 },
});
