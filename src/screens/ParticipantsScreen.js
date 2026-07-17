import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { Divider, formatCurrency, PrimaryButton } from '../components/FinanceUI';

function newParticipant(index) {
  return {
    clientId: `person-${Date.now()}-${index}`,
    name: '',
    phone: '',
  };
}

export default function ParticipantsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const receiptDraft = route.params.receiptDraft;
  const [splitMode, setSplitMode] = useState('even');
  const [participants, setParticipants] = useState([newParticipant(1), newParticipant(2)]);
  const [assignments, setAssignments] = useState({});
  const [saving, setSaving] = useState(false);

  const validParticipants = useMemo(
    () => participants.filter((participant) => participant.name.trim()),
    [participants]
  );

  const updateParticipant = (index, field, value) => {
    setParticipants((current) => current.map((participant, participantIndex) => (
      participantIndex === index ? { ...participant, [field]: value } : participant
    )));
  };

  const toggleAssignment = (itemId, clientId) => {
    setAssignments((current) => {
      const selected = new Set(current[itemId] || []);
      if (selected.has(clientId)) selected.delete(clientId);
      else selected.add(clientId);
      return { ...current, [itemId]: [...selected] };
    });
  };

  const createBill = async () => {
    if (validParticipants.length === 0) {
      Alert.alert('Add participants', 'Enter at least one person to split this bill.');
      return;
    }

    try {
      setSaving(true);
      const itemAssignments = receiptDraft.items.map((item) => ({
        receiptItemId: item.id,
        participantClientIds: assignments[item.id]?.length
          ? assignments[item.id]
          : validParticipants.map((participant) => participant.clientId),
      }));

      const data = await apiRequest('/bills', {
        method: 'POST',
        body: JSON.stringify({
          receiptDraftId: receiptDraft.id,
          title: receiptDraft.merchant,
          splitMode,
          participants: validParticipants,
          itemAssignments: splitMode === 'itemized' ? itemAssignments : undefined,
        }),
      });
      navigation.navigate('BillDetail', { bill: data.bill });
    } catch (error) {
      Alert.alert('Could not create bill', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Split setup</Text>
          <Text style={styles.title}>{receiptDraft.merchant}</Text>
          <Text style={styles.total}>{formatCurrency(receiptDraft.total)}</Text>
        </View>

        <View style={styles.segmented}>
          {[
            ['even', 'Even'],
            ['itemized', 'Itemized'],
          ].map(([value, label]) => (
            <TouchableOpacity
              key={value}
              style={[styles.segment, splitMode === value && styles.segmentActive]}
              onPress={() => setSplitMode(value)}
            >
              <Text style={[styles.segmentText, splitMode === value && styles.segmentTextActive]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.group}>
          <View style={styles.groupHeader}>
            <Text style={styles.sectionTitle}>People</Text>
            <TouchableOpacity
              style={styles.addPersonButton}
              onPress={() => setParticipants((current) => [...current, newParticipant(current.length + 1)])}
            >
              <Ionicons name="add" size={18} color="#000" />
              <Text style={styles.addPersonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {participants.map((participant, index) => (
            <View key={participant.clientId}>
              <View style={styles.personRow}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  placeholder="Name"
                  placeholderTextColor={theme.textTertiary}
                  value={participant.name}
                  onChangeText={(value) => updateParticipant(index, 'name', value)}
                />
                <TextInput
                  style={[styles.input, styles.phoneInput]}
                  placeholder="Phone"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="phone-pad"
                  value={participant.phone}
                  onChangeText={(value) => updateParticipant(index, 'phone', value)}
                />
              </View>
              {index < participants.length - 1 && <Divider inset={14} />}
            </View>
          ))}
        </View>

        {splitMode === 'itemized' && (
          <View style={styles.group}>
            <View style={styles.groupHeader}>
              <Text style={styles.sectionTitle}>Assign Items</Text>
            </View>
            {receiptDraft.items.map((item, index) => (
              <View key={item.id}>
                <View style={styles.assignmentBlock}>
                  <View style={styles.assignmentHeader}>
                    <Text style={styles.itemText} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.itemAmount}>{formatCurrency(item.total)}</Text>
                  </View>
                  <View style={styles.chipRow}>
                    {validParticipants.map((participant) => {
                      const active = assignments[item.id]?.includes(participant.clientId);
                      return (
                        <TouchableOpacity
                          key={participant.clientId}
                          style={[styles.chip, active && styles.chipActive]}
                          onPress={() => toggleAssignment(item.id, participant.clientId)}
                        >
                          <Text style={[styles.chipText, active && styles.chipTextActive]}>{participant.name}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
                {index < receiptDraft.items.length - 1 && <Divider inset={14} />}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Create bill" icon="arrow-forward" onPress={createBill} loading={saving} />
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.background },
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 112 },
  header: { marginBottom: 18 },
  kicker: { color: theme.textTertiary, fontSize: 13, fontWeight: '800', textTransform: 'uppercase' },
  title: { color: theme.text, fontSize: 26, fontWeight: '800', marginTop: 8 },
  total: { color: theme.text, fontSize: 34, fontWeight: '800', marginTop: 4 },
  segmented: {
    flexDirection: 'row',
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: theme.card,
    overflow: 'hidden',
    marginBottom: 16,
  },
  segment: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: theme.primary },
  segmentText: { color: theme.textSecondary, fontWeight: '800' },
  segmentTextActive: { color: '#000' },
  group: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  groupHeader: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
  },
  sectionTitle: { color: theme.text, fontSize: 15, fontWeight: '800', textTransform: 'uppercase' },
  addPersonButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  addPersonText: { color: '#000', fontWeight: '800' },
  personRow: { flexDirection: 'row', gap: 8, padding: 14 },
  input: {
    minHeight: 46,
    color: theme.text,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.inputBackground,
  },
  nameInput: { flex: 1, fontWeight: '700' },
  phoneInput: { width: 130 },
  assignmentBlock: { padding: 14 },
  assignmentHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 10 },
  itemText: { flex: 1, color: theme.text, fontWeight: '800' },
  itemAmount: { color: theme.text, fontWeight: '800' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.inputBackground,
  },
  chipActive: { backgroundColor: theme.cardAccentDark || theme.cardAccent, borderColor: theme.primary },
  chipText: { color: theme.textSecondary, fontWeight: '700' },
  chipTextActive: { color: theme.primary, fontWeight: '800' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 24,
    backgroundColor: theme.background,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
});
