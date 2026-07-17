import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

export function Screen({ children, style }) {
  const { theme } = useTheme();
  return <View style={[{ flex: 1, backgroundColor: theme.background }, style]}>{children}</View>;
}

export function Section({ title, action, children, inset = true }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.section}>
      {(title || action) && (
        <View style={[styles.sectionHeader, inset && styles.horizontalInset]}>
          {title ? <Text style={styles.sectionTitle}>{title}</Text> : <View />}
          {action}
        </View>
      )}
      <View style={[styles.group, inset && styles.groupInset]}>{children}</View>
    </View>
  );
}

export function MoneyText({ value, positive, negative, large }) {
  const { theme } = useTheme();
  const color = positive ? theme.success : negative ? theme.error : theme.text;
  return (
    <Text style={{ color, fontSize: large ? 34 : 17, fontWeight: large ? '800' : '700' }}>
      {formatCurrency(value)}
    </Text>
  );
}

export function StatusBadge({ status }) {
  const { theme } = useTheme();
  const normalized = String(status || '').toLowerCase();
  const settled = normalized === 'paid' || normalized === 'settled';
  const pending = normalized === 'pending';
  const backgroundColor = settled
    ? theme.badgeSuccessBackground
    : pending
      ? theme.badgeWarningBackground
      : theme.cardDark;
  const color = settled
    ? theme.badgeSuccessText
    : pending
      ? theme.badgeWarningText
      : theme.textSecondary;

  return (
    <View style={[createStyles(theme).badge, { backgroundColor }]}>
      <Text style={[createStyles(theme).badgeText, { color }]}>
        {settled ? 'Settled' : pending ? 'Pending' : status}
      </Text>
    </View>
  );
}

export function PrimaryButton({ label, icon, loading, disabled, onPress, style }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      style={[styles.primaryButton, disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.86}
    >
      {loading ? (
        <ActivityIndicator color="#000" />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color="#000" />}
          <Text style={styles.primaryButtonText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

export function SecondaryButton({ label, icon, onPress, style, disabled }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity
      style={[styles.secondaryButton, disabled && styles.disabledButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.86}
    >
      {icon && <Ionicons name={icon} size={18} color={theme.text} />}
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Field({ icon, label, focused, containerStyle, ...inputProps }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={containerStyle}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <View style={[styles.inputShell, focused && styles.inputFocused]}>
        {icon && <Ionicons name={icon} size={18} color={focused ? theme.primary : theme.textTertiary} style={{ marginRight: 10 }} />}
        <TextInput
          {...inputProps}
          style={[styles.input, inputProps.style]}
          placeholderTextColor={theme.textTertiary}
        />
      </View>
    </View>
  );
}

export function Row({ icon, title, subtitle, right, onPress, children }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const Content = (
    <>
      {icon && (
        <View style={styles.rowIcon}>
          <Ionicons name={icon} size={19} color={theme.primary} />
        </View>
      )}
      <View style={styles.rowBody}>
        <Text style={styles.rowTitle} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.rowSubtitle} numberOfLines={1}>{subtitle}</Text>}
        {children}
      </View>
      {right && <View style={styles.rowRight}>{right}</View>}
    </>
  );

  if (onPress) {
    return <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.84}>{Content}</TouchableOpacity>;
  }
  return <View style={styles.row}>{Content}</View>;
}

export function Divider({ inset = 64 }) {
  const { theme } = useTheme();
  return <View style={{ height: 1, backgroundColor: theme.divider, marginLeft: inset }} />;
}

const createStyles = (theme) => StyleSheet.create({
  section: { marginBottom: 26 },
  horizontalInset: { paddingHorizontal: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  group: {
    backgroundColor: theme.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  groupInset: {
    marginHorizontal: 20,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 8,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryButton: {
    minHeight: 48,
    borderRadius: 8,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryButtonText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.55,
  },
  inputLabel: {
    color: theme.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  inputShell: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.inputBackground,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputFocused: {
    borderColor: theme.primary,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    minHeight: 48,
  },
  row: {
    minHeight: 68,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.cardAccentDark || theme.cardAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  rowSubtitle: {
    color: theme.textTertiary,
    fontSize: 13,
    marginTop: 3,
  },
  rowRight: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
});
