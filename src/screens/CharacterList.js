import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { loadCharacters, addCharacter } from '../utils/CharacterStore';
import { sampleCharacter } from '../data/sampleCharacter';
import { Character } from '../models/Character'; // ← add this import


export default function CharacterList({ onSelectCharacter }) {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await loadCharacters();
      // If no data, seed with sample character
      if (data.length === 0) {
        const seeded = { ...sampleCharacter, id: 'char_' + Date.now() };
        const updated = await addCharacter(seeded);
        setCharacters(updated);
      } else {
        setCharacters(data);
      }
      setLoading(false);
    })();
  }, []);

    const handleAdd = async () => {
    const newChar = {
      ...sampleCharacter,
      id: 'char_' + Date.now(),
      name: 'New Pugilist ' + (characters.length + 1),
    };
    const updated = await addCharacter(newChar);
    setCharacters(updated);
  };


  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Loading characters...</Text>
      </View>
    );
  }

  if (characters.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No characters yet.</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Create First Character</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={characters}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() => onSelectCharacter(new Character(item))}
          >
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.sub}>
              {item.race} {item.classes[0].className} {item.classes[0].level}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.addFab} onPress={handleAdd}>
        <Text style={styles.addFabText}>＋</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f5f5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 18, marginBottom: 12 },
  item: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  name: { fontSize: 18, fontWeight: 'bold' },
  sub: { fontSize: 14, color: '#666', marginTop: 4 },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  addFab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  addFabText: { color: '#fff', fontSize: 32, lineHeight: 32 },
});
