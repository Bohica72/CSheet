import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CharacterSheet from './CharacterSheet';
import LevelUpWizard from './LevelUpWizard';
import pugilistData from '../data/pugilist.json';


export default function TestLevelUp({ characterData }) {
  const [character, setCharacter] = useState(characterData);
  const [showLevelUp, setShowLevelUp] = useState(false);

  return (
    <View style={styles.container}>
      {!showLevelUp ? (
        <>
          <CharacterSheet characterData={character} />
          <TouchableOpacity 
            style={styles.levelUpButton}
            onPress={() => setShowLevelUp(true)}
          >
            <Text style={styles.levelUpButtonText}>Level Up!</Text>
          </TouchableOpacity>
        </>
      ) : (
        <LevelUpWizard
          character={character}
          classData={pugilistData}
          onComplete={(updatedCharacter) => {
            setCharacter(updatedCharacter);
            setShowLevelUp(false);
          }}
          onCancel={() => setShowLevelUp(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  levelUpButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  levelUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
