import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LevelUp } from '../models/LevelUp';

export default function LevelUpWizard({ character, classData, onComplete, onCancel }) {
  const levelUp = new LevelUp(character, classData);
  const [choices, setChoices] = useState({});
  const [step, setStep] = useState(0);

  const newFeatures = levelUp.getNewFeatures();
  const grantsASI = levelUp.grantsASI();
  const grantsSubclass = levelUp.grantsSubclass();
  const scalingValues = levelUp.getScalingValues();
  const hpGain = levelUp.calculateHPGain();

  const abilities = ['str', 'dex', 'con', 'int', 'wis', 'cha'];
  const abilityNames = {
    str: 'Strength',
    dex: 'Dexterity',
    con: 'Constitution',
    int: 'Intelligence',
    wis: 'Wisdom',
    cha: 'Charisma'
  };

  const handleASIChoice = (ability1, ability2) => {
    setChoices({
      ...choices,
      asiChoice: {
        type: 'ability_score',
        abilities: [ability1, ability2]
      }
    });
  };

  const handleSubclassChoice = (subclass) => {
    setChoices({
      ...choices,
      subclass: subclass.id
    });
  };

  const handleComplete = () => {
    const updatedCharacter = levelUp.applyLevelUp(choices);
    onComplete(updatedCharacter);
  };

  // Render different steps
  const renderSummary = () => (
    <View>
      <Text style={styles.title}>Level Up to {levelUp.nextLevel}!</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>You Gain:</Text>
        <Text style={styles.gainText}>• +{hpGain} Hit Points</Text>
        {levelUp.getNewProficiencyBonus() > character.proficiencyBonus && (
          <Text style={styles.gainText}>
            • Proficiency Bonus: +{levelUp.getNewProficiencyBonus()}
          </Text>
        )}
        
        {Object.entries(scalingValues).map(([key, value]) => (
          <Text key={key} style={styles.gainText}>
            • {key.replace(/_/g, ' ')}: {value}
          </Text>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>New Features:</Text>
        {newFeatures.map(feature => (
          <View key={feature.id} style={styles.featureBox}>
            <Text style={styles.featureName}>{feature.name}</Text>
            <Text style={styles.featureDesc}>{feature.description.substring(0, 200)}...</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={() => grantsASI ? setStep(1) : grantsSubclass ? setStep(2) : handleComplete()}
      >
        <Text style={styles.buttonText}>
          {grantsASI ? 'Choose ASI/Feat' : grantsSubclass ? 'Choose Subclass' : 'Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderASIChoice = () => (
    <View>
      <Text style={styles.title}>Ability Score Improvement</Text>
      <Text style={styles.subtitle}>Choose two abilities to increase by +1 each</Text>

      <View style={styles.abilityGrid}>
        {abilities.map(ability => (
          <TouchableOpacity
            key={ability}
            style={[
              styles.abilityButton,
              choices.asiChoice?.abilities?.includes(ability) && styles.abilityButtonSelected
            ]}
            onPress={() => {
              const current = choices.asiChoice?.abilities || [];
              if (current.includes(ability)) {
                handleASIChoice(...current.filter(a => a !== ability));
              } else if (current.length < 2) {
                handleASIChoice(...[...current, ability]);
              }
            }}
          >
            <Text style={styles.abilityButtonText}>{abilityNames[ability]}</Text>
            <Text style={styles.abilityScore}>{character.abilities[ability]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.button, (!choices.asiChoice || choices.asiChoice.abilities.length < 2) && styles.buttonDisabled]}
        disabled={!choices.asiChoice || choices.asiChoice.abilities.length < 2}
        onPress={() => grantsSubclass ? setStep(2) : handleComplete()}
      >
        <Text style={styles.buttonText}>
          {grantsSubclass ? 'Next: Choose Subclass' : 'Complete'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderSubclassChoice = () => (
    <View>
      <Text style={styles.title}>Choose Your Subclass</Text>
      
      <ScrollView style={styles.subclassList}>
        {classData.subclasses.map(subclass => (
          <TouchableOpacity
            key={subclass.id}
            style={[
              styles.subclassButton,
              choices.subclass === subclass.id && styles.subclassButtonSelected
            ]}
            onPress={() => handleSubclassChoice(subclass)}
          >
            <Text style={styles.subclassName}>{subclass.name}</Text>
            <Text style={styles.subclassShort}>{subclass.shortName}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity
        style={[styles.button, !choices.subclass && styles.buttonDisabled]}
        disabled={!choices.subclass}
        onPress={handleComplete}
      >
        <Text style={styles.buttonText}>Complete Level Up</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {step === 0 && renderSummary()}
      {step === 1 && renderASIChoice()}
      {step === 2 && renderSubclassChoice()}

      <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
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
    marginBottom: 8,
  },
  gainText: {
    fontSize: 16,
    marginVertical: 4,
  },
  featureBox: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  featureName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
  },
  abilityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  abilityButton: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  abilityButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  abilityButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  abilityScore: {
    fontSize: 24,
    marginTop: 4,
  },
  subclassList: {
    marginBottom: 16,
  },
  subclassButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  subclassButtonSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  subclassName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  subclassShort: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
});
