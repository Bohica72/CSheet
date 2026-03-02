// src/data/classes/barbarian_data.js

// ─── Class Features ───────────────────────────────────────────────────────────

export const BARBARIAN_CLASS = {
  id: 'barbarian',
  name: 'Barbarian',
  source: 'XPHB',
  hitDie: 12,
  saves: ['str', 'con'],
  spellcaster: false,
  primaryAbility: 'str',
  subclassTitle: 'Barbarian Subclass',

  proficiencies: {
    armor: ['light', 'medium', 'shield'],
    weapons: ['simple', 'martial'],
    skills: { choose: 2, from: ['animal handling', 'athletics', 'intimidation', 'nature', 'perception', 'survival'] },
  },

  rageDamage: {
    1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2,
    9: 3, 10: 3, 11: 3, 12: 3, 13: 3, 14: 3, 15: 3, 16: 3,
    17: 4, 18: 4, 19: 4, 20: 4,
  },

  ragesPerRest: {
    1: 2, 2: 2, 3: 3, 4: 3, 5: 3, 6: 4, 7: 4, 8: 4,
    9: 4, 10: 4, 11: 4, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5,
    17: 6, 18: 6, 19: 6, 20: Infinity,
  },

  weaponMastery: {
    1: 2, 2: 2, 3: 2, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3,
    9: 3, 10: 4, 11: 4, 12: 4, 13: 4, 14: 4, 15: 4, 16: 4,
    17: 4, 18: 4, 19: 4, 20: 4,
  },

  levels: {
    1:  { profBonus: 2, features: ['Rage', 'Unarmored Defense', 'Weapon Mastery'] },
    2:  { profBonus: 2, features: ['Danger Sense', 'Reckless Attack'] },
    3:  { profBonus: 2, features: ['Barbarian Subclass', 'Primal Knowledge'] },
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
    20: { profBonus: 6, features: ['Primal Champion'] },
  },

  classFeatures: {
    'Rage': {
      level: 1,
      description: `You can imbue yourself with a primal power called Rage as a Bonus Action if you aren't wearing Heavy armor. While active: you have Resistance to Bludgeoning, Piercing, and Slashing damage; you gain a Rage Damage bonus to Strength-based attacks and Unarmed Strikes; you have Advantage on Strength checks and saving throws; and you can't maintain Concentration or cast spells. You can extend Rage each round by making an attack roll against an enemy, forcing an enemy to make a saving throw, or taking a Bonus Action. Rage lasts up to 10 minutes and ends early if you don Heavy armor or are Incapacitated.`,
    },
    'Unarmored Defense': {
      level: 1,
      description: `While you aren't wearing any armor, your base AC equals 10 + your Dexterity modifier + your Constitution modifier. You can use a Shield and still gain this benefit.`,
    },
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
};

// ─── Subclasses ───────────────────────────────────────────────────────────────

export const BARBARIAN_SUBCLASSES = {

  path_of_the_giant: {
    name: 'Path of the Giant',
    shortName: 'Giant',
    source: 'BGG',
    features: {
      3: [
        {
          name: "Giant Power",
          description: `You learn to speak, read, and write Giant (or another language if you already know it), and you learn either the Druidcraft or Thaumaturgy cantrip. Wisdom is your spellcasting ability for this spell.`,
        },
        {
          name: "Giant's Havoc",
          description: `While raging, you gain two benefits. Crushing Throw: when you hit with a ranged attack using a thrown weapon with Strength, you add your Rage Damage bonus to the damage roll. Giant Stature: your reach increases by 5 feet, and if you are smaller than Large you become Large (along with anything you're wearing), space permitting.`,
        },
      ],
      6: [
        {
          name: 'Elemental Cleaver',
          description: `When you enter your Rage, you can infuse one held weapon with an elemental damage type: acid, cold, fire, lightning, or thunder. While raging with the infused weapon, it deals that damage type, deals an extra 1d6 of that type on a hit, and gains the thrown property (20/60 ft) — returning to your hand instantly after each throw. As a Bonus Action while raging, you can change the damage type. The benefits are suppressed if another creature wields it.`,
        },
      ],
      10: [
        {
          name: 'Mighty Impel',
          description: `As a Bonus Action while raging, you can choose one Medium or smaller creature within your reach and move it to an unoccupied space within 30 feet of you. An unwilling creature makes a Strength save (DC 8 + proficiency bonus + Strength modifier) to resist. If the creature ends the movement in mid-air without support, it falls and lands Prone.`,
        },
      ],
      14: [
        {
          name: 'Demiurgic Colossus',
          description: `When you rage, your reach increases by 10 feet (instead of 5), your size can increase to Large or Huge (your choice), and Mighty Impel can now move Large or smaller creatures. In addition, the extra damage from Elemental Cleaver increases to 2d6.`,
        },
      ],
    },
  },

  berserker: {
    name: 'Path of the Berserker',
    shortName: 'Berserker',
    source: 'XPHB',
    features: {
      3: [
        {
          name: 'Frenzy',
          description: `You can go into a frenzy when you Rage. If you do, for the duration of your Rage you can make a single melee weapon attack as a Bonus Action on each of your turns. When your Rage ends, you gain one level of Exhaustion.`,
        },
      ],
      6: [
        {
          name: 'Mindless Rage',
          description: `You can't be Charmed or Frightened while raging. If you are Charmed or Frightened when you enter your Rage, the effect is suspended for the duration of the Rage.`,
        },
      ],
      10: [
        {
          name: 'Retaliation',
          description: `When you take damage from a creature that is within 5 feet of you, you can use your Reaction to make one melee weapon attack against that creature.`,
        },
      ],
      14: [
        {
          name: 'Intimidating Presence',
          description: `As a Bonus Action, you can frighten someone with your menace. One creature of your choice within 30 feet must succeed on a Wisdom saving throw (DC 8 + proficiency bonus + Charisma modifier) or be Frightened until the end of your next turn. On subsequent turns, you can use a Bonus Action to extend the duration. The effect ends if the creature succeeds on its save, if it can't see or hear you, or if you are Incapacitated.`,
        },
      ],
    },
  },

  wild_heart: {
    name: 'Path of the Wild Heart',
    shortName: 'Wild Heart',
    source: 'XPHB',
    features: {
      3: [
        {
          name: 'Animal Speaker',
          description: `You can cast Beast Sense and Speak with Animals as rituals.`,
        },
        {
          name: 'Rage of the Wilds',
          description: `Your Rage taps into the primal power of animals. When you activate Rage, choose one of the following: Bear (resistance to all damage types except Psychic while raging), Eagle (Bonus Action to Dash during Rage, attacks of opportunity against you have Disadvantage), or Wolf (friendly creatures within 10 ft have Advantage on attack rolls against enemies within 5 ft of you).`,
        },
      ],
      6: [
        {
          name: 'Aspect of the Wilds',
          description: `You gain one of the following: Cheetah (Dash as Bonus Action, +30 ft speed), Elephant (Advantage on Strength checks, push/knock prone on hit while raging), or Owl (no penalty for attacking in darkness, see in dim light as bright light).`,
        },
      ],
      10: [
        {
          name: 'Nature Speaker',
          description: `You can cast Commune with Nature as a ritual.`,
        },
      ],
      14: [
        {
          name: 'Power of the Wilds',
          description: `When you activate Rage, choose one: Lion (frightening roar — enemies within 30 ft make Wisdom save or are Frightened), Ram (your melee attacks can push creatures up to 15 ft), or Snake (bite attack deals Poison damage and poisons the target).`,
        },
      ],
    },
  },

  world_tree: {
    name: 'Path of the World Tree',
    shortName: 'World Tree',
    source: 'XPHB',
    features: {
      3: [
        {
          name: 'Vitality of the Tree',
          description: `Your Rage taps into the life force of the World Tree. When you activate your Rage, you gain temporary HP equal to your Barbarian level. While raging, when a creature within 10 feet of you takes damage, you can use your Reaction to grant that creature a number of temporary HP equal to your Rage Damage bonus.`,
        },
      ],
      6: [
        {
          name: 'Branches of the Tree',
          description: `When a creature hits you with an attack roll and another creature is within 5 feet of you, you can use your Reaction to teleport the attacker to an unoccupied space within 5 feet of that other creature (Strength save, DC 8 + proficiency bonus + Strength modifier to resist). The attacker is Incapacitated until the start of its next turn.`,
        },
      ],
      10: [
        {
          name: 'Battering Roots',
          description: `During your Rage, your reach increases by 10 feet. When you hit a creature with a melee attack, you can force it to make a Strength saving throw. On a failure, it is moved up to 15 feet in any direction you choose.`,
        },
      ],
      14: [
        {
          name: 'Travel Along the Tree',
          description: `When you activate your Rage, and as a Bonus Action while raging, you can teleport up to 60 feet to an unoccupied space you can see. Once per Rage, you can extend this to 150 feet and bring up to six willing creatures within 10 feet of you, each appearing within 10 feet of your destination.`,
        },
      ],
    },
  },

  zealot: {
    name: 'Path of the Zealot',
    shortName: 'Zealot',
    source: 'XPHB',
    features: {
      3: [
        {
          name: 'Divine Fury',
          description: `While your Rage is active, the first creature you hit each turn with a weapon or Unarmed Strike takes extra damage equal to 1d6 + half your Barbarian level (rounded down). You choose Necrotic or Radiant each time you deal the damage.`,
        },
        {
          name: 'Warrior of the Gods',
          description: `You have a pool of four d12s for self-healing. As a Bonus Action, expend any number of dice, roll them, and regain that many HP. The pool fully recharges on a Long Rest. The pool grows to 5d12 at level 6, 6d12 at level 12, and 7d12 at level 17.`,
        },
      ],
      6: [
        {
          name: 'Fanatical Focus',
          description: `Once per active Rage, if you fail a saving throw, you can reroll it with a bonus equal to your Rage Damage bonus. You must use the new roll.`,
        },
      ],
      10: [
        {
          name: 'Zealous Presence',
          description: `As a Bonus Action, unleash a divine battle cry. Up to ten other creatures of your choice within 60 feet gain Advantage on attack rolls and saving throws until the start of your next turn. Recharges on Long Rest, or by expending a use of Rage.`,
        },
      ],
      14: [
        {
          name: 'Rage of the Gods',
          description: `When you activate your Rage, you can assume a divine warrior form lasting 1 minute or until 0 HP (once per Long Rest). While in this form: you have a Fly Speed equal to your Speed and can hover; you have Resistance to Necrotic, Psychic, and Radiant damage; and when a creature within 30 feet would drop to 0 HP, you can use your Reaction and expend a Rage use to set their HP to your Barbarian level instead.`,
        },
      ],
    },
  },

};
