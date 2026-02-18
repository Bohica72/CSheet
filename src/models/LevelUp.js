// src/models/LevelUp.js

export class LevelUp {
  constructor(character, classData) {
    this.character = character;
    this.classData = classData;
    this.currentLevel = this.getTotalLevel();
    this.nextLevel = this.currentLevel + 1;
  }

  getTotalLevel() {
    if (!this.character?.classes?.length) return 0;
    return this.character.classes.reduce((sum, cls) => sum + (cls.level || 0), 0);
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
    const hitDie = this.classData?.hitDie || 10;
    const avgRoll = Math.floor(hitDie / 2) + 1;
    const conScore = this.character?.abilities?.con ?? 10;
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
          const current = updatedCharacter.abilities?.[ab];
          if (typeof current !== 'number') continue;
          const next = current + inc;
          updatedCharacter.abilities[ab] = eff.max ? Math.min(next, eff.max) : next;
        }
      }

      if (eff.type === 'ac_formula' && eff.id) {
        // Store which formula to use; Character.getArmorClass() can interpret it
        updatedCharacter.bonuses.acFormula = eff.id;
      }

      if (eff.type === 'gain_subclass_feature_at_level') {
        // Placeholder for later: when we import subclass features we can auto-add
        // “subclass feature at this level” into the character’s feature list.
        // For now, no-op.
      }
    }
  }

  applyLevelUp(choices = {}) {
    // Deep clone (fine for JSON-only data)
    const updated = JSON.parse(JSON.stringify(this.character));

    if (!updated.classes || updated.classes.length === 0) {
      throw new Error('Character has no classes defined.');
    }

    // For now assume the primary class is index 0
    const cls = updated.classes[0];
    cls.level = (cls.level || 0) + 1;

    // HP
    const hpGain = this.calculateHPGain();
    if (!updated.hitPoints) {
      updated.hitPoints = { max: hpGain, current: hpGain, temp: 0 };
    } else {
      updated.hitPoints.max += hpGain;
      updated.hitPoints.current += hpGain;
    }

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

    // Apply ASI / Feat choice
    if (choices.asiChoice) {
      // Expected shapes:
      // { type: 'ability_score', abilities: ['str','con'] }  // +1/+1
      // { type: 'ability_score', abilities: ['str'] }        // +2 (we’ll interpret as +2)
      // { type: 'feat', feat: 'Tavern Brawler' }
      const c = choices.asiChoice;

      if (c.type === 'ability_score') {
        const abs = c.abilities || [];
        if (!updated.abilities) updated.abilities = {};

        if (abs.length === 1) {
          const a = abs[0];
          if (typeof updated.abilities[a] === 'number') updated.abilities[a] += 2;
        } else if (abs.length === 2) {
          for (const a of abs) {
            if (typeof updated.abilities[a] === 'number') updated.abilities[a] += 1;
          }
        }
      }

      if (c.type === 'feat' && c.feat) {
        updated.feats.push(c.feat);
      }
    }

    // Apply Epic Boon / Feat choice (stored as a feat string for now)
    if (choices.epicChoice) {
      // { type: 'epic_boon', feat: 'Boon of Combat Prowess' } or { type: 'feat', feat: '...' }
      const c = choices.epicChoice;
      if (c?.feat) updated.feats.push(c.feat);
    }

    // Apply subclass choice
    if (choices.subclass) {
      cls.subclass = choices.subclass; // store subclass id
    }

    // Apply any mechanical effects tied to this level
    this.applyEffects(updated);

    return updated;
  }
}
