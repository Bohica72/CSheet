// src/data/featEffects.js

export const FEAT_EFFECTS = {
  'Ability Score Improvement': {
    abilityBonus: { type: 'choice', from: ['str','dex','con','int','wis','cha'], amount: 2, split: true },
    // split: true means player can put +1 into two different stats
  },
  'Great Weapon Master': {
    abilityBonus: { type: 'fixed', bonuses: { str: 1 } },
    modifiers: {
      attackBonus: { condition: 'heavyWeapon', value: 'proficiencyBonus', display: 'GWM' },
    },
  },
  'Heavily Armored': {
    abilityBonus: { type: 'choice', from: ['con', 'str'], amount: 1 },
    armorProficiencies: ['heavy'],
  },
  'Lightly Armored': {
    abilityBonus: { type: 'choice', from: ['dex', 'str'], amount: 1 },
    armorProficiencies: ['light'],
  },
  'Moderately Armored': {
    abilityBonus: { type: 'choice', from: ['dex', 'str'], amount: 1 },
    armorProficiencies: ['medium'],
  },
  'Skilled': {
    skillProficiencies: { type: 'choice', count: 3 },
  },
  'Tavern Brawler': {
    abilityBonus: { type: 'choice', from: ['str', 'con'], amount: 1 },
  },
  'Tough': {
    // +2 HP per level — handled specially at level-up, flagged here
    hpBonusPerLevel: 2,
  },
  'War Caster': {
    // No stat changes — purely mechanical advantage on concentration
    // Flagged for future spellcasting logic
    modifiers: { concentrationAdvantage: true },
  },
};

// Apply a feat's stat changes directly to a character object
// Returns updated character — call this on feat confirmation
export function applyFeatEffects(character, featName, choices = {}) {
  const effect = FEAT_EFFECTS[featName];
  if (!effect) return character; // flavour-only feat, nothing to apply

  let updated = { ...character };

  // Apply fixed ability bonus
  if (effect.abilityBonus?.type === 'fixed') {
    const abilities = { ...updated.abilities };
    for (const [stat, val] of Object.entries(effect.abilityBonus.bonuses)) {
      abilities[stat] = (abilities[stat] ?? 0) + val;
    }
    updated.abilities = abilities;
  }

  // Apply chosen ability bonus — choices.abilityStat or choices.abilityStats[]
  if (effect.abilityBonus?.type === 'choice') {
    const abilities = { ...updated.abilities };
    const chosen = Array.isArray(choices.abilityStats)
      ? choices.abilityStats
      : [choices.abilityStat].filter(Boolean);
    for (const stat of chosen) {
      if (stat) abilities[stat] = (abilities[stat] ?? 0) + 1;
    }
    updated.abilities = abilities;
  }

  // Apply armor proficiencies
  if (effect.armorProficiencies) {
    updated.proficiencies = {
      ...updated.proficiencies,
      armor: [
        ...new Set([
          ...(updated.proficiencies?.armor ?? []),
          ...effect.armorProficiencies,
        ]),
      ],
    };
  }

  // Apply HP bonus per level (Tough)
  if (effect.hpBonusPerLevel) {
    const bonus = effect.hpBonusPerLevel * (updated.level ?? 1);
    updated.hpMax     = (updated.hpMax ?? 0) + bonus;
    updated.hpCurrent = (updated.hpCurrent ?? 0) + bonus;
  }

  return updated;
}
