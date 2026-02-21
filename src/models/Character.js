import { getEquippedBonuses } from '../utils/BonusEngine';
import { getItemByName } from '../utils/ItemStore';
import { getWeaponDamage } from '../utils/WeaponStore';
import { getClassById } from '../utils/ClassStore';

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
    this.overrides = data.overrides ?? {};
  }

getUnarmedAttack() {
  const classData = getClassById(this.classId);
  if (!classData) return null;

  const damageDie = classData.levels?.[this.level]?.fisticuffs
    ?? classData.unarmedDie
    ?? '1d4';

  return {
    name:         classData.unarmedAttackName ?? 'Unarmed Strike',
    tag:          classData.unarmedAttackTag  ?? 'Unarmed',
    damageDie,
    damageBonus:  this.getAbilityMod('str'),
    attackBonus:  this.getMeleeAttackBonus(),
    isProficient: true,
    magicBonus:   0,
    strMod:       this.getAbilityMod('str'),
    profBonus:    this.proficiencyBonus,
  };
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
    const ability    = abilityMap[skill];
    const mod        = this.getAbilityMod(ability);
    const expertise  = this.proficiencies?.expertise?.includes(skill);
    const proficient = this.proficiencies?.skills?.includes(skill);
    const profBonus  = expertise
      ? this.proficiencyBonus * 2
      : proficient
        ? this.proficiencyBonus
        : 0;
    return mod + profBonus;
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
    const conMod = this.getAbilityMod('con');

    if (this.overrides?.ac !== undefined) {
      return this.overrides.ac;
    }

    const equipped = (this.inventory ?? []).filter(e => e.equipped);
    let armorItem  = null;
    let hasShield  = false;

    for (const entry of equipped) {
      const item = getItemByName(entry.itemName);
      if (!item) continue;
      const type = (item.ObjectType ?? '').toLowerCase();
      if (type.includes('shield')) {
        hasShield = true;
      } else if (type.includes('armor')) {
        armorItem = item;
      }
    }

    let base = 0, dexApplied = 0;

    if (armorItem) {
      const type   = (armorItem.ObjectType ?? '').toLowerCase();
      const baseAC = parseInt(armorItem.BonusAC ?? armorItem.baseAC ?? 0, 10);
      if (type.includes('heavy')) {
        base = baseAC; dexApplied = 0;
      } else if (type.includes('medium')) {
        base = baseAC; dexApplied = Math.min(dexMod, 2);
      } else {
        base = baseAC; dexApplied = dexMod;
      }
    } else if (this.bonuses?.acFormula === 'iron_chin_12_plus_con') {
      base = 12 + conMod; dexApplied = 0;
    } else {
      base = 10; dexApplied = dexMod;
    }

    const shieldBonus  = hasShield ? 2 : 0;
    const { bonusAC }  = getEquippedBonuses(this.inventory);
    return base + dexApplied + shieldBonus + bonusAC;
  }

  getACBreakdown() {
    if (this.overrides?.ac !== undefined) {
      return {
        formula:     'Manual Override',
        base:        this.overrides.ac,
        dexApplied:  0,
        shieldBonus: 0,
        magicBonus:  0,
        total:       this.overrides.ac,
        isOverride:  true,
      };
    }

    const dexMod   = this.getAbilityMod('dex');
    const conMod   = this.getAbilityMod('con');
    const equipped = (this.inventory ?? []).filter(e => e.equipped);
    let armorItem  = null;
    let hasShield  = false;

    for (const entry of equipped) {
      const item = getItemByName(entry.itemName);
      if (!item) continue;
      const type = (item.ObjectType ?? '').toLowerCase();
      if (type.includes('shield'))     hasShield = true;
      else if (type.includes('armor')) armorItem = item;
    }

    let base = 0, dexApplied = 0, formula = '';

    if (armorItem) {
      const type   = (armorItem.ObjectType ?? '').toLowerCase();
      const baseAC = parseInt(armorItem.BonusAC ?? armorItem.baseAC ?? 0, 10);
      if (type.includes('heavy')) {
        base = baseAC; dexApplied = 0;
        formula = `Heavy Armor (${armorItem.Name ?? armorItem.itemName})`;
      } else if (type.includes('medium')) {
        base = baseAC; dexApplied = Math.min(dexMod, 2);
        formula = `Medium Armor (${armorItem.Name ?? armorItem.itemName})`;
      } else {
        base = baseAC; dexApplied = dexMod;
        formula = `Light Armor (${armorItem.Name ?? armorItem.itemName})`;
      }
    } else if (this.bonuses?.acFormula === 'iron_chin_12_plus_con') {
      base = 12 + conMod; dexApplied = 0;
      formula = 'Iron Chin (12 + CON mod)';
    } else {
      base = 10; dexApplied = dexMod;
      formula = 'Unarmored (10 + DEX mod)';
    }

    const shieldBonus = hasShield ? 2 : 0;
    const { bonusAC } = getEquippedBonuses(this.inventory);

    return {
      formula,
      base,
      dexApplied,
      shieldBonus,
      magicBonus: bonusAC,
      total:      base + dexApplied + shieldBonus + bonusAC,
      isOverride: false,
    };
  }

  // --- Moxie ---

  getMoxieMax() {
  const classData = getClassById(this.classId);
  return classData?.levels[this.level]?.moxiePoints ?? 0;
}

getMoxieCurrent() {
  return this.moxieCurrent ?? this.getMoxieMax();
}

getHitDice() {
  const classData = getClassById(this.classId);
  const faces = classData?.hitDie ?? 8;
  return `${this.level}d${faces}`;
}

getFisticuffsDie() {
  const classData = getClassById(this.classId);
  return classData?.levels[this.level]?.fisticuffs ?? '1d4';
}

  // --- Attack helpers ---

  getMeleeAttackBonus() {
    return this.getAbilityMod('str') + this.proficiencyBonus;
  }

 // ... previous code
  getEquippedWeaponAttacks() {
    return this.inventory
      .filter(entry => {
        if (!entry.equipped) return false;
        const item = getItemByName(entry.itemName);
        return item?.ObjectType === 'Weapon';
      })
      .map(entry => {
        const item         = getItemByName(entry.itemName);
        const magicBonus   = item?.BonusWeapon ?? 0;
        const isProficient = entry.proficient ?? true;
        const strMod       = this.getAbilityMod('str');
        const baseDamage   = getWeaponDamage(item?.BaseItem ?? item?.Name ?? '') ?? '1d6';
        const damageDie    = baseDamage.split(' ')[0];
        return {
          name:         item.Name,
          attackBonus:  strMod + (isProficient ? this.proficiencyBonus : 0) + magicBonus,
          damageDie,
          damageBonus:  strMod + magicBonus,
          magicBonus,
          isProficient,
          strMod,
          isWeapon:     true,
        };
      });
  }



  // --- Serialisation ---

  toJSON() {
    return {
      id:               this.id,
      name:             this.name,
      level:            this.level,
      classId:          this.classId,
      subclassId:       this.subclassId,
      abilities:        this.abilities,
      proficiencyBonus: this.proficiencyBonus,
      proficiencies:    this.proficiencies,
      bonuses:          this.bonuses,
      moxieCurrent:     this.moxieCurrent,
      hpMax:            this.hpMax,
      hpCurrent:        this.hpCurrent,
      hpTemp:           this.hpTemp,
      hitDiceRemaining: this.hitDiceRemaining,
      speed:            this.speed,
      inspiration:      this.inspiration,
      inventory:        this.inventory,
      attunedItems:     this.attunedItems,
      attacks:          this.attacks,
      overrides:        this.overrides,
    };
  }
}
