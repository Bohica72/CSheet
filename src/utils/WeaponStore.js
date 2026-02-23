import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

// Parsed weapon data — populated on first call to loadWeapons()
let weaponMap = null;

export const WEAPON_DAMAGE = {
  battleaxe:      { dice: '1d8',  type: 'slashing' },
  flail:          { dice: '1d8',  type: 'bludgeoning' },
  glaive:         { dice: '1d10', type: 'slashing' },
  greataxe:       { dice: '1d12', type: 'slashing' },
  greatsword:     { dice: '2d6',  type: 'slashing' },
  halberd:        { dice: '1d10', type: 'slashing' },
  lance:          { dice: '1d12', type: 'piercing' },
  longsword:      { dice: '1d8',  type: 'slashing' },

  maul:           { dice: '2d6',  type: 'bludgeoning' },
  morningstar:    { dice: '1d8',  type: 'piercing' },
  pike:           { dice: '1d10', type: 'piercing' },
  rapier:         { dice: '1d8',  type: 'piercing' },
  scimitar:       { dice: '1d6',  type: 'slashing' },
  shortsword:     { dice: '1d6',  type: 'piercing' },
  trident:        { dice: '1d6',  type: 'piercing' },
  'war pick':     { dice: '1d8',  type: 'piercing' },
  warhammer:      { dice: '1d8',  type: 'bludgeoning' },
  whip:           { dice: '1d4',  type: 'slashing' },

  blowgun:        { dice: '1',    type: 'piercing' },
  'hand crossbow':   { dice: '1d6',  type: 'piercing' },
  'heavy crossbow':  { dice: '1d10', type: 'piercing' },
  longbow:        { dice: '1d8',  type: 'piercing' },

  club:           { dice: '1d4',  type: 'bludgeoning' },
  dagger:         { dice: '1d4',  type: 'piercing' },
  greatclub:      { dice: '1d8',  type: 'bludgeoning' },
  handaxe:        { dice: '1d6',  type: 'slashing' },
  javelin:        { dice: '1d6',  type: 'piercing' },
  'light hammer': { dice: '1d4',  type: 'bludgeoning' },
  mace:           { dice: '1d6',  type: 'bludgeoning' },
  quarterstaff:   { dice: '1d6',  type: 'bludgeoning' },
  sickle:         { dice: '1d4',  type: 'slashing' },
  spear:          { dice: '1d6',  type: 'piercing' },

  'light crossbow': { dice: '1d8', type: 'piercing' },
  dart:           { dice: '1d4',  type: 'piercing' },
  shortbow:       { dice: '1d6',  type: 'piercing' },
  sling:          { dice: '1d4',  type: 'bludgeoning' },
};

export function getWeaponDamageByName(rawName) {
  if (!rawName) return null;
  let name = String(rawName).trim();

  // Handle "+1 Longsword", "Longsword +1", etc. → "longsword"
  name = name.replace(/^\+\d+\s+/, '');      // "+1 Longsword" → "Longsword"
  name = name.replace(/\s+\+\d+$/, '');      // "Longsword +1" → "Longsword"

  const key = name.toLowerCase();
  return WEAPON_DAMAGE[key] ?? null;
}


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
