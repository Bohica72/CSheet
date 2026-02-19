import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, ScrollView
} from 'react-native';

export default function OverviewScreen({ route }) {
  const { character } = route.params;

  const [hpCurrent, setHpCurrent] = useState(character.hpCurrent);
  const [hpTemp, setHpTemp] = useState(character.hpTemp);
  const [moxie, setMoxie] = useState(character.getMoxieCurrent());
  const [inspiration, setInspiration] = useState(character.inspiration);
  const [hpModalVisible, setHpModalVisible] = useState(false);
  const [hpInput, setHpInput] = useState('');
  const [hpMode, setHpMode] = useState('damage'); // 'damage' | 'healing' | 'temp'

  const moxieMax = character.getMoxieMax();
  const hitDice = character.getHitDice();

  const applyHp = () => {
    const val = parseInt(hpInput, 10);
    if (isNaN(val)) return;
    if (hpMode === 'damage') setHpCurrent(Math.max(0, hpCurrent - val));
    if (hpMode === 'healing') setHpCurrent(Math.min(character.hpMax, hpCurrent + val));
    if (hpMode === 'temp') setHpTemp(val);
    setHpModalVisible(false);
    setHpInput('');
  };

  return (
    <ScrollView style={styles.container}>

      {/* TOP CARDS ROW */}
      <View style={styles.cardRow}>

        {/* HP Card */}
        <TouchableOpacity style={styles.card} onPress={() => setHpModalVisible(true)}>
          <Text style={styles.cardLabel}>Hit Points</Text>
          <Text style={styles.cardValue}>{hpCurrent} / {character.hpMax}</Text>
          {hpTemp > 0 && <Text style={styles.cardSub}>+{hpTemp} temp</Text>}
        </TouchableOpacity>

        {/* Hit Dice Card */}
        <TouchableOpacity style={styles.card} onPress={() => {/* dice roller hook here */}}>
          <Text style={styles.cardLabel}>Hit Dice</Text>
          <Text style={styles.cardValue}>{hitDice}</Text>
        </TouchableOpacity>

        {/* Moxie Card */}
        <TouchableOpacity style={styles.card} onPress={() => setMoxie(Math.max(0, moxie - 1))}>
          <Text style={styles.cardLabel}>Moxie</Text>
          <Text style={styles.cardValue}>{moxie} / {moxieMax}</Text>
        </TouchableOpacity>

      </View>

      {/* STATS GRID */}
      <View style={styles.grid}>
        {[
          { label: 'AC', value: character.getArmorClass() },
          { label: 'Initiative', value: `+${character.getInitiativeBonus()}` },
          { label: 'Speed', value: `${character.speed} ft` },
          { label: 'Inspiration', value: inspiration, onPress: () => setInspiration(inspiration + 1), onLongPress: () => setInspiration(Math.max(0, inspiration - 1)) },
          { label: 'Passive Perc', value: character.getPassivePerception() },
        ].map((stat) => (
          <TouchableOpacity
            key={stat.label}
            style={styles.gridCell}
            onPress={stat.onPress}
            onLongPress={stat.onLongPress}
          >
            <Text style={styles.gridLabel}>{stat.label}</Text>
            <Text style={styles.gridValue}>{stat.value}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ATTACKS */}
      <Text style={styles.sectionHeader}>Attacks</Text>
      {character.attacks.length === 0 && (
        <Text style={styles.emptyText}>No attacks configured</Text>
      )}
      {character.attacks.map((atk, i) => (
        <View key={i} style={styles.attackRow}>
          <Text style={styles.attackName}>{atk.name}</Text>
          <Text style={styles.attackStat}>+{atk.attackBonus}</Text>
          <Text style={styles.attackStat}>{atk.damage}{atk.damageBonus >= 0 ? '+' : ''}{atk.damageBonus}</Text>
        </View>
      ))}

      {/* HP MODAL */}
      <Modal visible={hpModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Adjust Hit Points</Text>
            <TextInput
              style={styles.modalInput}
              keyboardType="numeric"
              value={hpInput}
              onChangeText={setHpInput}
              placeholder="Enter value"
            />
            <View style={styles.modalButtons}>
              {['damage', 'healing', 'temp'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeButton, hpMode === mode && styles.modeButtonActive]}
                  onPress={() => setHpMode(mode)}
                >
                  <Text style={styles.modeButtonText}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.applyButton} onPress={applyHp}>
              <Text style={styles.applyButtonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHpModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 12 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  card: { flex: 1, backgroundColor: '#16213e', borderRadius: 10, padding: 12, marginHorizontal: 4, alignItems: 'center' },
  cardLabel: { color: '#aaa', fontSize: 11, marginBottom: 4 },
  cardValue: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  cardSub: { color: '#4fc3f7', fontSize: 11, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  gridCell: { width: '20%', backgroundColor: '#16213e', borderRadius: 8, padding: 8, alignItems: 'center', margin: 2 },
  gridLabel: { color: '#aaa', fontSize: 9, textAlign: 'center' },
  gridValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionHeader: { color: '#e0e0e0', fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { color: '#666', fontStyle: 'italic', marginBottom: 8 },
  attackRow: { flexDirection: 'row', backgroundColor: '#16213e', borderRadius: 8, padding: 10, marginBottom: 6, justifyContent: 'space-between' },
  attackName: { color: '#fff', flex: 2 },
  attackStat: { color: '#4fc3f7', flex: 1, textAlign: 'right' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#16213e', borderRadius: 12, padding: 24, width: '80%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalInput: { backgroundColor: '#0f3460', color: '#fff', borderRadius: 8, padding: 10, fontSize: 20, textAlign: 'center', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  modeButton: { flex: 1, padding: 8, borderRadius: 6, backgroundColor: '#0f3460', marginHorizontal: 2, alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#e94560' },
  modeButtonText: { color: '#fff', fontSize: 12 },
  applyButton: { backgroundColor: '#e94560', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 },
  applyButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelText: { color: '#aaa', textAlign: 'center' },
});
