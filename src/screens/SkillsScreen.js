import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, radius, typography, shadows, sharedStyles } from '../styles/theme';

const ABILITIES = [
  { key: 'str', label: 'Strength' },
  { key: 'dex', label: 'Dexterity' },
  { key: 'con', label: 'Constitution' },
  { key: 'int', label: 'Intelligence' },
  { key: 'wis', label: 'Wisdom' },
  { key: 'cha', label: 'Charisma' },
];

const SKILLS = [
  { key: 'athletics',      label: 'Athletics',       ability: 'str' },
  { key: 'acrobatics',     label: 'Acrobatics',       ability: 'dex' },
  { key: 'sleightofhand',  label: 'Sleight of Hand',  ability: 'dex' },
  { key: 'stealth',        label: 'Stealth',          ability: 'dex' },
  { key: 'arcana',         label: 'Arcana',           ability: 'int' },
  { key: 'history',        label: 'History',          ability: 'int' },
  { key: 'investigation',  label: 'Investigation',    ability: 'int' },
  { key: 'nature',         label: 'Nature',           ability: 'int' },
  { key: 'religion',       label: 'Religion',         ability: 'int' },
  { key: 'animalhandling', label: 'Animal Handling',  ability: 'wis' },
  { key: 'insight',        label: 'Insight',          ability: 'wis' },
  { key: 'medicine',       label: 'Medicine',         ability: 'wis' },
  { key: 'perception',     label: 'Perception',       ability: 'wis' },
  { key: 'survival',       label: 'Survival',         ability: 'wis' },
  { key: 'deception',      label: 'Deception',        ability: 'cha' },
  { key: 'intimidation',   label: 'Intimidation',     ability: 'cha' },
  { key: 'performance',    label: 'Performance',      ability: 'cha' },
  { key: 'persuasion',     label: 'Persuasion',       ability: 'cha' },
];

function formatBonus(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

export default function SkillsScreen({ route }) {
  const { character } = route.params;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
    >

      {/* ABILITY SCORES */}
      <Text style={sharedStyles.sectionHeader}>Ability Scores</Text>
      <View style={styles.abilityGrid}>
        {ABILITIES.map(({ key, label }) => {
          const score   = character.getAbilityScore(key);
          const mod     = character.getAbilityMod(key);
          const acColor = colors.ability[key];
          return (
            <View key={key} style={[styles.abilityCard, { borderTopColor: acColor }]}>
              <Text style={[styles.abilityLabel, { color: acColor }]}>
                {label.slice(0, 3).toUpperCase()}
              </Text>
              <Text style={styles.abilityScore}>{score}</Text>
              <View style={[styles.abilityModBadge, { backgroundColor: acColor }]}>
                <Text style={styles.abilityMod}>{formatBonus(mod)}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {/* SAVING THROWS */}
      <Text style={sharedStyles.sectionHeader}>Saving Throws</Text>
      <View style={styles.saveRow}>
        {ABILITIES.map(({ key }) => {
          const bonus     = character.getSaveBonus(key);
          const proficient = character.proficiencies.saves.includes(key);
          const acColor   = colors.ability[key];
          return (
            <View key={key} style={[styles.saveCell, proficient && { borderColor: acColor }]}>
              <Text style={[styles.saveDot, { color: proficient ? acColor : colors.textDisabled }]}>
                {proficient ? '●' : '○'}
              </Text>
              <Text style={styles.saveLabel}>{key.toUpperCase()}</Text>
              <Text style={[styles.saveBonus, { color: proficient ? acColor : colors.textPrimary }]}>
                {formatBonus(bonus)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* SKILLS */}
      <Text style={sharedStyles.sectionHeader}>Skills</Text>
      {SKILLS.map(({ key, label, ability }) => {
        const bonus      = character.getSkillBonus(key);
        const proficient = character.proficiencies.skills.includes(key);
        const acColor    = colors.ability[ability];
        return (
          <View key={key} style={[styles.skillRow, proficient && styles.skillRowProficient]}>
            <Text style={[styles.skillDot, { color: proficient ? acColor : colors.textDisabled }]}>
              {proficient ? '●' : '○'}
            </Text>
            <Text style={styles.skillLabel}>{label}</Text>
            <View style={[styles.abilityTag, { backgroundColor: acColor + '33' }]}>
              <Text style={[styles.abilityTagText, { color: acColor }]}>
                {ability.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.skillBonus, { color: proficient ? acColor : colors.textPrimary }]}>
              {formatBonus(bonus)}
            </Text>
          </View>
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },

  // Ability grid
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  abilityCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderTopWidth: 3,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
    ...shadows.card,
  },
  abilityLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  abilityScore: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  abilityModBadge: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  abilityMod: {
    fontSize: 13,
    fontWeight: 'bold',
    color: colors.background,
  },

  // Saves
  saveRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  saveCell: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.surfaceDeep,
    ...shadows.card,
  },
  saveDot: {
    fontSize: 10,
    marginBottom: 2,
  },
  saveLabel: {
    ...typography.label,
    marginBottom: 2,
  },
  saveBonus: {
    fontSize: 15,
    fontWeight: 'bold',
  },

  // Skills
  skillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: 4,
    borderLeftWidth: 2,
    borderLeftColor: 'transparent',
  },
  skillRowProficient: {
    borderLeftColor: colors.accent,
  },
  skillDot: {
    fontSize: 12,
    marginRight: spacing.sm,
    width: 14,
  },
  skillLabel: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 13,
  },
  abilityTag: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  abilityTagText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  skillBonus: {
    fontSize: 15,
    fontWeight: 'bold',
    minWidth: 36,
    textAlign: 'right',
  },
});
