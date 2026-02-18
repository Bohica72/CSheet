export class Character {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.abilities = data.abilities;
    this.proficiencyBonus = data.proficiencyBonus;
    this.proficiencies = data.proficiencies;
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
      // ... add more skill->ability mappings
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
