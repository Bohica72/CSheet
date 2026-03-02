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
        { level: 3, name: "Giant Power", description: "LWhen you choose this path, you learn to speak, read, and write Giant or one other language of your choice if you already know Giant. Additionally, you learn a cantrip of your choice: either druidcraft or thaumaturgy. Wisdom is your spellcasting ability for this spell." },
        { level: 3, name: "Giant's Havoc", description: "Your rages pull strength from the primal might of giants, transforming you into a hulking force of destruction. While raging, you gain the following benefits: Crushing Throw. When you make a successful ranged attack with a thrown weapon using Strength, you can add your Rage Damage bonus to the attack's damage roll. Giant Stature. Your reach increases by 5 feet, and if you are smaller than Large, you become Large, along with anything you are wearing. If there isn't enough room for you to increase your size, your size doesn't change." },
        { level: 6, name: "Elemental Cleaver", description: "Your bond with the elemental might of giants grows, and you learn to infuse weapons with primordial energy. When you enter your rage, you can choose one weapon that you are holding and infuse it with one of the following damage types: acid, cold, fire, thunder, or lightning. While you wield the infused weapon during your rage, the weapon's damage type changes to the chosen type, it deals an extra 1d6 damage of the chosen type when it hits, and it gains the thrown property, with a normal range of 20 feet and a long range of 60 feet. If you throw the weapon, it reappears in your hand the instant after it hits or misses a target. The infused weapon's benefits are suppressed while a creature other than you wields it. While raging and holding the infused weapon, you can use a bonus action to change the infused weapon's current damage type to another one from the damage type options above." },
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