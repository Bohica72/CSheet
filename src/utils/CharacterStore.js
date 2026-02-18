// src/utils/CharacterStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cs_characters_v1';

export async function loadCharacters() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    return JSON.parse(json);
  } catch (err) {
    console.warn('Failed to load characters', err);
    return [];
  }
}

export async function saveCharacters(characters) {
  try {
    const json = JSON.stringify(characters);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (err) {
    console.warn('Failed to save characters', err);
  }
}

export async function addCharacter(character) {
  const characters = await loadCharacters();
  const updated = [...characters, character];
  await saveCharacters(updated);
  return updated;
}

export async function updateCharacter(updatedCharacter) {
  const characters = await loadCharacters();
  const updated = characters.map(c => (c.id === updatedCharacter.id ? updatedCharacter : c));
  await saveCharacters(updated);
  return updated;
}

export async function deleteCharacter(id) {
  const characters = await loadCharacters();
  const updated = characters.filter(c => c.id !== id);
  await saveCharacters(updated);
  return updated;
}
