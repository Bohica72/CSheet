import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView
} from 'react-native';

export default function ItemCard({ item, onClose, onAdd }) {
  if (!item) return null;

  return (
    <Modal visible={!!item} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ScrollView>
            <Text style={styles.name}>{item.Name}</Text>

            <View style={styles.tagRow}>
              <Tag label={item.ObjectType} />
              <Tag label={item.Rarity} />
              {item.Attunement === 'Yes' && <Tag label="Attunement" highlight />}
              {item.Wondrous === 'Yes' && <Tag label="Wondrous" />}
            </View>

            {/* Stat bonuses */}
            <View style={styles.statRow}>
              {item.BonusAC > 0 && <StatPill label="AC" value={`+${item.BonusAC}`} />}
              {item.BonusWeapon > 0 && <StatPill label="Attack/Dmg" value={`+${item.BonusWeapon}`} />}
              {item.Charges > 0 && <StatPill label="Charges" value={item.Charges} />}
              {item.Weight > 0 && <StatPill label="Weight" value={`${item.Weight} lb`} />}
            </View>

            <Text style={styles.description}>{item.Description}</Text>
          </ScrollView>

          <TouchableOpacity style={styles.addButton} onPress={() => onAdd(item)}>
            <Text style={styles.addButtonText}>Add to Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function Tag({ label, highlight }) {
  return (
    <View style={[styles.tag, highlight && styles.tagHighlight]}>
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

function StatPill({ label, value }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillLabel}>{label}</Text>
      <Text style={styles.pillValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  card: { backgroundColor: '#2e383c', opacity: 0.8, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, maxHeight: '80%' },
  name: { color: '#d3c6aa', fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  tag: { backgroundColor: '#0f3460', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginRight: 6, marginBottom: 6 },
  tagHighlight: { backgroundColor: '#45443c' },
  tagText: { color: '#d3c6aa', fontSize: 11 },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  pill: { backgroundColor: '#384b55', borderRadius: 8, padding: 8, marginRight: 8, marginBottom: 8, alignItems: 'center' },
  pillLabel: { color: '#d3c6aa', fontSize: 10 },
  pillValue: { color: '#d3c6aa', fontSize: 16, fontWeight: 'bold' },
  description: { color: '#ccc', fontSize: 13, lineHeight: 20, marginBottom: 16 },
  addButton: { backgroundColor: '#7fbbb3', borderRadius: 8, padding: 14, alignItems: 'center', marginBottom: 10 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  closeText: { color: '#aaa', textAlign: 'center', paddingVertical: 8 },
});
