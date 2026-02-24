// src/models/LevelUp.js

export class LevelUp {
  constructor(character, classData) {
    this.character = character;
    this.classData = classData;
    this.currentLevel = this.getTotalLevel();
    this.nextLevel = this.currentLevel + 1;
  }

  getTotalLevel() {
    // Safely parse integers, fallback to root level if classes array is missing
    if (this.character?.classes?.length) {
      return this.character.classes.reduce((sum, cls) => sum + (parseInt(cls.level, 10) || 1), 0);
    }
    return parseInt(this.character?.level, 10) || 1;
  }

  getAdvancement() {
    return (
      this.classData?.advancements?.[this.nextLevel] || {
        grants: [],
        choices: [],
        effects: [],
      }
    );
  }

  getNewFeatures() {
    const adv = this.getAdvancement();
    const defs = this.classData?.features || {};
    return (adv.grants || []).map((id) => defs[id]).filter(Boolean);
  }

  grantsASI() {
    return (this.getAdvancement().choices || []).some((c) => c.type === 'asi_or_feat');
  }

  grantsEpicBoon() {
    return (this.getAdvancement().choices || []).some((c) => c.type === 'epic_boon_or_feat');
  }

  grantsSubclass() {
    return (this.getAdvancement().choices || []).some((c) => c.type === 'subclass');
  }

  getScalingValues() {
    const scaling = this.classData?.scaling || {};
    const result = {};

    for (const [key, scaleObj] of Object.entries(scaling)) {
      const levels = Object.keys(scaleObj)
        .map(Number)
        .filter((lvl) => lvl <= this.nextLevel)
        .sort((a, b) => b - a);

      if (levels.length > 0) result[key] = scaleObj[levels[0]];
    }

    return result;
  }

  calculateHPGain() {
    const hitDie = parseInt(this.classData?.hitDie || 10, 10);
    const avgRoll = Math.floor(hitDie / 2) + 1;
    const conScore = parseInt(this.character?.abilities?.con || 10, 10);
    const conMod = Math.floor((conScore - 10) / 2);
    return avgRoll + conMod;
  }

  getNewProficiencyBonus() {
    const lvl = this.nextLevel;
    if (lvl >= 17) return 6;
    if (lvl >= 13) return 5;
    if (lvl >= 9) return 4;
    if (lvl >= 5) return 3;
    return 2;
  }

  applyEffects(updatedCharacter) {
    const adv = this.getAdvancement();
    const effects = adv.effects || [];

    if (!updatedCharacter.bonuses) updatedCharacter.bonuses = {};
    if (!updatedCharacter.bonuses.abilities) updatedCharacter.bonuses.abilities = {};

    for (const eff of effects) {
      if (!eff || typeof eff !== 'object') continue;

      if (eff.type === 'ability_bonus' && eff.abilities) {
        for (const [ab, inc] of Object.entries(eff.abilities)) {
          const current = parseInt(updatedCharacter.abilities?.[ab] || 10, 10);
          const next = current + parseInt(inc, 10);
          updatedCharacter.abilities[ab] = eff.max ? Math.min(next, parseInt(eff.max, 10)) : next;
        }
      }

      if (eff.type === 'ac_formula' && eff.id) {
        updatedCharacter.bonuses.acFormula = eff.id;
      }
    }
  }

  applyLevelUp(choices = {}) {
    // Deep clone (fine for JSON-only data)
    const updated = JSON.parse(JSON.stringify(this.character));

    // Safely grab the current level as an integer
    let currentLevel = parseInt(updated.level, 10) || 1;

    // Update the nested class level
    if (updated.classes && updated.classes.length > 0) {
      const cls = updated.classes[0];
      cls.level = parseInt(cls.level || currentLevel, 10) + 1;
      currentLevel = cls.level;
    } else {
      currentLevel += 1;
    }

    // 1. SYNC ROOT LEVEL (Crucial for OverviewScreen and Rage math!)
    updated.level = currentLevel;

    // HP Calculation
    const hpGain = this.calculateHPGain();

    // 2. SYNC ROOT HP PROPERTIES (Crucial for OverviewScreen hit dice & HP!)
    updated.hpMax = parseInt(updated.hpMax || 0, 10) + hpGain;
    updated.hpCurrent = parseInt(updated.hpCurrent || 0, 10) + hpGain;
    updated.hitDiceRemaining = parseInt(updated.hitDiceRemaining || (currentLevel - 1), 10) + 1;

    // Keep the nested hitPoints object updated just in case other components use it
    if (!updated.hitPoints) updated.hitPoints = { max: updated.hpMax, current: updated.hpCurrent, temp: 0 };
    updated.hitPoints.max = updated.hpMax;
    updated.hitPoints.current = updated.hpCurrent;

    // Proficiency bonus
    updated.proficiencyBonus = this.getNewProficiencyBonus();

    // Ensure arrays exist
    if (!updated.features) updated.features = [];
    if (!updated.feats) updated.feats = [];

    // Add granted features for this level
    const adv = this.getAdvancement();
    for (const featureId of adv.grants || []) {
      if (!updated.features.includes(featureId)) updated.features.push(featureId);
    }

    // Apply ASI / Feat choice safely
    if (choices.asiChoice) {
      const c = choices.asiChoice;

      if (c.type === 'ability_score') {
        const abs = c.abilities || [];
        if (!updated.abilities) updated.abilities = {};

        if (abs.length === 1) {
          const a = abs[0];
          updated.abilities[a] = parseInt(updated.abilities[a] || 10, 10) + 2;
        } else if (abs.length === 2) {
          for (const a of abs) {
            updated.abilities[a] = parseInt(updated.abilities[a] || 10, 10) + 1;
          }
        }
      }

      if (c.type === 'feat' && c.feat) {
        updated.feats.push(c.feat);
      }
    }

    // Apply Epic Boon / Feat choice
    if (choices.epicChoice?.feat) {
      updated.feats.push(choices.epicChoice.feat);
    }

    // Apply subclass choice
    if (choices.subclass && updated.classes && updated.classes.length > 0) {
      updated.classes[0].subclass = choices.subclass; 
    }

    // Apply any mechanical effects tied to this level
    this.applyEffects(updated);

    return updated;
  }
}