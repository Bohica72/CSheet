// src/utils/CharacterStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from '../models/Character';

const STORAGE_KEY = 'cs_characters_v1';

export async function loadCharacters() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (!json) return [];
    const raw = JSON.parse(json);
    return raw.map(data => new Character(data));
  } catch (err) {
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

export async function saveCharacter(character) {
  const characters = await loadCharacters();
  const exists = characters.find(c => c.id === character.id);
  if (exists) {
    await saveCharacters(
      characters.map(c => c.id === character.id ? character : c)
    );
  } else {
    await saveCharacters([...characters, character]);
  }
}

