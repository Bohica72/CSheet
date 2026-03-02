export const BARBARIAN = {
  id: 'barbarian',
  name: 'Barbarian',
  source: 'XPHB',
  hitDie: 12,
  saves: ['str', 'con'],
  primaryAbility: 'str',
  spellcasting: { isSpellcaster: false, ability: null },
  
  // Resource definition for the UI Grid and Rest logic
  resource: { 
    name: 'Rage', 
    type: 'longRest', 
    displayType: 'numeric' 
  },
  
  // Progression Table: Centralizes proficiency, features, and resource scaling
  levels: {
    1:  { profBonus: 2, features: ['Rage', 'Unarmored Defense', 'Weapon Mastery'], resourceMax: 2 },
    2:  { profBonus: 2, features: ['Danger Sense', 'Reckless Attack'],             resourceMax: 2 },
    3:  { profBonus: 2, features: ['Barbarian Subclass', 'Primal Knowledge'],      resourceMax: 3 },
    4:  { profBonus: 2, features: ['Ability Score Improvement'],                   resourceMax: 3 },
    5:  { profBonus: 3, features: ['Extra Attack', 'Fast Movement'],               resourceMax: 3 },
    6:  { profBonus: 3, features: ['Subclass Feature'],                            resourceMax: 4 },
    7:  { profBonus: 3, features: ['Feral Instinct', 'Instinctive Pounce'],        resourceMax: 4 },
    8:  { profBonus: 3, features: ['Ability Score Improvement'],                   resourceMax: 4 },
    9:  { profBonus: 4, features: ['Brutal Strike'],                               resourceMax: 4 },
    10: { profBonus: 4, features: ['Subclass Feature'],                            resourceMax: 4 },
    11: { profBonus: 4, features: ['Relentless Rage'],                             resourceMax: 4 },
    12: { profBonus: 4, features: ['Ability Score Improvement'],                   resourceMax: 5 },
    13: { profBonus: 5, features: ['Improved Brutal Strike'],                      resourceMax: 5 },
    14: { profBonus: 5, features: ['Subclass Feature'],                            resourceMax: 5 },
    15: { profBonus: 5, features: ['Persistent Rage'],                             resourceMax: 5 },
    16: { profBonus: 5, features: ['Ability Score Improvement'],                   resourceMax: 5 },
    17: { profBonus: 6, features: ['Improved Brutal Strike'],                      resourceMax: 6 },
    18: { profBonus: 6, features: ['Indomitable Might'],                           resourceMax: 6 },
    19: { profBonus: 6, features: ['Epic Boon'],                                   resourceMax: 6 },
    20: { profBonus: 6, features: ['Primal Champion'],                             resourceMax: 999 },
  },

  // Glossary: Used for "Long Press" breakdowns and the Reference Screen detail view
  featureDefinitions: {
    'Rage': {
      actionType: 'Bonus Action',
      description: "While active: Resistance to physical damage; gain Rage Damage bonus to STR attacks; Advantage on STR checks/saves. Lasts 10 minutes."
    },
    'Unarmored Defense': {
      actionType: 'Passive',
      description: "While wearing no armor, AC = 10 + DEX + CON. You can use a shield."
    },
    'Weapon Mastery': {
      actionType: 'Passive',
      description: "Use mastery properties of specific weapons. Change one choice on a Long Rest."
    },
    'Reckless Attack': {
      actionType: 'Special',
      description: "Gain Advantage on STR attacks this turn, but attacks against you have Advantage until your next turn."
    },
    'Primal Knowledge': {
      actionType: 'Passive',
      description: "Gain an extra Barbarian skill. Use STR for specific skill checks while Raging."
    },
    'Brutal Strike': {
      actionType: 'Special',
      description: "Forgo Advantage from Reckless Attack to deal extra 1d10 damage and apply a status effect like Forceful or Hamstring Blow."
    },
    'Relentless Rage': {
      actionType: 'Reaction',
      description: "When dropping to 0 HP while Raging, succeed on a CON save to drop to twice your level in HP instead."
    },
    'Persistent Rage': {
      actionType: 'Passive',
      description: "Regain all expended uses of Rage when you roll Initiative (once per Long Rest). Rage lasts 10 minutes without needing extension."
    },
    'Indomitable Might': {
      actionType: 'Passive',
      description: "If your STR check/save total is less than your STR score, use the score instead."
    },
    'Primal Champion': {
      actionType: 'Passive',
      description: "Your STR and CON scores increase by 4, to a maximum of 25."
    }
  },

  // Subclasses: Consolidated into an array of objects for easy mapping
  subclasses: [
    {
      id: 'path_of_the_giant',
      name: 'Path of the Giant',
      shortName: 'Giant',
      source: 'BGG',
      features: [
        { level: 3, name: "Giant Power", description: "Learn Giant language and Druidcraft or Thaumaturgy (Wisdom-based)." },
        { level: 3, name: "Giant's Havoc", description: "While raging, reach increases by 5ft and you become Large. Add Rage bonus to thrown weapon attacks." },
        { level: 6, name: "Elemental Cleaver", description: "Infuse a weapon with Acid, Cold, Fire, Lightning, or Thunder. It deals extra 1d6 damage and gains the thrown property." },
        { level: 10, name: "Mighty Impel", description: "Bonus Action: Move a Medium or smaller creature within your reach 30ft (STR save resists)." },
        { level: 14, name: "Demiurgic Colossus", description: "Reach increases by 10ft; size can be Large or Huge. Elemental Cleaver damage increases to 2d6." }
      ]
    },
    {
      id: 'berserker',
      name: 'Path of the Berserker',
      shortName: 'Berserker',
      source: 'XPHB',
      features: [
        { level: 3, name: "Frenzy", description: "Make a melee attack as a Bonus Action while Raging. Gain 1 level of Exhaustion when Rage ends." },
        { level: 6, name: "Mindless Rage", description: "Immune to Charmed or Frightened while Raging." },
        { level: 10, name: "Retaliation", description: "Use Reaction to attack a creature within 5ft that damages you." },
        { level: 14, name: "Intimidating Presence", description: "Bonus Action: Frighten a creature within 30ft (Wisdom save resists)." }
      ]
    }
  ]
};