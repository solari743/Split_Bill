import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Divider, Row, Section } from '../components/FinanceUI';

export default function ProfileScreen() {
  const { theme, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const styles = createStyles(theme);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name || user?.email || 'S').charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerText}>
          <Text style={styles.name}>{user?.name || 'Split Bill User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <Section title="Appearance">
        <Row
          icon={isDark ? 'moon-outline' : 'sunny-outline'}
          title="Dark mode"
          subtitle={isDark ? 'Dark finance theme' : 'Light finance theme'}
          right={(
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={isDark ? theme.primary : '#ffffff'}
            />
          )}
        />
      </Section>

      <Section title="Preferences">
        <Row icon="cash-outline" title="Currency" subtitle="United States Dollar" right={<Text style={styles.settingValue}>USD</Text>} />
        <Divider />
        <Row
          icon="notifications-outline"
          title="Notifications"
          subtitle="Payment reminders and tab updates"
          right={(
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: theme.border, true: theme.primaryLight }}
              thumbColor={notificationsEnabled ? theme.primary : '#ffffff'}
            />
          )}
        />
      </Section>

      <Section title="Payment Methods">
        {['Zelle', 'Venmo', 'PayPal'].map((method, index, arr) => (
          <View key={method}>
            <Row icon="card-outline" title={method} subtitle="Not linked for demo" right={<Text style={styles.linkText}>Link</Text>} />
            {index < arr.length - 1 && <Divider />}
          </View>
        ))}
      </Section>

      <Section title="Data & Privacy">
        {['Export Data', 'Privacy Policy'].map((item, index, arr) => (
          <View key={item}>
            <Row icon="shield-checkmark-outline" title={item} subtitle="Demo account controls" right={<Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />} />
            {index < arr.length - 1 && <Divider />}
          </View>
        ))}
      </Section>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={18} color={theme.error} />
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingTop: 22, paddingBottom: 36 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 26 },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: { color: '#000', fontSize: 24, fontWeight: '800' },
  headerText: { flex: 1, minWidth: 0 },
  name: { color: theme.text, fontSize: 22, fontWeight: '800' },
  email: { color: theme.textTertiary, marginTop: 4 },
  settingValue: { color: theme.textSecondary, fontWeight: '800' },
  linkText: { color: theme.primary, fontWeight: '800' },
  logoutButton: {
    marginHorizontal: 20,
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.error,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.card,
  },
  logoutButtonText: { color: theme.error, fontSize: 16, fontWeight: '800' },
});
