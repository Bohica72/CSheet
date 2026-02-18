// src/utils/classDataConverter.js

function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function parse5eToolsRef(ref) {
  // "Ability Score Improvement|Pugilist|Pugilist2024|4"
  const parts = String(ref).split('|');
  const name = parts[0]?.trim();
  const level = Number(parts[parts.length - 1]);
  return { name, level };
}

function ensureAdvancement(advancements, level) {
  if (!advancements[level]) {
    advancements[level] = { grants: [], choices: [], effects: [] };
  }
  return advancements[level];
}

function parseScalingFromFoundryAdvancement(classData) {
  const scaling = {};
  const adv = classData.foundryAdvancement || [];

  for (const a of adv) {
    if (a.type !== 'ScaleValue') continue;
    const cfg = a.configuration;
    if (!cfg?.identifier || !cfg?.scale) continue;

    const key = slugify(cfg.identifier); // e.g. "moxie", "fisticuffs"
    scaling[key] = {};

    for (const [lvlStr, val] of Object.entries(cfg.scale)) {
      const lvl = Number(lvlStr);
      if (!lvl) continue;

      if (cfg.type === 'dice') {
        scaling[key][lvl] = `${val.n}d${val.die}`;
      } else if (cfg.type === 'number') {
        scaling[key][lvl] = val.value;
      } else {
        scaling[key][lvl] = val.value ?? val;
      }
    }
  }

  return scaling;
}

export function convertClassData(raw) {
  const cls = raw.class?.[0];
  if (!cls) throw new Error('No class[0] found in raw data');

  const className = cls.name;
  const classId = slugify(className);

  // Primary ability array is stored as [{str:true}] etc in your file
  const primaryAbility = [];
  for (const obj of cls.primaryAbility || []) {
    for (const [k, v] of Object.entries(obj)) if (v) primaryAbility.push(k);
  }

  const scaling = parseScalingFromFoundryAdvancement(cls);

  // Build feature definitions (names only; keep it clean for now)
  const features = {};
  for (const f of raw.classFeature || []) {
    const featureId = slugify(f.name);
    features[featureId] = {
      id: featureId,
      name: f.name,
      level: f.level,
      kind: 'classFeature',
    };
  }

  // Main: build level -> advancements from classFeatures refs
  const advancements = {};
  for (const entry of cls.classFeatures || []) {
    if (typeof entry === 'string') {
      const { name, level } = parse5eToolsRef(entry);
      const adv = ensureAdvancement(advancements, level);

      const featureId = slugify(name);
      if (!adv.grants.includes(featureId)) adv.grants.push(featureId);

      // Choice points (main class)
      if (name === 'Ability Score Improvement') {
        adv.choices.push({ type: 'asi_or_feat', count: 1 });
      }
      if (name === 'Epic Boon') {
        adv.choices.push({ type: 'epic_boon_or_feat', count: 1 });
      }
    } else if (entry && typeof entry === 'object' && entry.classFeature) {
      const { name, level } = parse5eToolsRef(entry.classFeature);
      const adv = ensureAdvancement(advancements, level);

      const featureId = slugify(name);
      if (!adv.grants.includes(featureId)) adv.grants.push(featureId);

      // Subclass selection at level 3 (this is how it’s represented in your file) [file:64]
      if (entry.gainSubclassFeature && name === 'Pugilist Subclass') {
        adv.choices.push({ type: 'subclass', count: 1 });
      }

      // Later "Subclass Feature" entries are not choices; they mean “gain your subclass feature at this level”
      if (entry.gainSubclassFeature && name === 'Subclass Feature') {
        adv.effects.push({ type: 'gain_subclass_feature_at_level' });
      }
    }
  }

  // Hard-coded “mechanical effects we can apply now” from your class data:
  // - Iron Chin: AC formula (12 + CON mod under its conditions) [file:64]
  // - Peak Physical Condition: STR/CON +2 to max 23 (Hale and Hearty) [file:64]
  // We attach these as effects to the level where those features are granted.
  for (const [levelStr, adv] of Object.entries(advancements)) {
    const level = Number(levelStr);
    if (adv.grants.includes('iron_chin')) {
      adv.effects.push({ type: 'ac_formula', id: 'iron_chin_12_plus_con' });
    }
    if (adv.grants.includes('peak_physical_condition')) {
      adv.effects.push({
        type: 'ability_bonus',
        abilities: { str: 2, con: 2 },
        max: 23,
      });
    }
  }

  // Subclass list (names)
  const subclasses = (raw.subclass || []).map(s => ({
    id: slugify(s.name),
    name: s.name,
    shortName: s.shortName || s.name,
  }));

  return {
    id: classId,
    name: className,
    source: cls.source,
    hitDie: cls.hd?.faces,
    primaryAbility,
    saves: cls.proficiency || [],
    scaling, // fisticuffs + moxie etc. are in here [file:64]
    advancements, // <-- this is your level-by-level truth table [file:64]
    features,
    subclasses,
  };
}
