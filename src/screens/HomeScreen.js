import React, { useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        >
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={theme.text}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Centered Quick Stats */}
      <View style={styles.statsWrapper}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statIconContainer}>
                <Ionicons name="arrow-down" size={20} color={theme.error} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>You Owe</Text>
                <Text style={styles.statAmountNegative}>
                  {/* placeholder */}
                  $45.50
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statRow}>
              <View style={styles.statIconContainerGreen}>
                <Ionicons name="arrow-up" size={20} color={theme.success} />
              </View>
              <View style={styles.statInfo}>
                <Text style={styles.statLabel}>Owed to You</Text>
                <Text style={styles.statAmountPositive}>$30.00</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Action Chips */}
      <View style={styles.actionChips}>
        <TouchableOpacity style={styles.chip}>
          <Ionicons name="people-outline" size={18} color={theme.primary} />
          <Text style={styles.chipText}>Split</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chip}>
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={theme.primary}
          />
          <Text style={styles.chipText}>Settle</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chip}>
          <Ionicons name="receipt-outline" size={18} color={theme.primary} />
          <Text style={styles.chipText}>New Bill</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.billsList}>
          {[
            {
              icon: 'restaurant',
              title: 'Dinner at Restaurant',
              meta: 'Jan 5 • 4 people',
              total: '$75.00',
              share: 'You: $18.75',
            },
            {
              icon: 'film',
              title: 'Movie Tickets',
              meta: 'Jan 3 • 3 people',
              total: '$60.00',
              share: '+$20.00',
              positive: true,
            },
            {
              icon: 'cart',
              title: 'Groceries',
              meta: 'Dec 28 • 2 people',
              total: '$85.30',
              share: 'You: $42.65',
            },
            {
              icon: 'home',
              title: 'Utilities',
              meta: 'Dec 20 • 3 people',
              total: '$150.00',
              share: 'You: $50.00',
            },
          ].map((item, index) => (
            <View key={index}>
              <TouchableOpacity style={styles.billItem}>
                <View style={styles.billLeft}>
                  <View
                    style={[
                      styles.billIconCircle,
                      { backgroundColor: theme.cardAccentDark },
                    ]}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <View style={styles.billDetails}>
                    <Text style={styles.billName}>{item.title}</Text>
                    <Text style={styles.billSubtext}>{item.meta}</Text>
                  </View>
                </View>

                <View style={styles.billRight}>
                  <Text style={styles.billAmount}>{item.total}</Text>
                  <Text
                    style={
                      item.positive
                        ? styles.billYourShareGreen
                        : styles.billYourShare
                    }
                  >
                    {item.share}
                  </Text>
                </View>
              </TouchableOpacity>

              {index < 3 && <View style={styles.billDivider} />}
            </View>
          ))}
        </View>
      </View>

      {/* Friends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Friends</Text>

        <View style={styles.friendsList}>
          {[
            { name: 'Sarah Johnson', initial: 'S', text: 'owes you $25.00', pos: true },
            { name: 'Mike Chen', initial: 'M', text: 'you owe $15.50' },
            { name: 'Alex Kim', initial: 'A', text: 'owes you $5.00', pos: true },
          ].map((friend, index) => (
            <View key={index}>
              <TouchableOpacity style={styles.friendItem}>
                <View style={styles.friendLeft}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendInitial}>{friend.initial}</Text>
                  </View>
                  <Text style={styles.friendName}>{friend.name}</Text>
                </View>
                <Text
                  style={friend.pos ? styles.friendOwesYou : styles.friendYouOwe}
                >
                  {friend.text}
                </Text>
              </TouchableOpacity>

              {index < 2 && <View style={styles.billDivider} />}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },

    profileButton: {
      marginRight: 16,
    },

    /* ===== Stats ===== */
    statsWrapper: {
      marginTop: 24,
      alignItems: 'center',
    },
    statsContainer: {
      width: '100%',
      alignItems: 'center',
      gap: 12,
    },
    statCard: {
      width: '85%',
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.cardDark,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statIconContainerGreen: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.cardAccentDark,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    statInfo: { flex: 1 },
    statLabel: {
      fontSize: 12,
      color: theme.textTertiary,
      marginBottom: 4,
      textTransform: 'uppercase',
    },
    statAmountNegative: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.error,
    },
    statAmountPositive: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.success,
    },

    /* ===== Chips ===== */
    actionChips: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      marginVertical: 32,
      gap: 8,
    },
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
    chipText: {
      fontSize: 13,
      color: theme.text,
      fontWeight: '500',
    },

    /* ===== Sections ===== */
    section: {
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '600',
      color: theme.text,
    },
    seeAll: {
      fontSize: 15,
      color: theme.primary,
      fontWeight: '500',
    },

    /* ===== Lists ===== */
    billsList: {
      backgroundColor: theme.card,
      marginHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    billItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    billLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    billIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    billDetails: { flex: 1 },
    billName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    billSubtext: {
      fontSize: 13,
      color: theme.textTertiary,
    },
    billRight: { alignItems: 'flex-end' },
    billAmount: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    billYourShare: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    billYourShareGreen: {
      fontSize: 13,
      color: theme.success,
      fontWeight: '500',
    },
    billDivider: {
      height: 1,
      backgroundColor: theme.border,
      marginLeft: 68,
    },

    /* ===== Friends ===== */
    friendsList: {
      backgroundColor: theme.card,
      marginHorizontal: 20,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    friendItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
    },
    friendLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    friendAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    friendInitial: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000',
    },
    friendName: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.text,
    },
    friendOwesYou: {
      fontSize: 14,
      color: theme.success,
      fontWeight: '500',
    },
    friendYouOwe: {
      fontSize: 14,
      color: theme.error,
      fontWeight: '500',
    },
  });
