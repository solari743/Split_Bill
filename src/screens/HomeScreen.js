import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Quick Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>This Month</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>You Owe</Text>
              <Text style={styles.statAmount}>$45.50</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Owed to You</Text>
              <Text style={styles.statAmountPositive}>$30.00</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('ScanReceipt')}
          >
            <Ionicons name="camera" size={24} color="#fff" />
            <Text style={styles.actionButtonText}>Scan Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonSecondary}>
            <Ionicons name="people" size={24} color="#6200ee" />
            <Text style={styles.actionButtonTextSecondary}>Split with Friends</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Bills */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Bills</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Bill Card Example */}
          <TouchableOpacity style={styles.billCard}>
            <View style={styles.billIcon}>
              <Ionicons name="restaurant" size={24} color="#6200ee" />
            </View>
            <View style={styles.billInfo}>
              <Text style={styles.billName}>Dinner at Restaurant</Text>
              <Text style={styles.billDate}>Jan 5, 2026 • 4 people</Text>
            </View>
            <View style={styles.billAmount}>
              <Text style={styles.billTotal}>$75.00</Text>
              <Text style={styles.billStatus}>Pending</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.billCard}>
            <View style={styles.billIcon}>
              <Ionicons name="film" size={24} color="#6200ee" />
            </View>
            <View style={styles.billInfo}>
              <Text style={styles.billName}>Movie Tickets</Text>
              <Text style={styles.billDate}>Jan 3, 2026 • 3 people</Text>
            </View>
            <View style={styles.billAmount}>
              <Text style={styles.billTotal}>$60.00</Text>
              <Text style={styles.billStatusSettled}>Settled</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  statAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff3b30',
  },
  statAmountPositive: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34c759',
  },
  quickActions: {
    marginBottom: 24,
  },
  actionButton: {
    backgroundColor: '#6200ee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  actionButtonSecondary: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#6200ee',
  },
  actionButtonTextSecondary: {
    color: '#6200ee',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '600',
  },
  billCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  billIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0e6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  billInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  billName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  billDate: {
    fontSize: 14,
    color: '#999',
  },
  billAmount: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  billTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  billStatus: {
    fontSize: 12,
    color: '#ff9500',
    fontWeight: '600',
  },
  billStatusSettled: {
    fontSize: 12,
    color: '#34c759',
    fontWeight: '600',
  },
});
