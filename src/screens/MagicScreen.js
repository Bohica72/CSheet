import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, sharedStyles } from '../styles/theme';
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

const flattenEntries = (entries = []) =>
  entries.map((e) => {
    if (typeof e === 'string') return cleanText(e);
    if (e.type === 'entries') {
      return `${e.name}:\n${flattenEntries(e.entries).join('\n')}`;
    }
    return '';
  }).filter(Boolean).join('\n\n');

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

  const [spellSlotsUsed, setSpellSlotsUsed] = useState(character.spellSlotsUsed ?? {});
  const [preparedSpells, setPreparedSpells] = useState(character.preparedSpells ?? []);
  const [knownCantrips, setKnownCantrips] = useState(character.knownCantrips ?? []);
  const [search, setSearch] = useState('');
  const [detailSpell, setDetailSpell] = useState(null);

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
    const next = used >= max ? 0 : used + 1;
    const updated = { ...spellSlotsUsed, [key]: next };
    setSpellSlotsUsed(updated);
    persist({ spellSlotsUsed: updated });
  };

  const togglePrepared = (spellId) => {
    const isPrepared = preparedSpells.includes(spellId);
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

  const visibleCantrips = cantrips.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const visibleSpells = levelledSpells.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>

        {/* Spell slots */}
        <Text style={sharedStyles.sectionHeader}>Spell Slots</Text>
        <View style={styles.slotGrid}>
          {levelSlots.map((max, index) => {
            const spellLevel = index + 1;
            if (!max) return null;
            const used = spellSlotsUsed[String(spellLevel)] ?? 0;
            return (
              <TouchableOpacity
                key={spellLevel}
                style={styles.slotCell}
                onPress={() => toggleSlot(spellLevel)}
                activeOpacity={0.8}
              >
                <Text style={styles.slotLevel}>Lv {spellLevel}</Text>
                <Text style={styles.slotCount}>{used} / {max}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cantrips — known */}
        <Text style={sharedStyles.sectionHeader}>Cantrips</Text>
        {knownCantripObjects.length === 0 ? (
          <Text style={styles.emptyText}>No cantrips known. Add them from the Library below.</Text>
        ) : (
          <View style={styles.preparedList}>
            {knownCantripObjects.map((spell) => (
              <TouchableOpacity
                key={spell.id ?? spell.name}
                style={styles.preparedRow}
                onLongPress={() => openDetail(spell)}
                onPress={() => toggleCantrip(spell.id ?? spell.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.spellName}>{spell.name}</Text>
                <Text style={styles.spellMeta}>
                  Cantrip · {SCHOOL_NAMES[spell.school] ?? spell.school}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Prepared spells */}
        <Text style={sharedStyles.sectionHeader}>Prepared Spells</Text>
        {preparedSpellObjects.length === 0 ? (
          <Text style={styles.emptyText}>No spells prepared yet. Add them from the Library below.</Text>
        ) : (
          <View style={styles.preparedList}>
            {preparedSpellObjects.map((spell) => (
              <TouchableOpacity
                key={spell.id ?? spell.name}
                style={styles.preparedRow}
                onLongPress={() => openDetail(spell)}
                onPress={() => togglePrepared(spell.id ?? spell.name)}
                activeOpacity={0.8}
              >
                <Text style={styles.spellName}>{spell.name}</Text>
                <Text style={styles.spellMeta}>
                  Lv {spell.level} · {SCHOOL_NAMES[spell.school] ?? spell.school}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Spell Library */}
        <Text style={sharedStyles.sectionHeader}>Spell Library</Text>
        <View style={styles.searchBox}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search spells..."
            placeholderTextColor={colors.textDisabled}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Cantrips in library */}
        <Text style={styles.librarySubheader}>Cantrips</Text>
        {visibleCantrips.map((spell) => {
          const isKnown = knownCantrips.includes(spell.id ?? spell.name);
          return (
            <TouchableOpacity
              key={spell.id ?? spell.name}
              style={[styles.spellRow, isKnown && styles.spellRowPrepared]}
              onPress={() => toggleCantrip(spell.id ?? spell.name)}
              onLongPress={() => openDetail(spell)}
              activeOpacity={0.8}
            >
              <Text style={styles.spellName}>{spell.name}</Text>
              <Text style={styles.spellMeta}>
                Cantrip · {SCHOOL_NAMES[spell.school] ?? spell.school}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Levelled spells in library */}
        <Text style={styles.librarySubheader}>Spells</Text>
        {visibleSpells.map((spell) => {
          const isPrepared = preparedSpells.includes(spell.id ?? spell.name);
          return (
            <TouchableOpacity
              key={spell.id ?? spell.name}
              style={[styles.spellRow, isPrepared && styles.spellRowPrepared]}
              onPress={() => togglePrepared(spell.id ?? spell.name)}
              onLongPress={() => openDetail(spell)}
              activeOpacity={0.8}
            >
              <Text style={styles.spellName}>{spell.name}</Text>
              <Text style={styles.spellMeta}>
                Lv {spell.level} · {SCHOOL_NAMES[spell.school] ?? spell.school}
              </Text>
            </TouchableOpacity>
          );
        })}

      </ScrollView>

      {/* Spell detail modal */}
      <Modal visible={!!detailSpell} transparent animationType="slide">
        <View style={sharedStyles.modalOverlay}>
          <View style={sharedStyles.modalBox}>
            <Text style={sharedStyles.modalTitle}>
              {detailSpell?.name ?? 'Spell'}
            </Text>
            {detailSpell && (
              <ScrollView style={{ maxHeight: 340 }}>
                <Text style={styles.detailMeta}>
                  {detailSpell.level === 0 ? 'Cantrip' : `Level ${detailSpell.level}`}
                  {' · '}{SCHOOL_NAMES[detailSpell.school] ?? detailSpell.school}
                  {detailSpell.meta?.ritual ? ' (Ritual)' : ''}
                </Text>
                <Text style={styles.detailMeta}>Casting Time: {formatTime(detailSpell.time)}</Text>
                <Text style={styles.detailMeta}>Range: {formatRange(detailSpell.range)}</Text>
                <Text style={styles.detailMeta}>Components: {formatComponents(detailSpell.components)}</Text>
                <Text style={styles.detailMeta}>Duration: {formatDuration(detailSpell.duration)}</Text>
                <Text style={styles.detailText}>{flattenEntries(detailSpell.entries)}</Text>
                {detailSpell.entriesHigherLevel?.map((hl, i) => (
                  <Text key={i} style={styles.detailHigher}>
                    {hl.name}: {flattenEntries(hl.entries)}
                  </Text>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity onPress={() => setDetailSpell(null)}>
              <Text style={sharedStyles.cancelText}>Close</Text>
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
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    ...sharedStyles.card,
  },
  slotLevel: {
    ...typography.label,
    marginBottom: 2,
  },
  slotCount: {
    ...typography.value,
  },
  preparedList: {
    marginBottom: spacing.md,
  },
  preparedRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent2,
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
  spellRow: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderWidth: 1,
    borderColor: 'transparent',
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
