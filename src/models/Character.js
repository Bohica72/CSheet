import { getEquippedBonuses } from '../utils/BonusEngine';
import { getItemByName } from '../utils/ItemStore';
import { PUGILIST_CLASS } from '../data/pugilist_data';

export class Character {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.level = data.level ?? 1;
    this.classId = data.classId ?? 'pugilist';
    this.subclassId = data.subclassId ?? null;
    this.abilities = data.abilities;
    this.proficiencyBonus = data.proficiencyBonus;
    this.proficiencies = data.proficiencies;
    this.bonuses = data.bonuses ?? {};
    this.moxieCurrent = data.moxieCurrent ?? null;

    // HP
    this.hpMax = data.hpMax ?? 10;
    this.hpCurrent = data.hpCurrent ?? this.hpMax;
    this.hpTemp = data.hpTemp ?? 0;
    this.hitDiceRemaining = data.hitDiceRemaining ?? this.level;

    // Combat
    this.speed = data.speed ?? 30;
    this.inspiration = data.inspiration ?? 0;

    // Inventory & attacks
    this.inventory = data.inventory ?? [];
    this.attunedItems = data.attunedItems ?? [];
    this.attacks = data.attacks ?? [];
  }

  // --- Ability scores ---

  getAbilityScore(ability) {
    const base = this.abilities?.[ability] ?? 10;
    const bonus = this.bonuses?.abilities?.[ability] ?? 0;
    return base + bonus;
  }

  getAbilityMod(ability) {
    const score = this.getAbilityScore(ability);
    return Math.floor((score - 10) / 2);
  }

  // --- Saves & skills ---

  getSaveBonus(ability) {
    const mod = this.getAbilityMod(ability);
    const proficient = this.proficiencies.saves.includes(ability);
    return mod + (proficient ? this.proficiencyBonus : 0);
  }

  getSkillBonus(skill) {
    const abilityMap = {
      athletics:      'str',
      acrobatics:     'dex',
      sleightofhand:  'dex',
      stealth:        'dex',
      arcana:         'int',
      history:        'int',
      investigation:  'int',
      nature:         'int',
      religion:       'int',
      animalhandling: 'wis',
      insight:        'wis',
      medicine:       'wis',
      perception:     'wis',
      survival:       'wis',
      deception:      'cha',
      intimidation:   'cha',
      performance:    'cha',
      persuasion:     'cha',
    };
    const ability = abilityMap[skill];
    const mod = this.getAbilityMod(ability);
    const proficient = this.proficiencies.skills.includes(skill);
    return mod + (proficient ? this.proficiencyBonus : 0);
  }

  // --- Derived stats ---

  getInitiativeBonus() {
    return this.getAbilityMod('dex');
  }

  getPassivePerception() {
    return 10 + this.getSkillBonus('perception');
  }

  getArmorClass() {
    const dexMod = this.getAbilityMod('dex');
    let ac = 10 + dexMod;
    // Iron Chin: 12 + CON mod (Pugilist level 1 feature)
    if (this.bonuses?.acFormula === 'iron_chin_12_plus_con') {
      ac = 12 + this.getAbilityMod('con');
    }
    const { bonusAC } = getEquippedBonuses(this.inventory);
    return ac + bonusAC;
  }

  getAttackBonus(baseBonus = 0) {
    const { bonusWeapon } = getEquippedBonuses(this.inventory);
    return baseBonus + bonusWeapon;
  }

  // --- Moxie ---

  getMoxieMax() {
    const table = PUGILIST_CLASS.levels[this.level];
    return table?.moxiePoints ?? 0;
  }

  getMoxieCurrent() {
    return this.moxieCurrent ?? this.getMoxieMax();
  }

  // --- Hit dice ---

  getHitDice() {
    // e.g. "5d8" — level × hit die type
    const faces = PUGILIST_CLASS.hitDie ?? 8;
    return `${this.level}d${faces}`;
  }

  getFisticuffsDie() {
    // Scales with level: 1d6 → 1d8 → 1d10 → 1d12
    return PUGILIST_CLASS.levels[this.level]?.fisticuffs ?? '1d6';
  }

  // --- Attack helpers ---

  getMeleeAttackBonus() {
    return this.getAbilityMod('str') + this.proficiencyBonus;
  }

  getEquippedWeaponAttacks() {
    return this.inventory
      .filter(entry => {
        if (!entry.equipped) return false;
        const item = getItemByName(entry.itemName);
        return item?.ObjectType === 'Weapon';
      })
      .map(entry => {
        const item = getItemByName(entry.itemName);
        const itemBonus = item?.BonusWeapon ?? 0;
        return {
          name: item.Name,
          attackBonus: this.getMeleeAttackBonus() + itemBonus,
          damage: '1d6',   // base weapon die — extendable later
          damageBonus: this.getAbilityMod('str') + itemBonus,
          isWeapon: true,
        };
      });
  }
}
