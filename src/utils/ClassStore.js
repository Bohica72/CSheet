import pugilistData from '../data/pugilist.json';

// ─── Wizard ──────────────────────────────────────────────────────────────────

const WIZARD = {
  id: 'wizard',
  name: 'Wizard',
  spellcaster: true,
  source: 'XPHB',
  hitDie: 6,
  saves: ['int', 'wis'],
  spellcastingAbility: 'int',
  resource: null,
  levels: {
    1:  { profBonus: 2, features: ['Spellcasting', 'Ritual Adept', 'Arcane Recovery'], resourceMax: null, fisticuffs: null },
    2:  { profBonus: 2, features: ['Scholar'],                                          resourceMax: null, fisticuffs: null },
    3:  { profBonus: 2, features: ['Wizard Subclass'],                                  resourceMax: null, fisticuffs: null },
    4:  { profBonus: 2, features: ['Ability Score Improvement'],                        resourceMax: null, fisticuffs: null },
    5:  { profBonus: 3, features: ['Memorize Spell'],                                   resourceMax: null, fisticuffs: null },
    6:  { profBonus: 3, features: ['Subclass Feature'],                                 resourceMax: null, fisticuffs: null },
    7:  { profBonus: 3, features: [],                                                    resourceMax: null, fisticuffs: null },
    8:  { profBonus: 3, features: ['Ability Score Improvement'],                        resourceMax: null, fisticuffs: null },
    9:  { profBonus: 4, features: [],                                                    resourceMax: null, fisticuffs: null },
    10: { profBonus: 4, features: ['Subclass Feature'],                                 resourceMax: null, fisticuffs: null },
    11: { profBonus: 4, features: [],                                                    resourceMax: null, fisticuffs: null },
    12: { profBonus: 4, features: ['Ability Score Improvement'],                        resourceMax: null, fisticuffs: null },
    13: { profBonus: 5, features: [],                                                    resourceMax: null, fisticuffs: null },
    14: { profBonus: 5, features: ['Subclass Feature'],                                 resourceMax: null, fisticuffs: null },
    15: { profBonus: 5, features: [],                                                    resourceMax: null, fisticuffs: null },
    16: { profBonus: 5, features: ['Ability Score Improvement'],                        resourceMax: null, fisticuffs: null },
    17: { profBonus: 6, features: [],                                                    resourceMax: null, fisticuffs: null },
    18: { profBonus: 6, features: ['Spell Mastery'],                                    resourceMax: null, fisticuffs: null },
    19: { profBonus: 6, features: ['Epic Boon'],                                        resourceMax: null, fisticuffs: null },
    20: { profBonus: 6, features: ['Signature Spells'],                                 resourceMax: null, fisticuffs: null },
  },
  subclasses: [
    { shortName: 'Abjurer',     source: 'XPHB',  features: [{ level: 3, name: 'Abjuration Savant' }, { level: 3, name: 'Arcane Ward' },         { level: 6, name: 'Projected Ward' },       { level: 10, name: 'Spell Breaker' },       { level: 14, name: 'Spell Resistance' }] },
    { shortName: 'Diviner',     source: 'XPHB',  features: [{ level: 3, name: 'Portent' },           { level: 3, name: 'Divination Savant' },    { level: 6, name: 'Expert Divination' },    { level: 10, name: 'The Third Eye' },       { level: 14, name: 'Greater Portent' }] },
    { shortName: 'Evoker',      source: 'XPHB',  features: [{ level: 3, name: 'Evocation Savant' },  { level: 3, name: 'Potent Cantrip' },       { level: 6, name: 'Sculpt Spells' },        { level: 10, name: 'Empowered Evocation' }, { level: 14, name: 'Overchannel' }] },
    { shortName: 'Illusionist', source: 'XPHB',  features: [{ level: 3, name: 'Illusion Savant' },   { level: 3, name: 'Improved Illusions' },   { level: 6, name: 'Phantasmal Creatures' }, { level: 10, name: 'Illusory Self' },       { level: 14, name: 'Illusory Reality' }] },
    { shortName: 'Conjuration', source: 'PHB',   features: [{ level: 2, name: 'Conjuration Savant' },{ level: 2, name: 'Minor Conjuration' },    { level: 6, name: 'Benign Transposition' }, { level: 10, name: 'Focused Conjuration' }, { level: 14, name: 'Durable Summons' }] },
    { shortName: 'War',         source: 'XGE',   features: [{ level: 2, name: 'Arcane Deflection' }, { level: 2, name: 'Tactical Wit' },         { level: 6, name: 'Power Surge' },          { level: 10, name: 'Durable Magic' },       { level: 14, name: 'Deflecting Shroud' }] },
    { shortName: 'Bladesinger', source: 'FRHoF', features: [{ level: 3, name: 'Bladesong' },         { level: 3, name: 'Training in War and Song'},{ level: 6, name: 'Extra Attack' },        { level: 10, name: 'Song of Defense' },     { level: 14, name: 'Song of Victory' }] },
    { shortName: 'Scribes',     source: 'TCE',   features: [{ level: 2, name: 'Wizardly Quill' },    { level: 2, name: 'Awakened Spellbook' },   { level: 6, name: 'Manifest Mind' },        { level: 10, name: 'Master Scrivener' },    { level: 14, name: 'One with the Word' }] },
    { shortName: 'Chronurgy',   source: 'EGW',   features: [{ level: 2, name: 'Chronal Shift' },     { level: 2, name: 'Temporal Awareness' },   { level: 6, name: 'Momentary Stasis' },     { level: 10, name: 'Arcane Abeyance' },     { level: 14, name: 'Convergent Future' }] },
    { shortName: 'Graviturgy',  source: 'EGW',   features: [{ level: 2, name: 'Adjust Density' },                                                { level: 6, name: 'Gravity Well' },         { level: 10, name: 'Violent Attraction' },  { level: 14, name: 'Event Horizon' }] },
  ],
};

const BARBARIAN = {
  id: 'barbarian',
  name: 'Barbarian',
  source: 'XPHB',
  hitDie: 12,
  saves: ['str', 'con'],
  spellcaster: false,

  rageDamage: {
    1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2,
    9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3,
    17: 4, 18: 4, 19: 4, 20: 4,
  },

  ragesPerRest: {
    1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 4,
    9: 4, 10: 4, 11: 4, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5,
    17: 6, 18: 6, 19: 6, 20: 999, // unlimited at 20
  },

  levels: {
    1:  { profBonus: 2, features: ['Rage', 'Unarmored Defense', 'Weapon Mastery'], resourceMax: null, fisticuffs: null },
    2:  { profBonus: 2, features: ['Danger Sense', 'Reckless Attack'],             resourceMax: null, fisticuffs: null },
    3:  { profBonus: 2, features: ['Barbarian Subclass', 'Primal Knowledge'],      resourceMax: null, fisticuffs: null },
    4:  { profBonus: 2, features: ['Ability Score Improvement'],                   resourceMax: null, fisticuffs: null },
    5:  { profBonus: 3, features: ['Extra Attack', 'Fast Movement'],               resourceMax: null, fisticuffs: null },
    6:  { profBonus: 3, features: ['Subclass Feature'],                            resourceMax: null, fisticuffs: null },
    7:  { profBonus: 3, features: ['Feral Instinct', 'Instinctive Pounce'],        resourceMax: null, fisticuffs: null },
    8:  { profBonus: 3, features: ['Ability Score Improvement'],                   resourceMax: null, fisticuffs: null },
    9:  { profBonus: 4, features: ['Brutal Strike'],                               resourceMax: null, fisticuffs: null },
    10: { profBonus: 4, features: ['Subclass Feature'],                            resourceMax: null, fisticuffs: null },
    11: { profBonus: 4, features: ['Relentless Rage'],                             resourceMax: null, fisticuffs: null },
    12: { profBonus: 4, features: ['Ability Score Improvement'],                   resourceMax: null, fisticuffs: null },
    13: { profBonus: 5, features: ['Improved Brutal Strike'],                      resourceMax: null, fisticuffs: null },
    14: { profBonus: 5, features: ['Subclass Feature'],                            resourceMax: null, fisticuffs: null },
    15: { profBonus: 5, features: ['Persistent Rage'],                             resourceMax: null, fisticuffs: null },
    16: { profBonus: 5, features: ['Ability Score Improvement'],                   resourceMax: null, fisticuffs: null },
    17: { profBonus: 6, features: ['Improved Brutal Strike II'],                   resourceMax: null, fisticuffs: null },
    18: { profBonus: 6, features: ['Indomitable Might'],                           resourceMax: null, fisticuffs: null },
    19: { profBonus: 6, features: ['Epic Boon'],                                   resourceMax: null, fisticuffs: null },
    20: { profBonus: 6, features: ['Primal Champion'],                             resourceMax: null, fisticuffs: null },
  },
};


const FIGHTER = {
  id: 'fighter',
  name: 'Fighter',
  source: 'XPHB',
  hitDie: 10,
  saves: ['str', 'con'],
  spellcastingAbility: null,
  resource: { name: 'Action Surge' },
  levels: {
    1:  { profBonus: 2, features: ['Fighting Style', 'Second Wind', 'Weapon Mastery'],            resourceMax: null, fisticuffs: null },
    2:  { profBonus: 2, features: ['Action Surge', 'Tactical Mind'],                              resourceMax: 1,    fisticuffs: null },
    3:  { profBonus: 2, features: ['Fighter Subclass'],                                           resourceMax: 1,    fisticuffs: null },
    4:  { profBonus: 2, features: ['Ability Score Improvement', 'Weapon Mastery'],                resourceMax: 1,    fisticuffs: null },
    5:  { profBonus: 3, features: ['Extra Attack (×2)', 'Tactical Shift'],                        resourceMax: 1,    fisticuffs: null },
    6:  { profBonus: 3, features: ['Ability Score Improvement', 'Weapon Mastery'],                resourceMax: 1,    fisticuffs: null },
    7:  { profBonus: 3, features: ['Subclass Feature'],                                           resourceMax: 1,    fisticuffs: null },
    8:  { profBonus: 3, features: ['Ability Score Improvement', 'Weapon Mastery'],                resourceMax: 1,    fisticuffs: null },
    9:  { profBonus: 4, features: ['Indomitable (×1)', 'Master of Armaments', 'Tactical Master'], resourceMax: 1,    fisticuffs: null },
    10: { profBonus: 4, features: ['Subclass Feature'],                                           resourceMax: 1,    fisticuffs: null },
    11: { profBonus: 4, features: ['Extra Attack (×3)'],                                          resourceMax: 1,    fisticuffs: null },
    12: { profBonus: 4, features: ['Ability Score Improvement', 'Weapon Mastery'],                resourceMax: 1,    fisticuffs: null },
    13: { profBonus: 5, features: ['Indomitable (×2)', 'Studied Attacks'],                        resourceMax: 1,    fisticuffs: null },
    14: { profBonus: 5, features: ['Ability Score Improvement', 'Weapon Mastery'],                resourceMax: 1,    fisticuffs: null },
    15: { profBonus: 5, features: ['Subclass Feature'],                                           resourceMax: 1,    fisticuffs: null },
    16: { profBonus: 5, features: ['Ability Score Improvement', 'Weapon Mastery'],                resourceMax: 1,    fisticuffs: null },
    17: { profBonus: 6, features: ['Action Surge (×2)', 'Indomitable (×3)'],                     resourceMax: 2,    fisticuffs: null },
    18: { profBonus: 6, features: ['Subclass Feature'],                                           resourceMax: 2,    fisticuffs: null },
    19: { profBonus: 6, features: ['Epic Boon', 'Ability Score Improvement'],                     resourceMax: 2,    fisticuffs: null },
    20: { profBonus: 6, features: ['Extra Attack (×4)'],                                          resourceMax: 2,    fisticuffs: null },
  },
  subclasses: [
    { shortName: 'Champion',        source: 'XPHB', features: [{ level: 3, name: 'Improved Critical' }, { level: 3, name: 'Remarkable Athlete' }, { level: 7, name: 'Additional Fighting Style' }, { level: 10, name: 'Heroic Warrior' },     { level: 15, name: 'Superior Critical' },  { level: 18, name: 'Survivor' }] },
    { shortName: 'Battle Master',   source: 'XPHB', features: [{ level: 3, name: 'Combat Superiority' }, { level: 3, name: 'Student of War' },     { level: 7, name: 'Know Your Enemy' },        { level: 10, name: 'Improved Combat Superiority' }, { level: 15, name: 'Relentless' }, { level: 18, name: 'Ultimate Combat Superiority' }] },
    { shortName: 'Eldritch Knight', source: 'XPHB', features: [{ level: 3, name: 'Spellcasting' },       { level: 3, name: 'War Bond' },           { level: 7, name: 'War Magic' },              { level: 10, name: 'Eldritch Strike' },    { level: 15, name: 'Arcane Charge' },      { level: 18, name: 'Improved War Magic' }] },
    { shortName: 'Psi Warrior',     source: 'TCE',  features: [{ level: 3, name: 'Psionic Power' },                                                { level: 7, name: 'Telekinetic Adept' },     { level: 10, name: 'Guarded Mind' },       { level: 15, name: 'Bulwark of Force' },   { level: 18, name: 'Telekinetic Master' }] },
    { shortName: 'Rune Knight',     source: 'TCE',  features: [{ level: 3, name: 'Rune Carver' },        { level: 3, name: "Giant's Might" },      { level: 7, name: 'Runic Shield' },          { level: 10, name: 'Great Stature' },      { level: 15, name: 'Master of Runes' },    { level: 18, name: 'Runic Juggernaut' }] },
    { shortName: 'Cavalier',        source: 'XGE',  features: [{ level: 3, name: 'Born to the Saddle' }, { level: 3, name: 'Unwavering Mark' },    { level: 7, name: 'Warding Maneuver' },      { level: 10, name: 'Hold the Line' },      { level: 15, name: 'Ferocious Charger' },  { level: 18, name: 'Vigilant Defender' }] },
    { shortName: 'Samurai',         source: 'XGE',  features: [{ level: 3, name: 'Fighting Spirit' },    { level: 3, name: 'Bonus Proficiency' },  { level: 7, name: 'Elegant Courtier' },      { level: 10, name: 'Tireless Spirit' },    { level: 15, name: 'Rapid Strike' },       { level: 18, name: 'Strength Before Death' }] },
  ],
};

const BARBARIAN_GIANT = {
  id: 'path_of_the_giant',
  name: 'Path of the Giant',
  source: 'BGG',
  levels: [
    { level: 3,  features: ["Giant's Power", "Giant's Havoc"] },
    { level: 6,  features: ['Elemental Cleaver'] },
    { level: 10, features: ['Mighty Impel'] },
    { level: 14, features: ['Demiurgic Colossus'] },
  ],
};


// ─── Registry ────────────────────────────────────────────────────────────────


const CLASS_DATA = {
  wizard: WIZARD,
  fighter: FIGHTER,
  barbarian: BARBARIAN,
};

export function getClassData(classId) {
  return CLASS_DATA[classId?.toLowerCase()] ?? null;
}

export function getSubclassLevelFeatures(classId, subclassId, level) {
  const classData = getClassData(classId);
  if (!classData?.subclasses) return [];
  const subclass = classData.subclasses.find(
    sc => sc.shortName?.toLowerCase() === subclassId?.toLowerCase()
  );
  return subclass?.features
    ?.filter(f => f.level === level)
    ?.map(f => f.name) ?? [];
}

