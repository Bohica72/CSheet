import { getEquippedBonuses } from '../utils/BonusEngine';
import { getItemByName } from '../utils/ItemStore';
import { getWeaponDamageByName } from '../utils/WeaponStore';
import { getClassData } from '../utils/ClassStore';
import { getArmorStatsByName } from '../utils/ArmorStore';

const HEAVY_WEAPONS = new Set([
  'Greataxe',
  'Greatsword',
  'Halberd',
  'Glaive',
  'Pike',
  'Maul',
  'Lance',
  'Heavy Crossbow',
]);


export class Character {
  constructor(data) {
    this.id          = data.id;
    this.name        = data.name;
    
   
    this.level       = parseInt(data.level, 10) || 1;
    this.ragesUsed   = parseInt(data.ragesUsed, 10) || 0;

    this.classId     = data.classId ?? 'pugilist';
    this.subclassId  = data.subclassId ?? null;
    this.race        = data.race ?? null;
    this.raceSource  = data.raceSource ?? null;
    this.background  = data.background ?? null;
    this.classSource = data.classSource ?? null;
    this.knownCantrips = data.knownCantrips ?? [];
    this.isRaging  = data.isRaging ?? false;
    this.feats       = data.feats ?? [];

    if (data.abilities) {
      this.abilities = data.abilities;
    } else {
      this.abilities = {
        str: parseInt(data.str, 10) || 10,
        dex: parseInt(data.dex, 10) || 10,
        con: parseInt(data.con, 10) || 10,
        int: parseInt(data.int, 10) || 10,
        wis: parseInt(data.wis, 10) || 10,
        cha: parseInt(data.cha, 10) || 10,
      };
    }

    this.spellSlotsUsed = data.spellSlotsUsed ?? {}; 
    this.preparedSpells = data.preparedSpells ?? [];

    // Proficiency bonus — calculate from level if not stored
    this.proficiencyBonus = data.proficiencyBonus ?? this._calcProfBonus(data.level ?? 1);

    // Proficiencies — default empty structure if not set
    this.proficiencies = data.proficiencies ?? {
      saves:     [],
      skills:    [],
      expertise: [],
      weapons:   [],
      armor:     [],
    };

    this.bonuses      = data.bonuses ?? {};
    this.moxieCurrent = data.moxieCurrent ?? null;
    this.skills       = data.skills ?? {};
    this.spellcastingAbility = data.spellcastingAbility ?? null;

    // HP - Scrubbed for NaN
    this.hpMax            = parseInt(data.hpMax, 10) || 10;
    this.hpCurrent        = parseInt(data.hpCurrent, 10) || this.hpMax;
    this.hpTemp           = parseInt(data.hpTemp, 10) || 0;
    this.hitDiceRemaining = parseInt(data.hitDiceRemaining, 10) || this.level;

    // Combat
    this.speed       = data.speed ?? 30;
    this.darkvision  = data.darkvision ?? 0;
    this.inspiration = data.inspiration ?? 0;

    // Inventory & attacks
    this.inventory    = data.inventory ?? [];
    this.attunedItems = data.attunedItems ?? [];
    this.attacks      = data.attacks ?? [];
    this.overrides    = data.overrides ?? {};
  }



  // ─── Proficiency bonus ───────────────────────────────────────────────────────

  _calcProfBonus(level) {
    if (level >= 17) return 6;
    if (level >= 13) return 5;
    if (level >= 9)  return 4;
    if (level >= 5)  return 3;
    return 2;
  }


  // ─── Class data ───────────────────────────────────────────────────────────────

getClassData() {
  return getClassData(this.classId);
}

getUnarmedAttack() {
  const classData = getClassData(this.classId);
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


  // ─── Ability scores ───────────────────────────────────────────────────────────

  getAbilityScore(ability) {
    const base  = this.abilities?.[ability] ?? 10;
    const bonus = this.bonuses?.abilities?.[ability] ?? 0;
    return base + bonus;
  }

  getAbilityMod(ability) {
    return Math.floor((this.getAbilityScore(ability) - 10) / 2);
  }

  // ─── Saves & skills ───────────────────────────────────────────────────────────

  getSaveBonus(ability) {
    const mod        = this.getAbilityMod(ability);
    const proficient = this.proficiencies?.saves?.includes(ability);
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

  // ─── Derived stats ────────────────────────────────────────────────────────────

  getInitiativeBonus() {
    return this.getAbilityMod('dex');
  }

  getPassivePerception() {
    return 10 + this.getSkillBonus('perception');
  }

  

getACBreakdown() {
    // 1. Manual Overrides
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

    const dexMod  = this.getAbilityMod('dex');
    const conMod  = this.getAbilityMod('con') || 0; // Fallback to 0 if undefined
    const equipped = (this.inventory ?? []).filter(e => e.equipped);
    
    let armorItemName = null;
    let armorStats = null;
    let hasShield = false;

    // 2. Identify equipped armor and shields using ArmorStore
    for (const entry of equipped) {
      const stats = getArmorStatsByName(entry.itemName);
      if (stats) {
        if (stats.type === 'shield') {
          hasShield = true;
        } else {
          armorItemName = entry.itemName;
          armorStats = stats;
        }
      }
    }

    let base = 0, dexApplied = 0, formula = '';
    
    // Force lowercase to ensure 'Barbarian' and 'barbarian' both match
    const safeClassId = (this.classId || '').toLowerCase();

    // 3. Calculate Base AC and Dex Caps
    if (armorStats) {
      const type = armorStats.type;
      base = armorStats.ac;

      if (type === 'heavy') {
        dexApplied = 0;
        formula = `Heavy Armor (${armorItemName})`;
      } else if (type === 'medium') {
        dexApplied = Math.min(dexMod, 2);
        formula = `Medium Armor (${armorItemName})`;
      } else {
        dexApplied = dexMod;
        formula = `Light Armor (${armorItemName})`;
      }
    } else if (safeClassId === 'barbarian') {
      // Barbarian Unarmored Defense (No Armor, Shields OK)
      base = 10 + conMod; 
      dexApplied = dexMod;
      formula = `Unarmored Defense (10 + DEX + CON ${conMod >= 0 ? '+' : ''}${conMod})`;
    } else if (this.bonuses?.acFormula === 'iron_chin_12_plus_con') {
      base = 12 + conMod; dexApplied = 0;
      formula = 'Iron Chin (12 + CON mod)';
    } else {
      base = 10; dexApplied = dexMod;
      formula = 'Unarmored (10 + DEX mod)';
    }

    // 4. Add external bonuses (Shields + Magic Bonuses)
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

  getArmorClass() {
    // DRY (Don't Repeat Yourself): Just grab the total from the breakdown!
    return this.getACBreakdown().total;
  }  
  // ─── Moxie ────────────────────────────────────────────────────────────────────

  getMoxieMax() {
    const classData = getClassData(this.classId);
    return classData?.levels?.[this.level]?.moxiePoints ?? 0;
  }

  getMoxieCurrent() {
    return this.moxieCurrent ?? this.getMoxieMax();
  }

  // ─── Hit dice ─────────────────────────────────────────────────────────────────

  getHitDice() {
    const classData = getClassData(this.classId);
    const faces     = classData?.hitDie ?? 8;
    return `${this.level}d${faces}`;
  }

  getFisticuffsDie() {
    const classData = getClassData(this.classId);
    return classData?.levels?.[this.level]?.fisticuffs ?? '1d4';
  }

  // ─── Attack helpers ───────────────────────────────────────────────────────────

  getMeleeAttackBonus() {
    return this.getAbilityMod('str') + this.proficiencyBonus;
  }



 

// ... rest of Character class

getEquippedWeaponAttacks() {
  const isBarbarian = this.classId?.toLowerCase() === 'barbarian';
  const classData   = getClassData(this.classId);
  const rageBonus   = isBarbarian && this.isRaging
    ? (classData?.rageDamage?.[this.level] ?? 0)
    : 0;

  const hasGWM = this.feats?.some(f => f.name === 'Great Weapon Master');

  return (this.inventory ?? [])
    .filter(entry => {
      if (!entry.equipped) return false;
      const item = getItemByName(entry.itemName);
      return item?.ObjectType === 'Weapon';
    })
    .map(entry => {
      const item         = getItemByName(entry.itemName) ?? {};
      const magicBonus   = item.BonusWeapon ?? 0;
      const isProficient = entry.proficient ?? true;
      const strMod       = this.getAbilityMod('str');

      const baseName = item.BaseItem ?? item.Name ?? entry.itemName;
      const dmgInfo  = getWeaponDamageByName(baseName);

      const damageDie  = dmgInfo?.dice ?? '1d6';
      const damageType = dmgInfo?.type ?? '';

      const weaponName = item.Name ?? entry.itemName ?? '';
      const isHeavy = HEAVY_WEAPONS.has(weaponName)
  || HEAVY_WEAPONS.has(item.BaseItem?.split('|')[0] ?? '')
  || Array.from(HEAVY_WEAPONS).some(w => 
      weaponName.toLowerCase().includes(w.toLowerCase())
    );

      const gwmBonus   = hasGWM && isHeavy ? 3 : 0;

      const finalDamageBonus = strMod + magicBonus + rageBonus + gwmBonus;

      return {
        name:             item.Name ?? entry.itemName,
        attackBonus:      strMod + (isProficient ? this.proficiencyBonus : 0) + magicBonus,
        damageDie,
        damageType,
        strMod,
        magicBonus,
        isProficient,
        appliedRageBonus: rageBonus,
        featDamageBonus:  gwmBonus,
        damageBonus:      strMod,
        finalDamageBonus,
        isWeapon:         true,
      };
    });
}


  // ─── Serialisation ────────────────────────────────────────────────────────────

  toJSON() {
    return {
      id:                  this.id,
      name:                this.name,
      level:               this.level,
      classId:             this.classId,
      classSource:         this.classSource,
      subclassId:          this.subclassId,
      subclassSource:      this.subclassSource,
      race:                this.race,
      raceSource:          this.raceSource,
      background:          this.background,
      backgroundSource:    this.backgroundSource,
      abilities:           this.abilities,
      proficiencyBonus:    this.proficiencyBonus,
      proficiencies:       this.proficiencies,
      skills:              this.skills,
      bonuses:             this.bonuses,
      moxieCurrent:        this.moxieCurrent,
      spellcastingAbility: this.spellcastingAbility,
      spellSlotsUsed:      this.spellSlotsUsed,
      preparedSpells:      this.preparedSpells,
      knownCantrips:       this.knownCantrips,
      hpMax:               this.hpMax,
      hpCurrent:           this.hpCurrent,
      hpTemp:              this.hpTemp,
      hitDiceRemaining:    this.hitDiceRemaining,
      speed:               this.speed,
      darkvision:          this.darkvision,
      inspiration:         this.inspiration,
      inventory:           this.inventory,
      attunedItems:        this.attunedItems,
      attacks:             this.attacks,
      overrides:           this.overrides,
      ragesUsed:           this.ragesUsed,
      isRaging:            this.isRaging,
      secondWindUsed:      this.secondWindUsed,
      actionSurgeUsed:     this.actionSurgeUsed,
      feats:               this.feats,
    };
  }

}
