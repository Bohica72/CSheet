export const FIGHTER = {
  id: 'fighter',
  name: 'Fighter',
  source: 'XPHB',
  hitDie: 10,
  saves: ['str', 'con'],
  primaryAbility: 'str or dex',
  spellcasting: { isSpellcaster: false, ability: null },
  
  // Resource definition for the UI Grid
  resource: { 
    name: 'Action Surge', 
    type: 'shortRest', 
    displayType: 'numeric' 
  },

  levels: {
    1:  { profBonus: 2, features: ['Fighting Style', 'Second Wind'], resourceMax: 0 },
    2:  { profBonus: 2, features: ['Action Surge'], resourceMax: 1 },
    3:  { profBonus: 2, features: ['Martial Archetype'], resourceMax: 1 },
    4:  { profBonus: 2, features: ['Ability Score Improvement'], resourceMax: 1 },
    5:  { profBonus: 3, features: ['Extra Attack'], resourceMax: 1 },
    6:  { profBonus: 3, features: ['Ability Score Improvement'], resourceMax: 1 },
    7:  { profBonus: 3, features: ['Archetype Feature'], resourceMax: 1 },
    8:  { profBonus: 3, features: ['Ability Score Improvement'], resourceMax: 1 },
    9:  { profBonus: 4, features: ['Indomitable'], resourceMax: 1 },
    10: { profBonus: 4, features: ['Fighting Style Improvement'], resourceMax: 1 },
    11: { profBonus: 4, features: ['Extra Attack (2)'], resourceMax: 1 },
    12: { profBonus: 4, features: ['Ability Score Improvement'], resourceMax: 1 },
    13: { profBonus: 5, features: ['Indomitable Improvement'], resourceMax: 1 },
    14: { profBonus: 5, features: ['Ability Score Improvement'], resourceMax: 1 },
    15: { profBonus: 5, features: ['Archetype Feature'], resourceMax: 1 },
    16: { profBonus: 5, features: ['Ability Score Improvement'], resourceMax: 1 },
    17: { profBonus: 6, features: ['Action Surge Improvement'], resourceMax: 2 },
    18: { profBonus: 6, features: ['Indomitable (3 uses)'], resourceMax: 2 },
    19: { profBonus: 6, features: ['Ability Score Improvement'], resourceMax: 2 },
    20: { profBonus: 6, features: ['Extra Attack (3)'], resourceMax: 2 },
  },

  featureDefinitions: {
    'Fighting Style': {
      actionType: 'Passive',
      description: `Choose a combat discipline such as archery, defense, dueling, or great weapon fighting.`
    },
    'Second Wind': {
      actionType: 'Bonus Action',
      description: `Regain hit points equal to 1d10 + your fighter level. Recharges on short or long rest.`
    },
    'Action Surge': {
      actionType: 'Special',
      description: `Take one additional action on your turn.`
    },
    'Extra Attack': {
      actionType: 'Passive',
      description: `When you take the Attack action, you can attack twice instead of once.`
    },
    'Indomitable': {
      actionType: 'Reaction',
      description: `Reroll a failed saving throw. You must use the new roll.`
    }
  },

  subclasses: [
    {
      id: 'champion',
      name: 'Champion',
      shortName: 'Champion',
      source: 'XPHB',
      features: [
        { level: 3, name: 'Improved Critical', description: `Your weapon attacks score a critical hit on a roll of 19 or 20.` },
        { level: 7, name: 'Remarkable Athlete', description: `Add half your proficiency bonus to STR, DEX, and CON checks you’re not proficient in. Jump distance increases.` },
        { level: 10, name: 'Additional Fighting Style', description: `Learn a second fighting style.` },
        { level: 15, name: 'Superior Critical', description: `Your weapon attacks critically hit on an 18–20.` },
        { level: 18, name: 'Survivor', description: `At the start of each turn, regain HP equal to 5 + CON modifier if below half HP and not at 0.` }
      ]
    },
    {
      id: 'battle_master',
      name: 'Battle Master',
      shortName: 'Battle Master',
      source: 'XPHB',
      features: [
        { level: 3, name: 'Combat Superiority', description: `Gain superiority dice and maneuvers.` },
        { level: 3, name: 'Student of War', description: `Gain proficiency with one artisan’s tool.` },
        { level: 7, name: 'Know Your Enemy', description: `Spend 1 minute studying a creature to learn relative stats.` },
        { level: 10, name: 'Improved Combat Superiority', description: `Superiority dice increase in size.` },
        { level: 15, name: 'Relentless', description: `Regain one superiority die at the start of combat if you have none.` },
        { level: 18, name: 'Perfect Maneuver', description: `Use maneuvers with exceptional efficiency.` }
      ]
    },
    {
      id: 'eldritch_knight',
      name: 'Eldritch Knight',
      shortName: 'Eldritch Knight',
      source: 'XPHB',
      features: [
        { level: 3, name: 'Spellcasting', description: `Learn limited arcane magic (INT).` },
        { level: 3, name: 'Weapon Bond', description: `Ritually bond with a weapon to prevent disarmament and summon it.` },
        { level: 7, name: 'War Magic', description: `When you cast a cantrip, make a weapon attack as a bonus action.` },
        { level: 10, name: 'Eldritch Strike', description: `Weapon strikes give foe disadvantage on their next save against your spells.` },
        { level: 15, name: 'Arcane Charge', description: `Teleport up to 30 feet when you use Action Surge.` },
        { level: 18, name: 'Improved War Magic', description: `When you cast a spell, make a weapon attack as a bonus action.` }
      ]
    },
    {
      id: 'brawler',
      name: 'Brawler',
      shortName: 'Brawler',
      source: 'XPHB',
      features: [
        { level: 3, name: 'Improvised Expert', description: `Treat improvised weapons and unarmed strikes as martial weapons.` },
        { level: 3, name: 'Grappling Prowess', description: `Advantage on checks to grapple or shove.` },
        { level: 7, name: 'Close Quarters Combat', description: `Grappled creatures take extra damage.` },
        { level: 10, name: 'Improvised Mastery', description: `Improvised weapons gain special properties.` },
        { level: 15, name: 'Crushing Hold', description: `Grapples hinder movement and deal ongoing damage.` },
        { level: 18, name: 'Unstoppable Brawler', description: `Shrug off conditions and gain temp HP in hand-to-hand combat.` }
      ]
    }
  ]
};