import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../api/client';
import { useTheme } from '../context/ThemeContext';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{receiptDraft.merchant}</Text>
        <Text style={styles.subtitle}>${Number(receiptDraft.total).toFixed(2)} total</Text>
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

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>People</Text>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setParticipants((current) => [...current, newParticipant(current.length + 1)])}
          >
            <Ionicons name="add" size={20} color={theme.primary} />
          </TouchableOpacity>
        </View>

        {participants.map((participant, index) => (
          <View key={participant.clientId} style={styles.personRow}>
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
        ))}
      </View>

      {splitMode === 'itemized' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Assign Items</Text>
          {receiptDraft.items.map((item) => (
            <View key={item.id} style={styles.assignmentBlock}>
              <Text style={styles.itemText}>{item.name} · ${Number(item.total).toFixed(2)}</Text>
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
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.primaryButton} onPress={createBill} disabled={saving}>
        <Text style={styles.primaryButtonText}>{saving ? 'Creating...' : 'Create Bill'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 16, gap: 16 },
  card: {
    backgroundColor: theme.card,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
  },
  title: { color: theme.text, fontSize: 22, fontWeight: '700' },
  subtitle: { color: theme.textSecondary, marginTop: 4 },
  segmented: {
    flexDirection: 'row',
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: theme.card,
  },
  segment: { flex: 1, padding: 14, alignItems: 'center' },
  segmentActive: { backgroundColor: theme.primary },
  segmentText: { color: theme.text, fontWeight: '600' },
  segmentTextActive: { color: '#000' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: theme.text, fontSize: 18, fontWeight: '600' },
  iconButton: { padding: 8 },
  personRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  input: {
    minHeight: 44,
    color: theme.text,
    borderColor: theme.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: theme.background,
  },
  nameInput: { flex: 1 },
  phoneInput: { width: 130 },
  assignmentBlock: { marginTop: 14 },
  itemText: { color: theme.text, marginBottom: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderColor: theme.border, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },
  chipActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  chipText: { color: theme.text },
  chipTextActive: { color: '#000', fontWeight: '700' },
  primaryButton: {
    backgroundColor: theme.primary,
    borderRadius: 8,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  primaryButtonText: { color: '#000', fontWeight: '700', fontSize: 16 },
});
