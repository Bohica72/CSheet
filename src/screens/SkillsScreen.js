import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const ABILITIES = [
  { key: 'str', label: 'Strength' },
  { key: 'dex', label: 'Dexterity' },
  { key: 'con', label: 'Constitution' },
  { key: 'int', label: 'Intelligence' },
  { key: 'wis', label: 'Wisdom' },
  { key: 'cha', label: 'Charisma' },
];

const SKILLS = [
  { key: 'athletics',     label: 'Athletics',       ability: 'str' },
  { key: 'acrobatics',    label: 'Acrobatics',       ability: 'dex' },
  { key: 'sleightofhand', label: 'Sleight of Hand',  ability: 'dex' },
  { key: 'stealth',       label: 'Stealth',          ability: 'dex' },
  { key: 'arcana',        label: 'Arcana',           ability: 'int' },
  { key: 'history',       label: 'History',          ability: 'int' },
  { key: 'investigation', label: 'Investigation',    ability: 'int' },
  { key: 'nature',        label: 'Nature',           ability: 'int' },
  { key: 'religion',      label: 'Religion',         ability: 'int' },
  { key: 'animalhandling',label: 'Animal Handling',  ability: 'wis' },
  { key: 'insight',       label: 'Insight',          ability: 'wis' },
  { key: 'medicine',      label: 'Medicine',         ability: 'wis' },
  { key: 'perception',    label: 'Perception',       ability: 'wis' },
  { key: 'survival',      label: 'Survival',         ability: 'wis' },
  { key: 'deception',     label: 'Deception',        ability: 'cha' },
  { key: 'intimidation',  label: 'Intimidation',     ability: 'cha' },
  { key: 'performance',   label: 'Performance',      ability: 'cha' },
  { key: 'persuasion',    label: 'Persuasion',       ability: 'cha' },
];

const SAVES = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

function formatBonus(n) {
  return n >= 0 ? `+${n}` : `${n}`;
}

export default function SkillsScreen({ route }) {
  const { character } = route.params;

  return (
    <ScrollView style={styles.container}>

      {/* ABILITY SCORES */}
      <Text style={styles.sectionHeader}>Ability Scores</Text>
      <View style={styles.abilityGrid}>
        {ABILITIES.map(({ key, label }) => {
          const score = character.getAbilityScore(key);
          const mod = character.getAbilityMod(key);
          return (
            <View key={key} style={styles.abilityCard}>
              <Text style={styles.abilityLabel}>{label.slice(0, 3).toUpperCase()}</Text>
              <Text style={styles.abilityScore}>{score}</Text>
              <Text style={styles.abilityMod}>{formatBonus(mod)}</Text>
            </View>
          );
        })}
      </View>

      {/* SAVING THROWS */}
      <Text style={styles.sectionHeader}>Saving Throws</Text>
      <View style={styles.saveRow}>
        {SAVES.map((key) => {
          const bonus = character.getSaveBonus(key);
          const proficient = character.proficiencies.saves.includes(key);
          return (
            <View key={key} style={styles.saveCell}>
              <Text style={styles.saveDot}>{proficient ? '●' : '○'}</Text>
              <Text style={styles.saveLabel}>{key.toUpperCase()}</Text>
              <Text style={styles.saveBonus}>{formatBonus(bonus)}</Text>
            </View>
          );
        })}
      </View>

      {/* SKILLS */}
      <Text style={styles.sectionHeader}>Skills</Text>
      {SKILLS.map(({ key, label, ability }) => {
        const bonus = character.getSkillBonus(key);
        const proficient = character.proficiencies.skills.includes(key);
        return (
          <View key={key} style={styles.skillRow}>
            <Text style={styles.skillDot}>{proficient ? '●' : '○'}</Text>
            <Text style={styles.skillLabel}>{label}</Text>
            <Text style={styles.skillAbility}>{ability.toUpperCase()}</Text>
            <Text style={styles.skillBonus}>{formatBonus(bonus)}</Text>
          </View>
        );
      })}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e', padding: 12 },
  sectionHeader: { color: '#e0e0e0', fontSize: 16, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },

  // Ability grid
  abilityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  abilityCard: {
    width: '30%', backgroundColor: '#16213e', borderRadius: 10,
    padding: 10, alignItems: 'center', marginBottom: 8,
  },
  abilityLabel: { color: '#aaa', fontSize: 10, marginBottom: 2 },
  abilityScore: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  abilityMod: { color: '#4fc3f7', fontSize: 14, marginTop: 2 },

  // Saves
  saveRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  saveCell: {
    flex: 1, backgroundColor: '#16213e', borderRadius: 8,
    padding: 8, alignItems: 'center', marginHorizontal: 2,
  },
  saveDot: { color: '#4fc3f7', fontSize: 10 },
  saveLabel: { color: '#aaa', fontSize: 9 },
  saveBonus: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Skills
  skillRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#16213e', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4,
  },
  skillDot: { color: '#4fc3f7', fontSize: 12, marginRight: 8 },
  skillLabel: { color: '#fff', flex: 1, fontSize: 14 },
  skillAbility: { color: '#aaa', fontSize: 11, marginRight: 12 },
  skillBonus: { color: '#4fc3f7', fontSize: 16, fontWeight: 'bold', minWidth: 32, textAlign: 'right' },
});
