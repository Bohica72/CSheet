export const FIGHTER_CLASS = {
  name: 'Fighter',
  hitDie: 10,
  primaryAbility: 'Strength or Dexterity',
  saves: ['str', 'con'],
  armorProf: ['All Armor', 'Shields'],
  weaponProf: ['Simple Weapons', 'Martial Weapons'],
  unarmedAttackName: null,
  unarmedAttackTag: null,

  tableColumns: [
    { key: 'profBonus',     label: 'Prof',    flex: 0.6 },
    { key: 'weaponMastery', label: 'Mastery', flex: 0.8 },
    { key: 'features',      label: 'Features', flex: 2 },
  ],

  // Level table
  levels: {
    1:  { profBonus: 2, weaponMastery: '1', features: ['Fighting Style', 'Second Wind'] },
    2:  { profBonus: 2, weaponMastery: '1', features: ['Action Surge'] },
    3:  { profBonus: 2, weaponMastery: '2', features: ['Martial Archetype'] },
    4:  { profBonus: 2, weaponMastery: '2', features: ['Ability Score Improvement'] },
    5:  { profBonus: 3, weaponMastery: '2', features: ['Extra Attack'] },
    6:  { profBonus: 3, weaponMastery: '2', features: ['Ability Score Improvement'] },
    7:  { profBonus: 3, weaponMastery: '2', features: ['Archetype Feature'] },
    8:  { profBonus: 3, weaponMastery: '2', features: ['Ability Score Improvement'] },
    9:  { profBonus: 4, weaponMastery: '2', features: ['Indomitable'] },
    10: { profBonus: 4, weaponMastery: '3', features: ['Fighting Style Improvement'] },
    11: { profBonus: 4, weaponMastery: '3', features: ['Extra Attack (2)'] },
    12: { profBonus: 4, weaponMastery: '3', features: ['Ability Score Improvement'] },
    13: { profBonus: 5, weaponMastery: '3', features: ['Indomitable Improvement'] },
    14: { profBonus: 5, weaponMastery: '3', features: ['Ability Score Improvement'] },
    15: { profBonus: 5, weaponMastery: '3', features: ['Archetype Feature'] },
    16: { profBonus: 5, weaponMastery: '3', features: ['Ability Score Improvement'] },
    17: { profBonus: 6, weaponMastery: '3', features: ['Action Surge Improvement'] },
    18: { profBonus: 6, weaponMastery: '3', features: ['Indomitable (3 uses)'] },
    19: { profBonus: 6, weaponMastery: '3', features: ['Ability Score Improvement'] },
    20: { profBonus: 6, weaponMastery: '3', features: ['Extra Attack (3)'] },
  },

  // Class features
  features: {
    'Fighting Style': {
      level: 1,
      description: `Choose a combat discipline such as archery, defense, dueling, or great weapon fighting. Each style grants a passive benefit that shapes your approach to battle.`,
    },
    'Second Wind': {
      level: 1,
      description: `Bonus action: regain hit points equal to 1d10 + your fighter level. Represents grit and battlefield endurance. Recharges on short or long rest.`,
    },
    'Action Surge': {
      level: 2,
      description: `Once per short or long rest, take one additional action on your turn. At 17th level, you can use this feature twice before resting.`,
    },
    'Martial Archetype': {
      level: 3,
      description: `Choose a subclass that defines your combat specialty. Grants features at 3rd, 7th, 10th, 15th, and 18th level depending on archetype.`,
    },
    'Ability Score Improvement': {
      level: 4,
      description: `Increase one ability score by 2 or two ability scores by 1. Cannot exceed 20. Also gained at levels 6, 8, 12, 14, 16, and 19.`,
    },
    'Extra Attack': {
      level: 5,
      description: `When you take the Attack action, you can attack twice instead of once. Increases to three attacks at 11th level and four at 20th level.`,
    },
    'Indomitable': {
      level: 9,
      description: `Once per long rest, reroll a failed saving throw. Gain additional uses at 13th and 18th level.`,
    },
    'Fighting Style Improvement': {
      level: 10,
      description: `Refine your chosen fighting style or learn a new one, enhancing your combat technique.`,
    },
    'Extra Attack (2)': {
      level: 11,
      description: `You can now make three attacks when you take the Attack action.`,
    },
    'Indomitable Improvement': {
      level: 13,
      description: `You can now use Indomitable twice between long rests.`,
    },
    'Action Surge Improvement': {
      level: 17,
      description: `You can now use Action Surge twice between rests.`,
    },
    'Indomitable (3 uses)': {
      level: 18,
      description: `You can now use Indomitable three times between long rests.`,
    },
    'Extra Attack (3)': {
      level: 20,
      description: `You can now make four attacks when you take the Attack action.`,
    },
  },
};

export const FIGHTER_SUBCLASSES = {
  champion: {
    name: 'champion',
    features: {
      3: [
        { name: 'Improved Critical', description: `Your weapon attacks score a critical hit on a roll of 19 or 20, reflecting relentless precision.` },
      ],
      7: [
        { name: 'Remarkable Athlete', description: `Add half your proficiency bonus to STR, DEX, and CON checks you’re not proficient in. Your jump distance also increases.` },
      ],
      10: [
        { name: 'Additional Fighting Style', description: `Learn a second fighting style, expanding your combat versatility.` },
      ],
      15: [
        { name: 'Superior Critical', description: `Your weapon attacks now critically hit on an 18–20.` },
      ],
      18: [
        { name: 'Survivor', description: `At the start of each turn, regain hit points equal to 5 + CON modifier if you are below half HP and not at 0.` },
      ],
    },
  },

  battle_master: {
    name: 'Battle Master',
    features: {
      3: [
        { name: 'Combat Superiority', description: `Gain superiority dice and maneuvers that let you control the battlefield, bolster allies, or exploit openings.` },
        { name: 'Student of War', description: `Gain proficiency with one artisan’s tool, reflecting disciplined training.` },
      ],
      7: [
        { name: 'Know Your Enemy', description: `Spend 1 minute studying a creature to learn key combat-relevant information such as STR, DEX, AC, or HP relative to your own.` },
      ],
      10: [
        { name: 'Improved Combat Superiority', description: `Your superiority dice increase in size, enhancing your maneuvers.` },
      ],
      15: [
        { name: 'Relentless', description: `Regain one superiority die at the start of combat if you begin with none.` },
      ],
      18: [
        { name: 'Perfect Maneuver', description: `Your mastery of technique allows you to use maneuvers with exceptional efficiency and reliability.` },
      ],
    },
  },

  eldritch_knight: {
    name: 'Eldritch Knight',
    features: {
      3: [
        { name: 'Spellcasting', description: `Learn limited arcane magic focused on abjuration and evocation. INT is your spellcasting ability.` },
        { name: 'Weapon Bond', description: `Ritually bond with a weapon, preventing it from being disarmed and allowing you to summon it to your hand.` },
      ],
      7: [
        { name: 'War Magic', description: `When you cast a cantrip, you can make a weapon attack as a bonus action.` },
      ],
      10: [
        { name: 'Eldritch Strike', description: `Your weapon strikes disrupt a foe’s defenses, giving them disadvantage on the next saving throw against your spells.` },
      ],
      15: [
        { name: 'Arcane Charge', description: `When you use Action Surge, you can teleport up to 30 feet before or after the additional action.` },
      ],
      18: [
        { name: 'Improved War Magic', description: `When you cast a spell, you can make a weapon attack as a bonus action.` },
      ],
    },
  },

  brawler: {
    name: 'Brawler',
    features: {
      3: [
        { name: 'Improvised Expert', description: `You excel with improvised weapons and unarmed strikes, treating them as martial weapons you are proficient with.` },
        { name: 'Grappling Prowess', description: `Gain advantage on checks to grapple or shove, reflecting brutal close‑quarters technique.` },
      ],
      7: [
        { name: 'Close Quarters Combat', description: `Creatures you grapple take extra damage from your attacks, and you can drag them more easily.` },
      ],
      10: [
        { name: 'Improvised Mastery', description: `Improvised weapons deal increased damage and gain special properties based on their form.` },
      ],
      15: [
        { name: 'Crushing Hold', description: `Your grapples become punishing restraints that hinder movement and deal ongoing damage.` },
      ],
      18: [
        { name: 'Unstoppable Brawler', description: `You can shrug off conditions and push through pain, gaining temporary HP or ending impairments when you fight hand‑to‑hand.` },
      ],
    },
  },

  psi_warrior: {
    name: 'Psi Warrior',
    features: {
      3: [
        { name: 'Psionic Power', description: `Gain a pool of psionic dice used to fuel telekinetic strikes, protective barriers, or movement abilities.` },
        { name: 'Telekinetic Adept', description: `You can subtly move objects or manipulate the battlefield with focused mental force.` },
      ],
      7: [
        { name: 'Telekinetic Bulwark', description: `Create a protective wave of psionic energy that shields you and nearby allies.` },
      ],
      10: [
        { name: 'Guarded Mind', description: `Gain resistance to psychic damage and advantage on saves against charm and fear.` },
      ],
      15: [
        { name: 'Bulwark Mastery', description: `Your protective psionic abilities extend further and last longer, reinforcing allies in battle.` },
      ],
      18: [
        { name: 'Telekinetic Master', description: `You can cast powerful telekinetic spells and manipulate the battlefield with immense mental force.` },
      ],
    },
  },
};
