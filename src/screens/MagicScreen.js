import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { colors, spacing, radius, typography, sharedStyles, shadows } from '../styles/theme';
import { saveCharacter } from '../utils/CharacterStore';
import { Character } from '../models/Character';
import spellsData from '../data/spells.json';

import { getClassData } from '../utils/ClassStore';
import { useFocusEffect } from '@react-navigation/native';


let allSpells = [];
if (Array.isArray(spellsData)) {
  allSpells = spellsData;
} else if (Array.isArray(spellsData?.spell)) {
  allSpells = spellsData.spell;
} else if (Array.isArray(spellsData?.default?.spell)) {
  allSpells = spellsData.default.spell;
} else {
  console.warn('spells.json shape not recognised:', Object.keys(spellsData ?? {}));
}

const SCHOOL_NAMES = {
  A: 'Abjuration', C: 'Conjuration', D: 'Divination',
  E: 'Enchantment', EV: 'Evocation', I: 'Illusion',
  N: 'Necromancy', T: 'Transmutation', V: 'Evocation',
};

const cleanText = (str) =>
  str.replace(/\{@\w+\s([^}]+)\}/g, '$1');

const flattenEntries = (entries) => {
  if (!entries) return '';
  // Force it into a flat array, just in case 5eTools nested arrays inside arrays
  const safeEntries = Array.isArray(entries) ? entries.flat(Infinity) : [entries];

  return safeEntries.map((e) => {
    if (typeof e === 'string') return cleanText(e);
    
    if (e.type === 'entries' || e.type === 'list') {
      const prefix = e.name ? `${e.name}:\n` : '';
      const subEntries = e.entries || e.items || [];
      return `${prefix}${flattenEntries(subEntries)}`;
    }
    return '';
  }).filter(Boolean).join('\n\n');
};

const formatTime = (time = []) =>
  time.map((t) => `${t.number} ${t.unit}`).join(', ');

const formatRange = (range) => {
  if (!range) return '—';
  const d = range.distance;
  if (!d) return range.type;
  if (d.type === 'self') return 'Self';
  if (d.type === 'touch') return 'Touch';
  if (d.type === 'sight') return 'Sight';
  if (d.type === 'unlimited') return 'Unlimited';
  return `${d.amount} ${d.type}`;
};

const formatDuration = (duration = []) =>
  duration.map((d) => {
    if (d.type === 'instant') return 'Instantaneous';
    if (d.type === 'permanent') return 'Permanent';
    if (d.type === 'special') return 'Special';
    const dur = d.duration;
    const label = dur ? `${dur.amount} ${dur.type}${dur.amount !== 1 ? 's' : ''}` : d.type;
    return d.concentration ? `${label} (concentration)` : label;
  }).join(', ');

const formatComponents = (c) => {
  if (!c) return '—';
  const parts = [];
  if (c.v) parts.push('V');
  if (c.s) parts.push('S');
  if (c.m) parts.push(typeof c.m === 'string' ? `M (${c.m})` : 'M');
  return parts.join(', ');
};

// Split spells at module level for performance
const cantrips = allSpells.filter(s => s.level === 0);
const levelledSpells = allSpells.filter(s => s.level > 0);

export default function MagicScreen({ route }) {
  const raw = route?.params?.character;
  const character = raw instanceof Character ? raw : new Character(raw);
  const classData = getClassData(character.classId);
  const levelSlots = classData?.spellSlots?.[character.level] ?? [];

  // Grab the spellcasting ability (e.g., 'int' for Wizard) and calculate the modifier
  const spellAbility = classData?.spellcastingAbility;
  const spellMod = spellAbility ? character.getAbilityMod(spellAbility) : 0;
  
  // Calculate Max Prepared (Class Level + Modifier, minimum 1)
  // Note: For known casters (Bards, Sorcerers), you'll want to pull from classData instead
  const maxPrepared = Math.max(1, character.level + spellMod);

  const [spellSlotsUsed, setSpellSlotsUsed] = useState(character.spellSlotsUsed ?? {});
  const [preparedSpells, setPreparedSpells] = useState(character.preparedSpells ?? []);
  const [knownCantrips, setKnownCantrips] = useState(character.knownCantrips ?? []);
  const [search, setSearch] = useState('');
  const [detailSpell, setDetailSpell] = useState(null);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'library'

  useFocusEffect(
    React.useCallback(() => {
      setSpellSlotsUsed(character.spellSlotsUsed ?? {});
      setPreparedSpells(character.preparedSpells ?? []);
      setKnownCantrips(character.knownCantrips ?? []);
    }, [character])
  );

  const persist = async (updates) => {
    Object.assign(character, updates);
    await saveCharacter(character);
  };

  const openDetail = (spell) => {
    setDetailSpell(spell);
  };

 const toggleSlot = (spellLevel) => {
  const key = String(spellLevel);
  const used = spellSlotsUsed[key] ?? 0;
  const max = levelSlots[spellLevel - 1] ?? 0;
  // Count remaining down instead of used up
  const remaining = max - used;
  const next = remaining <= 0 ? 0 : used + 1;
  const updated = { ...spellSlotsUsed, [key]: next };
  setSpellSlotsUsed(updated);
  persist({ spellSlotsUsed: updated });
};


  const togglePrepared = (spellId) => {
    const isPrepared = preparedSpells.includes(spellId);
    
    // Prevent preparing more than the max allowed, unless they are un-preparing a spell
    if (!isPrepared && preparedSpells.length >= maxPrepared) {
      Alert.alert('Limit Reached', `You can only prepare ${maxPrepared} spells at this level.`);
      return;
    }

    const next = isPrepared
      ? preparedSpells.filter((id) => id !== spellId)
      : [...preparedSpells, spellId];
    setPreparedSpells(next);
    persist({ preparedSpells: next });
  };

  const toggleCantrip = (spellId) => {
    const isKnown = knownCantrips.includes(spellId);
    const next = isKnown
      ? knownCantrips.filter(id => id !== spellId)
      : [...knownCantrips, spellId];
    setKnownCantrips(next);
    persist({ knownCantrips: next });
  };

  const preparedSpellObjects = preparedSpells
    .map((id) => levelledSpells.find((s) => s.id === id || s.name === id))
    .filter(Boolean);

  const knownCantripObjects = knownCantrips
    .map((id) => cantrips.find((s) => s.id === id || s.name === id))
    .filter(Boolean);

  // Helper to check if a spell belongs to the character's class
  // 1. Loosen the filter to accept both objects and strings from the JSON
  const isClassSpell = (spell) => {
    const classList = spell.classes?.fromClassList || [];
    return classList.some(c => {
      const className = typeof c === 'string' ? c : c.name;
      return className?.toLowerCase() === character.classId?.toLowerCase();
    });
  };

  const visibleCantrips = cantrips.filter(s =>
    isClassSpell(s) && s.name.toLowerCase().includes(search.toLowerCase())
  );

  // 2. Safe fallback: If spell slots aren't manually defined in ClassStore, 
  // assume standard Full-Caster progression (Level / 2, rounded up).
  const maxSpellLevel = levelSlots.length > 0 
    ? levelSlots.reduce((max, slots, index) => (slots > 0 ? index + 1 : max), 0)
    : Math.ceil((character.level || 1) / 2);

  const visibleSpells = levelledSpells.filter(s =>
    isClassSpell(s) && 
    s.level <= maxSpellLevel && 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active Spells</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tabButton, activeTab === 'library' && styles.tabButtonActive]}
          onPress={() => setActiveTab('library')}
        >
          <Text style={[styles.tabText, activeTab === 'library' && styles.tabTextActive]}>Spell Library</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
        
        {/* --- ACTIVE TAB --- */}
        {activeTab === 'active' && (
          <>
            <Text style={sharedStyles.sectionHeader}>Spell Slots</Text>
            <View style={styles.slotGrid}>
              {levelSlots.map((max, index) => {
                const spellLevel = index + 1;
                if (!max) return null;
                const used = spellSlotsUsed[String(spellLevel)] ?? 0;
                return (
                 <TouchableOpacity
                    key={spellLevel}
                    style={[
                      styles.slotCell,
                      (max - used) === 0 && styles.slotCellEmpty  // dim when exhausted
                    ]}
                    onPress={() => toggleSlot(spellLevel)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.slotLevel}>Lv {spellLevel}</Text>
                    <Text style={[
                      styles.slotCount,
                      (max - used) === 0 && { color: colors.textMuted }
                    ]}>
                      {max - used} / {max}
                    </Text>
                  </TouchableOpacity>

                );
              })}
            </View>

            <Text style={sharedStyles.sectionHeader}>Known Cantrips</Text>
            {knownCantripObjects.length === 0 ? (
              <Text style={styles.emptyText}>No cantrips known. Add them from the Library.</Text>
            ) : (
              <View style={styles.spellGrid}>
                {knownCantripObjects.map((spell) => (
                  <TouchableOpacity
                    key={spell.id ?? spell.name}
                    style={styles.spellPanel}
                    onLongPress={() => openDetail(spell)}
                    onPress={() => toggleCantrip(spell.id ?? spell.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.spellName} numberOfLines={1}>{spell.name}</Text>
                    <Text style={styles.spellMeta}>Cantrip · {SCHOOL_NAMES[spell.school] ?? spell.school}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={styles.headerRow}>
              <Text style={sharedStyles.sectionHeader}>Prepared Spells</Text>
              <Text style={[styles.limitText, { color: preparedSpells.length >= maxPrepared ? colors.accent : colors.textMuted }]}>
                {preparedSpells.length} / {maxPrepared}
              </Text>
            </View>
            {preparedSpellObjects.length === 0 ? (
              <Text style={styles.emptyText}>No spells prepared yet. Add them from the Library.</Text>
            ) : (
              <View style={styles.spellGrid}>
                {preparedSpellObjects.map((spell) => (
                  <TouchableOpacity
                    key={spell.id ?? spell.name}
                    style={styles.spellPanel}
                    onLongPress={() => openDetail(spell)}
                    onPress={() => togglePrepared(spell.id ?? spell.name)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.spellName} numberOfLines={1}>{spell.name}</Text>
                    <Text style={styles.spellMeta}>Lv {spell.level} · {SCHOOL_NAMES[spell.school] ?? spell.school}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* --- LIBRARY TAB --- */}
        {activeTab === 'library' && (
          <>
            <View style={styles.searchBox}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search class spells..."
                placeholderTextColor={colors.textDisabled}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            <Text style={styles.librarySubheader}>Cantrips</Text>
            <View style={styles.spellGrid}>
              {visibleCantrips.map((spell) => {
                const isKnown = knownCantrips.includes(spell.id ?? spell.name);
                return (
                  <TouchableOpacity
                    key={spell.id ?? spell.name}
                    style={[styles.spellPanel, isKnown && styles.spellPanelActive]}
                    onPress={() => toggleCantrip(spell.id ?? spell.name)}
                    onLongPress={() => openDetail(spell)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.spellName} numberOfLines={1}>{spell.name}</Text>
                    <Text style={styles.spellMeta}>Cantrip</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.librarySubheader}>Levelled Spells</Text>
            <View style={styles.spellGrid}>
              {visibleSpells.map((spell) => {
                const isPrepared = preparedSpells.includes(spell.id ?? spell.name);
                return (
                  <TouchableOpacity
                    key={spell.id ?? spell.name}
                    style={[styles.spellPanel, isPrepared && styles.spellPanelActive]}
                    onPress={() => togglePrepared(spell.id ?? spell.name)}
                    onLongPress={() => openDetail(spell)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.spellName} numberOfLines={1}>{spell.name}</Text>
                    <Text style={styles.spellMeta}>Lv {spell.level}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </ScrollView>

      {/* Spell Detail Modal (Keep your existing modal code here) */}
      <Modal visible={!!detailSpell} transparent animationType="slide">
  <View style={sharedStyles.modalOverlay}>
    <View style={[sharedStyles.modalBox, { maxHeight: '85%' }]}>

      {/* Header */}
      <Text style={sharedStyles.modalTitle}>{detailSpell?.name}</Text>
      <Text style={styles.detailMeta}>
        {detailSpell?.level === 0
          ? `Cantrip · ${SCHOOL_NAMES[detailSpell?.school] ?? detailSpell?.school}`
          : `Level ${detailSpell?.level} · ${SCHOOL_NAMES[detailSpell?.school] ?? detailSpell?.school}`}
      </Text>

      <ScrollView style={{ marginTop: spacing.sm }}>
        {/* Casting Info */}
        <Text style={styles.detailMeta}>
          <Text style={{ color: colors.textMuted }}>Cast Time: </Text>
          {formatTime(detailSpell?.time)}
        </Text>
        <Text style={styles.detailMeta}>
          <Text style={{ color: colors.textMuted }}>Range: </Text>
          {formatRange(detailSpell?.range)}
        </Text>
        <Text style={styles.detailMeta}>
          <Text style={{ color: colors.textMuted }}>Components: </Text>
          {formatComponents(detailSpell?.components)}
        </Text>
        <Text style={styles.detailMeta}>
          <Text style={{ color: colors.textMuted }}>Duration: </Text>
          {formatDuration(detailSpell?.duration)}
        </Text>

        {/* Description */}
        <Text style={styles.detailText}>
          {flattenEntries(detailSpell?.entries)}
        </Text>

        {/* At Higher Levels */}
        {detailSpell?.entriesHigherLevel && (
          <Text style={styles.detailHigher}>
            At Higher Levels: {flattenEntries(detailSpell.entriesHigherLevel)}
          </Text>
        )}
      </ScrollView>

      {/* Close */}
      <TouchableOpacity
        style={[sharedStyles.primaryButton, { marginTop: spacing.md }]}
        onPress={() => setDetailSpell(null)}
      >
        <Text style={sharedStyles.primaryButtonText}>Close</Text>
      </TouchableOpacity>

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
  slotGrid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: spacing.xs,
  marginBottom: spacing.md,
},
slotCell: {
  width: '22%',           // 4 per row instead of 3
  backgroundColor: colors.surface,
  borderRadius: radius.sm,
  paddingVertical: spacing.xs,
  paddingHorizontal: 4,
  alignItems: 'center',
  ...sharedStyles.card,
},
 slotLevel: {
  ...typography.label,
  fontSize: 10,
  marginBottom: 1,
},
slotCellEmpty: {
  opacity: 0.45,
},
  slotCount: {
  ...typography.value,
  fontSize: 14,          
},
  preparedList: {
    marginBottom: spacing.md,
  },
  
  librarySubheader: {
    ...typography.label,
    color: colors.textMuted,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
// --- New Tab Navigation Styles ---
  
  // --- New 2-Column Grid Styles ---
tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceDeep,
    padding: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    borderRadius: radius.md,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  tabButtonActive: {
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  tabText: {
    ...typography.label,
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  headerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: spacing.md,
  },
  limitText: {
    ...typography.subtitle,
    paddingRight: spacing.xs,
  },

  // --- New 2-Column Grid Styles ---
  spellGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  spellPanel: {
    width: '48%', // Leaves a small gap between the two panels
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
    borderLeftWidth: 3,
    borderLeftColor: colors.surfaceDeep, // Default subtle edge
  },
  spellPanelActive: {
    borderColor: colors.accent,
    borderLeftColor: colors.accent,
    backgroundColor: colors.surfaceDeep,
  },
  spellRowPrepared: {
    borderWidth: 1,
    borderColor: colors.accent,
  },
  spellName: {
    color: colors.textPrimary,
    fontWeight: 'bold',
  },
  spellMeta: {
    ...typography.subtitle,
    fontSize: 11,
    marginTop: 2,
  },
  emptyText: {
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  searchBox: {
    backgroundColor: colors.surfaceDeep,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: spacing.sm,
  },
  searchInput: {
    color: colors.textPrimary,
    fontSize: 14,
  },
  detailMeta: {
    ...typography.subtitle,
    marginBottom: 2,
  },
  detailHigher: {
    ...typography.subtitle,
    color: colors.accent2,
    fontSize: 13,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
  detailText: {
    color: colors.textPrimary,
    fontSize: 13,
    marginTop: spacing.sm,
  },
});
