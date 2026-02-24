// utils/ArmorStore.js

export const ARMOR_DATA = {
  padded:            { ac: 11, type: 'light' },
  leather:           { ac: 11, type: 'light' },
  'studded leather': { ac: 12, type: 'light' },
  hide:              { ac: 12, type: 'medium' },
  'chain shirt':     { ac: 13, type: 'medium' },
  'scale mail':      { ac: 14, type: 'medium' },
  breastplate:       { ac: 14, type: 'medium' },
  'half plate':      { ac: 15, type: 'medium' },
  'ring mail':       { ac: 14, type: 'heavy' },
  'chain mail':      { ac: 16, type: 'heavy' },
  splint:            { ac: 17, type: 'heavy' },
  plate:             { ac: 18, type: 'heavy' },
  shield:            { ac: 2,  type: 'shield' }
};

export function getArmorStatsByName(rawName) {
  if (!rawName) return null;
  let name = String(rawName).trim().toLowerCase();

  // Strip magical numeric bonuses (+1, +2, etc.)
  name = name.replace(/^\+\d+\s+/, '');     // "+1 Chain Mail" -> "chain mail"
  name = name.replace(/\s+\+\d+$/, '');     // "Chain Mail +1" -> "chain mail"
  
  // Strip common 5eTools material prefixes just in case
  name = name.replace(/^(mithral|adamantine)\s+/i, '');

  return ARMOR_DATA[name] ?? null;
}