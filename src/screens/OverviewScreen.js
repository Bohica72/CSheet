import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, TextInput,
  StyleSheet, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { saveCharacter } from '../utils/CharacterStore';
import {
  colors, spacing, radius, typography,
  shadows, sharedStyles
} from '../styles/theme';

function rollDie(faces) {
  return Math.floor(Math.random() * faces) + 1;
}

export default function OverviewScreen({ route }) {
  const { character } = route.params;

  const [hpCurrent, setHpCurrent]               = useState(character.hpCurrent);
  const [hpTemp, setHpTemp]                     = useState(character.hpTemp ?? 0);
  const [moxie, setMoxie]                       = useState(character.getMoxieCurrent());
  const [hitDiceRemaining, setHitDiceRemaining] = useState(character.hitDiceRemaining ?? character.level);
  const [inspiration, setInspiration]           = useState(character.inspiration ?? 0);
  const [hpModalVisible, setHpModalVisible]     = useState(false);
  const [hpInput, setHpInput]                   = useState('');
  const [hpMode, setHpMode]                     = useState('damage');
  const [restModalVisible, setRestModalVisible] = useState(false);
  const [hitDiceModalVisible, setHitDiceModalVisible] = useState(false);
  const [diceToSpend, setDiceToSpend]           = useState(1);
  const [lastRollResult, setLastRollResult]     = useState(null);

  const moxieMax    = character.getMoxieMax();
  const hitDice     = character.getHitDice();
  const hitDieFaces = parseInt(hitDice.split('d')[1], 10);
  const conMod      = character.getAbilityMod('con');
  const attacks     = character.attacks ?? [];
  const hpPercent   = Math.max(0, hpCurrent / character.hpMax);

  const persist = async (updates) => {
    Object.assign(character, updates);
    await saveCharacter(character);
  };

  // HP bar colour
  const hpBarColor = hpPercent > 0.5
    ? colors.success
    : hpPercent > 0.25
      ? colors.warning
      : colors.accent;

  const applyHp = () => {
    const val = parseInt(hpInput, 10);
    if (isNaN(val)) return;
    let newHp = hpCurrent;
    let newTemp = hpTemp;
    if (hpMode === 'damage')  newHp  = Math.max(0, hpCurrent - val);
    if (hpMode === 'healing') newHp  = Math.min(character.hpMax, hpCurrent + val);
    if (hpMode === 'temp')    newTemp = val;
    setHpCurrent(newHp);
    setHpTemp(newTemp);
    persist({ hpCurrent: newHp, hpTemp: newTemp });
    setHpModalVisible(false);
    setHpInput('');
  };

  const rollHitDice = () => {
    if (diceToSpend < 1 || diceToSpend > hitDiceRemaining) return;
    let total = 0;
    const rolls = [];
    for (let i = 0; i < diceToSpend; i++) {
      const roll = rollDie(hitDieFaces);
      rolls.push(roll);
      total += roll + conMod;
    }
    total = Math.max(0, total);
    const newHp = Math.min(character.hpMax, hpCurrent + total);
    const newRemaining = hitDiceRemaining - diceToSpend;
    setHpCurrent(newHp);
    setHitDiceRemaining(newRemaining);
    setLastRollResult({ rolls, conMod, total, newHp });
    persist({ hpCurrent: newHp, hitDiceRemaining: newRemaining });
  };

  const closeHitDiceModal = () => {
    setHitDiceModalVisible(false);
    setDiceToSpend(1);
    setLastRollResult(null);
  };

  const doShortRest = () => {
    setRestModalVisible(false);
    setTimeout(() => setHitDiceModalVisible(true), 300);
  };

  const doLongRest = () => {
    const newHp    = character.hpMax;
    const newMoxie = moxieMax;
    const newDice  = character.level;
    setHpCurrent(newHp);
    setHpTemp(0);
    setMoxie(newMoxie);
    setHitDiceRemaining(newDice);
    persist({ hpCurrent: newHp, hpTemp: 0, moxieCurrent: newMoxie, hitDiceRemaining: newDice });
    setRestModalVisible(false);
    Alert.alert('Long Rest', 'HP, Moxie, and Hit Dice fully restored.');
  };

  const equippedAttacks = character.getEquippedWeaponAttacks?.() ?? [];

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* HP BAR */}
        <TouchableOpacity
          style={styles.hpBarContainer}
          onPress={() => setHpModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.hpBarHeader}>
            <Text style={styles.hpBarLabel}>HIT POINTS</Text>
            <Text style={styles.hpBarValue}>
              {hpCurrent} <Text style={styles.hpBarMax}>/ {character.hpMax}</Text>
            </Text>
          </View>
          <View style={styles.hpBarTrack}>
            <View style={[styles.hpBarFill, { width: `${hpPercent * 100}%`, backgroundColor: hpBarColor }]} />
          </View>
          {hpTemp > 0 && (
            <Text style={styles.hpTempBadge}>+{hpTemp} temporary</Text>
          )}
        </TouchableOpacity>

        {/* TOP CARDS ROW */}
        <View style={styles.cardRow}>

          {/* Hit Dice */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => setHitDiceModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>HIT DICE</Text>
            <Text style={styles.cardValue}>{hitDiceRemaining}</Text>
            <Text style={styles.cardSub}>of {character.level} d{hitDieFaces}</Text>
          </TouchableOpacity>

          {/* Moxie */}
          <TouchableOpacity
            style={[styles.card, styles.cardGold]}
            onPress={() => {
              const newVal = Math.max(0, moxie - 1);
              setMoxie(newVal);
              persist({ moxieCurrent: newVal });
            }}
            onLongPress={() => {
              const newVal = Math.min(moxieMax, moxie + 1);
              setMoxie(newVal);
              persist({ moxieCurrent: newVal });
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.cardLabel}>MOXIE</Text>
            <Text style={[styles.cardValue, { color: colors.gold }]}>{moxie}</Text>
            <Text style={styles.cardSub}>/ {moxieMax}</Text>
          </TouchableOpacity>

        </View>

        {/* STATS GRID */}
        <Text style={sharedStyles.sectionHeader}>Combat Stats</Text>
        <View style={styles.grid}>
          {[
            { label: 'AC',           value: character.getArmorClass(),      color: colors.accentSoft },
            { label: 'Initiative',   value: `+${character.getInitiativeBonus()}`, color: colors.accentSoft },
            { label: 'Speed',        value: `${character.speed}ft`,         color: colors.accentSoft },
            { label: 'Inspiration',  value: inspiration ? '✦' : '—',       color: colors.gold,
              onPress: () => {
                const newVal = inspiration ? 0 : 1;
                setInspiration(newVal);
                persist({ inspiration: newVal });
              }
            },
            { label: 'Pass. Perc',   value: character.getPassivePerception(), color: colors.accentSoft },
          ].map((stat) => (
            <TouchableOpacity
              key={stat.label}
              style={styles.gridCell}
              onPress={stat.onPress}
              activeOpacity={stat.onPress ? 0.7 : 1}
            >
              <Text style={[styles.gridValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.gridLabel}>{stat.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ATTACKS */}
        <Text style={sharedStyles.sectionHeader}>Attacks</Text>

        {/* Fisticuffs — always shown */}
        <View style={styles.attackRow}>
          <View style={styles.attackNameCol}>
            <Text style={styles.attackName}>Fisticuffs</Text>
            <Text style={styles.attackTag}>Unarmed · {character.getFisticuffsDie()}</Text>
          </View>
          <View style={styles.attackStatCol}>
            <Text style={styles.attackStatLabel}>ATK</Text>
            <Text style={styles.attackStat}>+{character.getMeleeAttackBonus()}</Text>
          </View>
          <View style={styles.attackStatCol}>
            <Text style={styles.attackStatLabel}>DMG</Text>
            <Text style={styles.attackStat}>
              {character.getFisticuffsDie()}+{character.getAbilityMod('str')}
            </Text>
          </View>
        </View>

        {/* Equipped weapons */}
        {equippedAttacks.map((atk, i) => (
          <View key={i} style={[styles.attackRow, styles.attackRowWeapon]}>
            <View style={styles.attackNameCol}>
              <Text style={styles.attackName}>{atk.name}</Text>
              <Text style={styles.attackTag}>Weapon</Text>
            </View>
            <View style={styles.attackStatCol}>
              <Text style={styles.attackStatLabel}>ATK</Text>
              <Text style={styles.attackStat}>+{atk.attackBonus}</Text>
            </View>
            <View style={styles.attackStatCol}>
              <Text style={styles.attackStatLabel}>DMG</Text>
              <Text style={styles.attackStat}>
                {atk.damage}{atk.damageBonus >= 0 ? '+' : ''}{atk.damageBonus}
              </Text>
            </View>
          </View>
        ))}

        {equippedAttacks.length === 0 && (
          <Text style={styles.emptyText}>Equip a weapon in Inventory to add attacks</Text>
        )}

      </ScrollView>

      {/* FLOATING REST BUTTON */}
      <TouchableOpacity
        style={styles.restFab}
        onPress={() => setRestModalVisible(true)}
      >
        <Ionicons name="moon" size={22} color={colors.textPrimary} />
      </TouchableOpacity>

      {/* HP MODAL */}
      <Modal visible={hpModalVisible} transparent animationType="slide">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>Adjust Hit Points</Text>
            <TextInput
              style={[sharedStyles.input, styles.largeInput]}
              keyboardType="numeric"
              value={hpInput}
              onChangeText={setHpInput}
              placeholder="0"
              placeholderTextColor={colors.textDisabled}
            />
            <View style={styles.modeRow}>
              {['damage', 'healing', 'temp'].map((mode) => (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeButton, hpMode === mode && styles.modeButtonActive]}
                  onPress={() => setHpMode(mode)}
                >
                  <Text style={[styles.modeButtonText, hpMode === mode && styles.modeButtonTextActive]}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={sharedStyles.primaryButton} onPress={applyHp}>
              <Text style={sharedStyles.primaryButtonText}>Apply</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setHpModalVisible(false)}>
              <Text style={sharedStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* REST MODAL */}
      <Modal visible={restModalVisible} transparent animationType="fade">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>Take a Rest</Text>
            <TouchableOpacity style={styles.restButton} onPress={doShortRest}>
              <Ionicons name="partly-sunny" size={22} color={colors.accentSoft} style={{ marginRight: spacing.md }} />
              <View>
                <Text style={styles.restButtonTitle}>Short Rest</Text>
                <Text style={styles.restButtonSub}>Spend hit dice to recover HP</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.restButton, { borderColor: colors.accentDim }]} onPress={doLongRest}>
              <Ionicons name="moon" size={22} color={colors.gold} style={{ marginRight: spacing.md }} />
              <View>
                <Text style={styles.restButtonTitle}>Long Rest</Text>
                <Text style={styles.restButtonSub}>Restore all HP, Moxie &amp; Hit Dice</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setRestModalVisible(false)}>
              <Text style={sharedStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* HIT DICE MODAL */}
      <Modal visible={hitDiceModalVisible} transparent animationType="slide">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>Spend Hit Dice</Text>
            <Text style={styles.modalSub}>
              {hitDiceRemaining} / {character.level} d{hitDieFaces} remaining
            </Text>
            <Text style={styles.modalSub}>
              CON {conMod >= 0 ? `+${conMod}` : conMod} added per die
            </Text>

            <View style={styles.stepper}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setDiceToSpend(Math.max(1, diceToSpend - 1))}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValue}>{diceToSpend}</Text>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setDiceToSpend(Math.min(hitDiceRemaining, diceToSpend + 1))}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {lastRollResult && (
              <View style={styles.rollResult}>
                <Text style={styles.rollDice}>[{lastRollResult.rolls.join(' + ')}]</Text>
                <Text style={styles.rollMeta}>
                  +{lastRollResult.conMod >= 0 ? lastRollResult.conMod : lastRollResult.conMod} CON × {lastRollResult.rolls.length}
                </Text>
                <Text style={styles.rollTotal}>
                  +{lastRollResult.total} HP  →  {lastRollResult.newHp} / {character.hpMax}
                </Text>
              </View>
            )}

            {!lastRollResult ? (
              <TouchableOpacity
                style={[sharedStyles.primaryButton, hitDiceRemaining === 0 && { backgroundColor: colors.textDisabled }]}
                onPress={rollHitDice}
                disabled={hitDiceRemaining === 0}
              >
                <Text style={sharedStyles.primaryButtonText}>
                  Roll {diceToSpend}d{hitDieFaces}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={sharedStyles.primaryButton} onPress={closeHitDiceModal}>
                <Text style={sharedStyles.primaryButtonText}>Done</Text>
              </TouchableOpacity>
            )}

            {!lastRollResult && (
              <TouchableOpacity onPress={closeHitDiceModal}>
                <Text style={sharedStyles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  // HP bar
  hpBarContainer: {
    ...sharedStyles.card,
    marginBottom: spacing.md,
  },
  hpBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  hpBarLabel: {
    ...typography.label,
    letterSpacing: 1,
  },
  hpBarValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  hpBarMax: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: 'normal',
  },
  hpBarTrack: {
    height: 8,
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  hpTempBadge: {
    color: colors.accentSoft,
    fontSize: 11,
    marginTop: spacing.xs,
    textAlign: 'right',
  },

  // Cards row
  cardRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  card: {
    ...sharedStyles.card,
    flex: 1,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: colors.accentSoft,
  },
  cardGold: {
    borderTopColor: colors.gold,
  },
  cardLabel: {
    ...typography.label,
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  cardValue: {
    ...typography.value,
  },
  cardSub: {
    ...typography.subtitle,
    marginTop: spacing.xs,
  },

  // Stats grid
  grid: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  gridCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.card,
  },
  gridValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  gridLabel: {
    ...typography.label,
    textAlign: 'center',
  },

  // Attacks
  attackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    ...shadows.card,
  },
  attackRowWeapon: {
    borderLeftColor: colors.accentSoft,
  },
  attackNameCol: { flex: 2 },
  attackName: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  attackTag: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  attackStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  attackStatLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  attackStat: {
    color: colors.accentSoft,
    fontWeight: 'bold',
    fontSize: 15,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    fontSize: 12,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  // Rest FAB
  restFab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 50,
    height: 50,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDeep,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },

  // Modals
  largeInput: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  modeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  modeButton: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceDeep,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  modeButtonActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentDim,
  },
  modeButtonText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  modeButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  restButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.surfaceDeep,
  },
  restButtonTitle: {
    color: colors.textPrimary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  restButtonSub: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.lg,
  },
  stepperBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 28,
  },
  stepperValue: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: 'bold',
    marginHorizontal: spacing.xl,
  },
  rollResult: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.sm,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  rollDice: {
    color: colors.accentSoft,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  rollMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: spacing.xs,
  },
  rollTotal: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalSub: {
    color: colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
