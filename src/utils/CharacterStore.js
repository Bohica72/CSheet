// src/utils/CharacterStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character } from '../models/Character';

const STORAGE_KEY = 'cs_characters_v1';

export async function loadCharacters() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    console.log('loadCharacters raw json length:', json?.length ?? 'null');
    if (!json) return [];
    const raw = JSON.parse(json);
    console.log('loadCharacters parsed', raw.length, 'characters');
    console.log('first character inventory:', JSON.stringify(raw[0]?.inventory));
    return raw.map(data => new Character(data));
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

export async function saveCharacter(character) {
  console.log('saveCharacter called for:', character.id);
  console.log('inventory to save:', JSON.stringify(character.inventory));
  const characters = await loadCharacters();
  console.log('loaded', characters.length, 'characters from storage');
  const exists = characters.find(c => c.id === character.id);
  console.log('character exists in storage:', !!exists);
  if (exists) {
    await saveCharacters(
      characters.map(c => c.id === character.id ? character : c)
    );
  } else {
    await saveCharacters([...characters, character]);
  }
  console.log('saveCharacter complete');
}

