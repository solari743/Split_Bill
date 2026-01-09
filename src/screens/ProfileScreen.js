import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color={theme.primary} />
        </View>
        <Text style={styles.name}>John Doe</Text>
        <Text style={styles.email}>john.doe@email.com</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={24}
              color={theme.textSecondary}
            />
            <Text style={styles.settingText}>Dark Mode</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: '#d1d1d6', true: theme.primaryLight }}
            thumbColor={isDark ? theme.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>

        <TouchableOpacity style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons name="cash-outline" size={24} color={theme.textSecondary} />
            <Text style={styles.settingText}>Currency</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>USD</Text>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </View>
        </TouchableOpacity>

        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={theme.textSecondary}
            />
            <Text style={styles.settingText}>Notifications</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#d1d1d6', true: theme.primaryLight }}
            thumbColor={notificationsEnabled ? theme.primary : '#f4f3f4'}
          />
        </View>
      </View>

      {/* Payment Methods */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Methods</Text>

        {['Venmo', 'PayPal'].map((method) => (
          <TouchableOpacity key={method} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="card-outline" size={24} color={theme.textSecondary} />
              <Text style={styles.settingText}>{method}</Text>
            </View>
            <View style={styles.settingRight}>
              <Text style={[styles.settingValue, { color: theme.primary }]}>
                Link
              </Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textTertiary}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Data & Privacy */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Privacy</Text>

        {['Export Data', 'Privacy Policy'].map((item) => (
          <TouchableOpacity key={item} style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons
                name="shield-outline"
                size={24}
                color={theme.textSecondary}
              />
              <Text style={styles.settingText}>{item}</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textTertiary}
            />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  profileHeader: {
    backgroundColor: theme.card,
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.cardAccent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.textTertiary,
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  editButtonText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    backgroundColor: theme.card,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textTertiary,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.background,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: theme.text,
    marginLeft: 12,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: theme.textTertiary,
    marginRight: 8,
  },
  bottomSpacing: {
    height: 40,
  },

  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.error,
  },
  logoutButtonText: {
    color: theme.error,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 40,
  },
});
