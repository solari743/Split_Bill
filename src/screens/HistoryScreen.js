import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HistoryScreen() {
  const bills = [
    {
      id: '1',
      name: 'Pizza Night',
      date: 'Jan 5, 2026',
      amount: 48.50,
      people: 4,
      status: 'settled',
      category: 'restaurant',
    },
    {
      id: '2',
      name: 'Movie Tickets',
      date: 'Jan 3, 2026',
      amount: 60.00,
      people: 3,
      status: 'pending',
      category: 'film',
    },
    {
      id: '3',
      name: 'Utilities - December',
      date: 'Dec 28, 2025',
      amount: 150.00,
      people: 2,
      status: 'settled',
      category: 'home',
    },
    {
      id: '4',
      name: 'Groceries',
      date: 'Dec 20, 2025',
      amount: 85.30,
      people: 3,
      status: 'settled',
      category: 'cart',
    },
  ];

  const renderBill = ({ item }) => (
    <TouchableOpacity style={styles.billCard}>
      <View style={styles.billIcon}>
        <Ionicons name={item.category} size={24} color="#6200ee" />
      </View>
      <View style={styles.billInfo}>
        <Text style={styles.billName}>{item.name}</Text>
        <Text style={styles.billDate}>
          {item.date} • {item.people} people
        </Text>
      </View>
      <View style={styles.billAmount}>
        <Text style={styles.billTotal}>${item.amount.toFixed(2)}</Text>
        <View
          style={[
            styles.statusBadge,
            item.status === 'settled' ? styles.statusSettled : styles.statusPending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              item.status === 'settled' ? styles.statusTextSettled : styles.statusTextPending,
            ]}
          >
            {item.status === 'settled' ? '✓ Settled' : '⏳ Pending'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>All</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterText}>2026</Text>
          <Ionicons name="chevron-down" size={16} color="#666" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name="search" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Summary Stats */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Bills</Text>
          <Text style={styles.summaryValue}>{bills.length}</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Spent</Text>
          <Text style={styles.summaryValue}>
            ${bills.reduce((sum, bill) => sum + bill.amount, 0).toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Bills List */}
      <FlatList
        data={bills}
        renderItem={renderBill}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  filterBar: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    marginRight: 4,
  },
  iconButton: {
    padding: 8,
    marginLeft: 'auto',
  },
  summaryCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
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
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusSettled: {
    backgroundColor: '#e8f5e9',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextSettled: {
    color: '#2e7d32',
  },
  statusTextPending: {
    color: '#f57c00',
  },
});
