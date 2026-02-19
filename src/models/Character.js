import pugilistData from '../data/pugilist.json';

export class Character {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.level = data.level ?? 1;
    this.classId = data.classId ?? 'pugilist';
    this.abilities = data.abilities;
    this.moxieCurrent = data.moxieCurrent ?? null; // null triggers fallback to max
    this.subclassId = data.subclassId ?? null;
    this.proficiencyBonus = data.proficiencyBonus;
    this.proficiencies = data.proficiencies;
    this.bonuses = data.bonuses ?? {};
    this.hpMax = data.hpMax ?? 10;
    this.hpCurrent = data.hpCurrent ?? this.hpMax;
    this.hpTemp = data.hpTemp ?? 0;

    // Combat
    this.speed = data.speed ?? 30;
    this.inspiration = data.inspiration ?? 0;

    // Attacks
    this.attacks = data.attacks ?? [];
  }

  // Calculate ability modifier
  getAbilityMod(ability) {
    return Math.floor((this.abilities[ability] - 10) / 2);
  }

  // Calculate save bonus
  getSaveBonus(ability) {
    const mod = this.getAbilityMod(ability);
    const proficient = this.proficiencies.saves.includes(ability);
    return mod + (proficient ? this.proficiencyBonus : 0);
  }

  // Calculate skill bonus
  getSkillBonus(skill) {
    const abilityMap = {
     athletics: 'str',
      acrobatics: 'dex',
      stealth: 'dex',
      perception: 'wis',   // ← add this
      insight: 'wis',
      persuasion: 'cha',
      deception: 'cha',
      intimidation: 'cha',
      investigation: 'int',
      history: 'int',
      arcana: 'int',
      nature: 'int',
      religion: 'int',
      sleightofhand: 'dex',
      animalhandling: 'wis',
      medicine: 'wis',
      survival: 'wis',
      performance: 'cha',
    };
    const ability = abilityMap[skill];
    const mod = this.getAbilityMod(ability);
    const proficient = this.proficiencies.skills.includes(skill);
    return mod + (proficient ? this.proficiencyBonus : 0);
  }

  getAbilityScore(ability) {
  const base = this.abilities?.[ability] ?? 10;
  const bonus = this.bonuses?.abilities?.[ability] ?? 0;
  return base + bonus;
}

getMoxieMax() {
    const table = pugilistData.moxiepoints;
    return table?.[this.level] ?? 0;
  }

  getMoxieCurrent() {
    return this.moxieCurrent ?? this.getMoxieMax();
  }

  getHitDice() {
    // Returns e.g. "3d10" based on level and class hit die
    const faces = pugilistData.hitDie ?? 10;
    return `${this.level}d${faces}`;
  }

  getInitiativeBonus() {
    return this.getAbilityMod('dex');
  }

  getPassivePerception() {
    return 10 + this.getSkillBonus('perception');
  }

getAbilityMod(ability) {
  const score = this.getAbilityScore(ability);
  return Math.floor((score - 10) / 2);
}

getArmorClass() {
  // Default fallback: 10 + DEX
  const dexMod = this.getAbilityMod('dex');
  let ac = 10 + dexMod;

  // Iron Chin AC mode (12 + CON mod under its conditions) [file:64]
  if (this.bonuses?.acFormula === 'iron_chin_12_plus_con') {
    const conMod = this.getAbilityMod('con');
    ac = 12 + conMod;
  }

  return ac;
}

}
