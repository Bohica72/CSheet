import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Parsed weapon data — populated on first call to loadWeapons()
let weaponMap = null;

export async function loadWeapons() {
  if (weaponMap) return weaponMap; // already loaded

  try {
    const asset = Asset.fromModule(require('../data/raw/weapons.csv'));
    await asset.downloadAsync();
    const csv = await FileSystem.readAsStringAsync(asset.localUri);

    weaponMap = {};
    const lines = csv.split('\n').map(l => l.trim()).filter(Boolean);
    // Skip header row
    for (let i = 1; i < lines.length; i++) {
      const [weapon, damage] = lines[i].split(',').map(s => s.trim());
      if (weapon && damage) {
        weaponMap[weapon.toLowerCase()] = damage;
      }
    }
    return weaponMap;
  } catch (err) {
    console.warn('Failed to load weapons CSV', err);
    weaponMap = {};
    return weaponMap;
  }
}

export function getWeaponDamage(baseItemName) {
  if (!weaponMap || !baseItemName) return null;
  return weaponMap[baseItemName.toLowerCase()] ?? null;
}

// Call this once at app startup (in App.js or CharacterList)
export async function initWeaponStore() {
  await loadWeapons();
}
