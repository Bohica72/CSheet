import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveCharacter } from '../utils/CharacterStore';


// Roll a single die of `faces` sides
function rollDie(faces) {
  return Math.floor(Math.random() * faces) + 1;
}

export default function OverviewScreen({ route }) {
  const { character } = route.params;

  const [hpCurrent, setHpCurrent]         = useState(character.hpCurrent);
  const [hpTemp, setHpTemp]               = useState(character.hpTemp ?? 0);
  const [moxie, setMoxie]                 = useState(character.getMoxieCurrent());
  const [hitDiceRemaining, setHitDiceRemaining] = useState(
    character.hitDiceRemaining ?? character.level
  );
  const [inspiration, setInspiration]     = useState(character.inspiration ?? 0);

  // HP modal
  const [hpModalVisible, setHpModalVisible] = useState(false);
  const [hpInput, setHpInput]             = useState('');
  const [hpMode, setHpMode]               = useState('damage');

  // Rest modal
  const [restModalVisible, setRestModalVisible] = useState(false);

  // Hit dice modal
  const [hitDiceModalVisible, setHitDiceModalVisible] = useState(false);
  const [diceToSpend, setDiceToSpend]     = useState(1);
  const [lastRollResult, setLastRollResult] = useState(null);

  const moxieMax  = character.getMoxieMax();
  const hitDice   = character.getHitDice();       // e.g. "5d8"
  const hitDieFaces = parseInt(hitDice.split('d')[1], 10); // e.g. 8
  const conMod    = character.getAbilityMod('con');
  const attacks   = character.attacks ?? [];

  // --- Persist helper ---
  const persist = async (updates) => {
    Object.assign(character, updates);
    await saveCharacter(character);
  };

  // --- HP modal ---
  const applyHp = () => {
    const val = parseInt(hpInput, 10);
    if (isNaN(val)) return;
    let newHp = hpCurrent;
    let newTemp = hpTemp;
    if (hpMode === 'damage') newHp = Math.max(0, hpCurrent - val);
    if (hpMode === 'healing') newHp = Math.min(character.hpMax, hpCurrent + val);
    if (hpMode === 'temp') newTemp = val;
    setHpCurrent(newHp);
    setHpTemp(newTemp);
    persist({ hpCurrent: newHp, hpTemp: newTemp });
    setHpModalVisible(false);
    setHpInput('');
  };

  // --- Hit dice roller ---
  const rollHitDice = () => {
    if (diceToSpend < 1 || diceToSpend > hitDiceRemaining) return;
    let total = 0;
    const rolls = [];
    for (let i = 0; i < diceToSpend; i++) {
      const roll = rollDie(hitDieFaces);
      rolls.push(roll);
      total += roll + conMod; // CON mod per die (RAW)
    }
    total = Math.max(0, total); // can't go negative
    const newHp = Math.min(character.hpMax, hpCurrent + total);
    const newRemaining = hitDiceRemaining - diceToSpend;
    setHpCurrent(newHp);
    setHitDiceRemaining(newRemaining);
    setLastRollResult({
      rolls,
      conMod,
      total,
      newHp,
    });
    persist({ hpCurrent: newHp, hitDiceRemaining: newRemaining });
  };

  const closeHitDiceModal = () => {
    setHitDiceModalVisible(false);
    setDiceToSpend(1);
    setLastRollResult(null);
  };

  // --- Rests ---
  const doShortRest = () => {
    setRestModalVisible(false);
    // Small delay so rest modal closes before hit dice modal opens
    setTimeout(() => setHitDiceModalVisible(true), 300);
  };

  const doLongRest = () => {
    const newHp = character.hpMax;
    const newMoxie = moxieMax;
    const newDice = character.level; // all restored
    setHpCurrent(newHp);
    setHpTemp(0);
    setMoxie(newMoxie);
    setHitDiceRemaining(newDice);
    persist({ hpCurrent: newHp, hpTemp: 0, moxieCurrent: newMoxie, hitDiceRemaining: newDice });
    setRestModalVisible(false);
    Alert.alert('Long Rest', 'HP, Moxie, and Hit Dice fully restored.');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>

        {/* TOP CARDS */}
        <View style={styles.cardRow}>

          <TouchableOpacity style={styles.card} onPress={() => setHpModalVisible(true)}>
            <Text style={styles.cardLabel}>Hit Points</Text>
            <Text style={styles.cardValue}>{hpCurrent} / {character.hpMax}</Text>
            {hpTemp > 0 && <Text style={styles.cardSub}>+{hpTemp} temp</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setHitDiceModalVisible(true)}>
            <Text style={styles.cardLabel}>Hit Dice</Text>
            <Text style={styles.cardValue}>{hitDiceRemaining}</Text>
            <Text style={styles.cardSub}>of {character.level} {hitDice.split('d')[1] ? `d${hitDieFaces}` : ''}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.card} onPress={() => setMoxie(Math.max(0, moxie - 1))}>
            <Text style={styles.cardLabel}>Moxie</Text>
            <Text style={styles.cardValue}>{moxie} / {moxieMax}</Text>
          </TouchableOpacity>

        </View>

        {/* STATS GRID */}
        <View style={styles.grid}>
          {[
            { label: 'AC',           value: character.getArmorClass() },
            { label: 'Initiative',   value: `+${character.getInitiativeBonus()}` },
            { label: 'Speed',        value: `${character.speed} ft` },
            { label: 'Inspiration',  value: inspiration ? '✦' : '—',
              onPress: () => {
                const newVal = inspiration ? 0 : 1;
                setInspiration(newVal);
                persist({ inspiration: newVal });
              }
            },
            { label: 'Passive Perc', value: character.getPassivePerception() },
          ].map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={styles.gridCell}
              onPress={stat.onPress}
            >
              <Text style={styles.gridLabel}>{stat.label}</Text>
              <Text style={styles.gridValue}>{stat.value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ATTACKS */}
<Text style={styles.sectionHeader}>Attacks</Text>

{/* Fisticuffs — always shown */}
<View style={styles.attackRow}>
  <View style={styles.attackNameCol}>
    <Text style={styles.attackName}>Fisticuffs</Text>
    <Text style={styles.attackTag}>Unarmed · {character.getFisticuffsDie()}</Text>
  </View>
  <Text style={styles.attackStat}>
    +{character.getMeleeAttackBonus()}
  </Text>
  <Text style={styles.attackStat}>
    {character.getFisticuffsDie()}+{character.getAbilityMod('str')}
  </Text>
</View>

{/* Equipped weapons */}
{character.getEquippedWeaponAttacks().map((atk, i) => (
  <View key={i} style={[styles.attackRow, styles.attackRowWeapon]}>
    <View style={styles.attackNameCol}>
      <Text style={styles.attackName}>{atk.name}</Text>
      <Text style={styles.attackTag}>Weapon</Text>
    </View>
    <Text style={styles.attackStat}>+{atk.attackBonus}</Text>
    <Text style={styles.attackStat}>
      {atk.damage}{atk.damageBonus >= 0 ? '+' : ''}{atk.damageBonus}
    </Text>
  </View>
))}

{character.getEquippedWeaponAttacks().length === 0 && (
  <Text style={styles.emptyText}>No weapons equipped</Text>
)}


        <View style={{ height: 80 }} />
      </ScrollView>

      {/* FLOATING REST BUTTON */}
      <TouchableOpacity
        style={styles.restFab}
        onPress={() => setRestModalVisible(true)}
      >
        <Ionicons name="moon" size={24} color="#fff" />
      </TouchableOpacity>

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
              placeholderTextColor="#666"
            />
            <View style={styles.modalButtons}>
              {['damage', 'healing', 'temp'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeButton, hpMode === mode && styles.modeButtonActive]}
                  onPress={() => setHpMode(mode)}
                >
                  <Text style={styles.modeButtonText}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
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

      {/* REST MODAL */}
      <Modal visible={restModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Take a Rest</Text>

            <TouchableOpacity style={styles.restButton} onPress={doShortRest}>
              <Ionicons name="partly-sunny" size={20} color="#fff" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.restButtonTitle}>Short Rest</Text>
                <Text style={styles.restButtonSub}>Spend hit dice to recover HP</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.restButton, styles.restButtonLong]} onPress={doLongRest}>
              <Ionicons name="moon" size={20} color="#fff" style={{ marginRight: 8 }} />
              <View>
                <Text style={styles.restButtonTitle}>Long Rest</Text>
                <Text style={styles.restButtonSub}>Restore all HP, Moxie & Hit Dice</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setRestModalVisible(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HIT DICE MODAL */}
      <Modal visible={hitDiceModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Spend Hit Dice</Text>
            <Text style={styles.modalSub}>
              Available: {hitDiceRemaining} / {character.level} d{hitDieFaces}
            </Text>
            <Text style={styles.modalSub}>
              CON modifier: {conMod >= 0 ? `+${conMod}` : conMod} per die
            </Text>

            {/* Stepper */}
            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setDiceToSpend(Math.max(1, diceToSpend - 1))}
              >
                <Text style={styles.stepperButtonText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{diceToSpend}</Text>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => setDiceToSpend(Math.min(hitDiceRemaining, diceToSpend + 1))}
              >
                <Text style={styles.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSub}>
              Expected: {diceToSpend}d{hitDieFaces} + {diceToSpend * conMod} (CON)
            </Text>

            {/* Roll result */}
            {lastRollResult && (
              <View style={styles.rollResult}>
                <Text style={styles.rollResultDice}>
                  Rolls: [{lastRollResult.rolls.join(', ')}]
                </Text>
                <Text style={styles.rollResultTotal}>
                  +{lastRollResult.conMod >= 0 ? lastRollResult.conMod : lastRollResult.conMod} CON × {lastRollResult.rolls.length}
                </Text>
                <Text style={styles.rollResultHp}>
                  Total healed: +{lastRollResult.total}  →  HP: {lastRollResult.newHp} / {character.hpMax}
                </Text>
              </View>
            )}

            {!lastRollResult ? (
              <TouchableOpacity
                style={[styles.applyButton, hitDiceRemaining === 0 && styles.applyButtonDisabled]}
                onPress={rollHitDice}
                disabled={hitDiceRemaining === 0}
              >
                <Text style={styles.applyButtonText}>
                  Roll {diceToSpend}d{hitDieFaces}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.applyButton} onPress={closeHitDiceModal}>
                <Text style={styles.applyButtonText}>Done</Text>
              </TouchableOpacity>
            )}

            {!lastRollResult && (
              <TouchableOpacity onPress={closeHitDiceModal}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

    </View>
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

  // Floating rest button
  restFab: {
    position: 'absolute', right: 20, bottom: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#0f3460',
    alignItems: 'center', justifyContent: 'center',
    elevation: 6,
  },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { backgroundColor: '#16213e', borderRadius: 12, padding: 24, width: '85%' },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  modalSub: { color: '#aaa', fontSize: 12, marginBottom: 8, textAlign: 'center' },
  modalInput: { backgroundColor: '#0f3460', color: '#fff', borderRadius: 8, padding: 10, fontSize: 20, textAlign: 'center', marginBottom: 12 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  modeButton: { flex: 1, padding: 8, borderRadius: 6, backgroundColor: '#0f3460', marginHorizontal: 2, alignItems: 'center' },
  modeButtonActive: { backgroundColor: '#e94560' },
  modeButtonText: { color: '#fff', fontSize: 12 },
  applyButton: { backgroundColor: '#e94560', borderRadius: 8, padding: 12, alignItems: 'center', marginBottom: 8 },
  applyButtonDisabled: { backgroundColor: '#555' },
  applyButtonText: { color: '#fff', fontWeight: 'bold' },
  cancelText: { color: '#aaa', textAlign: 'center', paddingVertical: 8 },

  // Rest buttons
  restButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0f3460', borderRadius: 8, padding: 14, marginBottom: 10 },
  restButtonLong: { backgroundColor: '#1a1a4e' },
  restButtonTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  restButtonSub: { color: '#aaa', fontSize: 12, marginTop: 2 },

  // Stepper
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginVertical: 12 },
  stepperButton: { backgroundColor: '#0f3460', width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stepperButtonText: { color: '#fff', fontSize: 24, lineHeight: 28 },
  stepperValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginHorizontal: 24 },

  // Roll result
  rollResult: { backgroundColor: '#0f3460', borderRadius: 8, padding: 12, marginBottom: 12, alignItems: 'center' },
  rollResultDice: { color: '#4fc3f7', fontSize: 14, marginBottom: 4 },
  rollResultTotal: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  rollResultHp: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
