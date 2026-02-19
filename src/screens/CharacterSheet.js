eimport React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Character } from '../models/Character';

export default function CharacterSheet({ characterData }) {
  const character = new Character(characterData);

  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const abilityNames = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma'
  };

  const skills = [
    { name: 'Athletics', ability: 'str', key: 'athletics' },
    { name: 'Acrobatics', ability: 'dex', key: 'acrobatics' },
    { name: 'Stealth', ability: 'dex', key: 'stealth' },
    { name: 'Intimidation', ability: 'cha', key: 'intimidation' },
    { name: 'Perception', ability: 'wis', key: 'perception' }
  ];

  const formatBonus = (value) => {
    return value >= 0 ? `+${value}` : `${value}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{character.name}</Text>
        <Text style={styles.classInfo}>
          {characterData.race} {characterData.classes[0].className} {characterData.classes[0].level}
        </Text>
      </View>

      {/* HP */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hit Points</Text>
        <Text style={styles.hpText}>
          {characterData.hitPoints.current} / {characterData.hitPoints.max}
          <Text style={styles.sectionTitle}>Armor Class</Text>
<Text style={styles.hpText}>{character.getArmorClass()}</Text>

        </Text>
      </View>

      {/* Abilities */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abilities</Text>
        <View style={styles.abilityGrid}>
          {abilities.map(ability => (
            <View key={ability} style={styles.abilityBox}>
              <Text style={styles.abilityName}>{ability.toUpperCase()}</Text>
              <Text style={styles.abilityScore}>{character.abilities[ability]}</Text>
              <Text style={styles.abilityMod}>
                {formatBonus(character.getAbilityMod(ability))}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Saving Throws */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Saving Throws</Text>
        {abilities.map(ability => {
          const bonus = character.getSaveBonus(ability);
          const proficient = character.proficiencies.saves.includes(ability);
          return (
            <View key={ability} style={styles.row}>
              <Text style={styles.profMarker}>{proficient ? '●' : '○'}</Text>
              <Text style={styles.rowLabel}>{abilityNames[ability]}</Text>
              <Text style={styles.rowValue}>{formatBonus(bonus)}</Text>
            </View>
          );
        })}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Skills</Text>
        {skills.map(skill => {
          const mod = character.getAbilityMod(skill.ability);
          const proficient = character.proficiencies.skills.includes(skill.key);
          const bonus = mod + (proficient ? character.proficiencyBonus : 0);
          return (
            <View key={skill.key} style={styles.row}>
              <Text style={styles.profMarker}>{proficient ? '●' : '○'}</Text>
              <Text style={styles.rowLabel}>{skill.name}</Text>
              <Text style={styles.rowValue}>{formatBonus(bonus)}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  classInfo: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  hpText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d32f2f',
  },
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  abilityBox: {
    width: '30%',
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  abilityName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
  abilityScore: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  abilityMod: {
    fontSize: 16,
    color: '#666',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profMarker: {
    fontSize: 16,
    marginRight: 8,
    width: 20,
  },
  rowLabel: {
    flex: 1,
    fontSize: 16,
  },
  rowValue: {
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
});
