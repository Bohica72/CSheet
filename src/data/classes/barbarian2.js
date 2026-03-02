// src/data/classes/barbarian.js
export const BARBARIAN = {
  id: 'barbarian',
  name: 'Barbarian',
  hitDie: 12,
  saves: ['str', 'con'],
  resource: { 
    name: 'Rage', 
    type: 'longRest', 
    displayType: 'numeric' 
  },
  
  levels: {
    1: { profBonus: 2, features: ['Rage', 'Unarmored Defense', 'Weapon Mastery'], resourceMax: 2 },
    2: { profBonus: 2, features: ['Danger Sense', 'Reckless Attack'], resourceMax: 2 },
    3: { profBonus: 2, features: ['Barbarian Subclass', 'Primal Knowledge'], resourceMax: 3 },
    4:  { profBonus: 2, features: ['Ability Score Improvement'] },
    5:  { profBonus: 3, features: ['Extra Attack', 'Fast Movement'] },
    6:  { profBonus: 3, features: ['Subclass Feature'] },
    7:  { profBonus: 3, features: ['Feral Instinct', 'Instinctive Pounce'] },
    8:  { profBonus: 3, features: ['Ability Score Improvement'] },
    9:  { profBonus: 4, features: ['Brutal Strike'] },
    10: { profBonus: 4, features: ['Subclass Feature'] },
    11: { profBonus: 4, features: ['Relentless Rage'] },
    12: { profBonus: 4, features: ['Ability Score Improvement'] },
    13: { profBonus: 5, features: ['Improved Brutal Strike'] },
    14: { profBonus: 5, features: ['Subclass Feature'] },
    15: { profBonus: 5, features: ['Persistent Rage'] },
    16: { profBonus: 5, features: ['Ability Score Improvement'] },
    17: { profBonus: 6, features: ['Improved Brutal Strike'] },
    18: { profBonus: 6, features: ['Indomitable Might'] },
    19: { profBonus: 6, features: ['Epic Boon'] },
    20: { profBonus: 6, features: ['Primal Champion'], resourceMax: 999 },
  },

  featureDefinitions: {
    'Rage': {
      description: "While active: Resistance to physical damage; gain Rage Damage bonus to STR attacks; Advantage on STR checks/saves.",
      actionType: 'Bonus Action'
    },
    'Unarmored Defense': {
      description: "While wearing no armor, AC = 10 + DEX + CON. Shields allowed.",
      actionType: 'Passive'
    }
     'Weapon Mastery': {
      level: 1,
      description: `Your training allows you to use the mastery properties of two kinds of Simple or Martial Melee weapons of your choice. You can change one weapon choice whenever you finish a Long Rest. The number of weapons increases as you gain Barbarian levels.`,
    },
    'Danger Sense': {
      level: 2,
      description: `You have Advantage on Dexterity saving throws unless you have the Incapacitated condition.`,
    },
    'Reckless Attack': {
      level: 2,
      description: `When you make your first attack roll on your turn, you can decide to attack recklessly. Doing so gives you Advantage on attack rolls using Strength until the start of your next turn, but attack rolls against you also have Advantage during that time.`,
    },
    'Primal Knowledge': {
      level: 3,
      description: `You gain proficiency in another skill from the Barbarian skill list. Additionally, while your Rage is active, you can make Acrobatics, Intimidation, Perception, Stealth, or Survival checks as Strength checks.`,
    },
    'Extra Attack': {
      level: 5,
      description: `You can attack twice instead of once whenever you take the Attack action on your turn.`,
    },
    'Fast Movement': {
      level: 5,
      description: `Your speed increases by 10 feet while you aren't wearing Heavy armor.`,
    },
    'Feral Instinct': {
      level: 7,
      description: `Your instincts are so honed that you have Advantage on Initiative rolls.`,
    },
    'Instinctive Pounce': {
      level: 7,
      description: `As part of the Bonus Action you take to enter your Rage, you can move up to half your Speed.`,
    },
    'Brutal Strike': {
      level: 9,
      description: `If you use Reckless Attack, you can forgo Advantage on one Strength-based attack roll. If it hits, the target takes an extra 1d10 damage of the weapon's type and suffers one Brutal Strike effect: Forceful Blow (pushed 15 ft, you can follow up to half speed) or Hamstring Blow (speed reduced 15 ft until your next turn).`,
    },
    'Relentless Rage': {
      level: 11,
      description: `If you drop to 0 HP while raging and don't die outright, you can make a DC 10 Constitution save. On a success, your HP instead changes to twice your Barbarian level. Each use after the first increases the DC by 5, resetting on a Short or Long Rest.`,
    },
    'Improved Brutal Strike': {
      level: 13,
      description: `You gain two new Brutal Strike options: Staggering Blow (target has Disadvantage on its next save and can't make Opportunity Attacks until your next turn) and Sundering Blow (the next attack roll against the target before your next turn gains +5). At level 17, Brutal Strike deals 2d10 extra damage and you can apply two different effects.`,
    },
    'Persistent Rage': {
      level: 15,
      description: `When you roll Initiative, you can regain all expended uses of Rage (once per Long Rest). Your Rage now lasts 10 minutes without needing extension each round, ending only if you are Unconscious or don Heavy armor.`,
    },
    'Indomitable Might': {
      level: 18,
      description: `If your total for a Strength check or Strength saving throw is less than your Strength score, you can use that score in place of the total.`,
    },
    'Primal Champion': {
      level: 20,
      description: `You embody primal power. Your Strength and Constitution scores increase by 4, to a maximum of 25.`,
    },
  },

  subclasses: [
    {
      id: 'path_of_the_giant',
      name: 'Path of the Giant',
      features: [
        { level: 3, name: "Giant's Power", description: "Learn Giant and a cantrip." },
        { level: 6, name: 'Elemental Cleaver', description: "Infuse weapon with elemental damage." }
      ]
    }
    // Add Berserker, Wild Heart, etc. from your barbarian_data.js here
  ]
};