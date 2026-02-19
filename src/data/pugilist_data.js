export const PUGILIST_CLASS = {
  name: 'Pugilist',
  hitDie: 8,
  primaryAbility: 'Strength',
  saves: ['str', 'con'],
  armorProf: ['Light Armor'],
  weaponProf: ['Simple Weapons', 'Improvised Weapons', 'Whip', 'Derringer'],

  // Level table: level → { profBonus, fisticuffs, moxiePoints, features[] }
  levels: {
    1:  { profBonus: 2, fisticuffs: '1d6',  moxiePoints: 0,  features: ['Fisticuffs', 'Iron Chin'] },
    2:  { profBonus: 2, fisticuffs: '1d6',  moxiePoints: 2,  features: ['Moxie', 'Street Smart'] },
    3:  { profBonus: 2, fisticuffs: '1d6',  moxiePoints: 2,  features: ['Bloodied But Unbowed', 'Fight Club'] },
    4:  { profBonus: 2, fisticuffs: '1d6',  moxiePoints: 3,  features: ['Ability Score Improvement', 'Dig Deep'] },
    5:  { profBonus: 3, fisticuffs: '1d8',  moxiePoints: 3,  features: ['Extra Attack', 'Haymaker'] },
    6:  { profBonus: 3, fisticuffs: '1d8',  moxiePoints: 4,  features: ['Fight Club Feature', 'Moxie-Fueled Fists'] },
    7:  { profBonus: 3, fisticuffs: '1d8',  moxiePoints: 4,  features: ['Fancy Footwork', 'Shake It Off'] },
    8:  { profBonus: 3, fisticuffs: '1d8',  moxiePoints: 5,  features: ['Ability Score Improvement'] },
    9:  { profBonus: 4, fisticuffs: '1d8',  moxiePoints: 5,  features: ['Down But Not Out'] },
    10: { profBonus: 4, fisticuffs: '1d8',  moxiePoints: 6,  features: ['School of Hard Knocks'] },
    11: { profBonus: 4, fisticuffs: '1d10', moxiePoints: 6,  features: ['Fight Club Feature'] },
    12: { profBonus: 4, fisticuffs: '1d10', moxiePoints: 7,  features: ['Ability Score Improvement'] },
    13: { profBonus: 5, fisticuffs: '1d10', moxiePoints: 7,  features: ['Rabble Rouser'] },
    14: { profBonus: 5, fisticuffs: '1d10', moxiePoints: 8,  features: ['Unbreakable'] },
    15: { profBonus: 5, fisticuffs: '1d10', moxiePoints: 8,  features: ['Herculean'] },
    16: { profBonus: 5, fisticuffs: '1d10', moxiePoints: 9,  features: ['Ability Score Improvement'] },
    17: { profBonus: 6, fisticuffs: '1d12', moxiePoints: 9,  features: ['Fight Club Feature'] },
    18: { profBonus: 6, fisticuffs: '1d12', moxiePoints: 10, features: ['Fighting Spirit'] },
    19: { profBonus: 6, fisticuffs: '1d12', moxiePoints: 10, features: ['Ability Score Improvement'] },
    20: { profBonus: 6, fisticuffs: '1d12', moxiePoints: 12, features: ['Peak Physical Condition'] },
  },

  // Class features keyed by name
  features: {
    'Fisticuffs': {
      level: 1,
      description: `Your years of fighting in back alleys and taverns have given you mastery over combat styles that use unarmed strikes and pugilist weapons (simple melee weapons without the two-handed property, whips, and improvised weapons). You gain the following benefits while unarmed or using only pugilist weapons, wearing light or no armor, and not using a shield:\n\n• You can roll a d6 in place of the normal damage of your unarmed strike or pugilist weapon. This die changes as you gain levels (see level table).\n• When you use the Attack action with an unarmed strike or pugilist weapon, you can make one unarmed strike or grapple as a bonus action.`,
    },
    'Iron Chin': {
      level: 1,
      description: `While wearing light or no armor and not wielding a shield, your AC equals 12 + your Constitution modifier.`,
    },
    'Moxie': {
      level: 2,
      description: `Your experience laying the beatdown has given you a moxie you can channel in battle, represented by Moxie Points (see level table for maximum). You regain all expended moxie points on a short or long rest.\n\nYou start with three moxie features:\n\nBrace Up — Bonus action: spend 1 moxie point, roll your fisticuffs die + pugilist level + CON modifier and gain that many temporary hit points.\n\nThe Old One-Two — After the Attack action, spend 1 moxie point to make two unarmed strikes as a bonus action.\n\nStick and Move — Bonus action: spend 1 moxie point to make a shove attack or take the Dash action.`,
    },
    'Street Smart': {
      level: 2,
      description: `Carousing, shadowboxing, and sparring count as light activity for resting. After carousing in a settlement for 8+ hours, you know all public locations there and cannot be lost by non-magical means within that city.`,
    },
    'Bloodied But Unbowed': {
      level: 3,
      description: `When damage reduces you to half your maximum hit points or less, you can use your reaction to gain temporary hit points equal to your pugilist level + CON modifier and regain all expended moxie points. Recharges on short or long rest.`,
    },
    'Fight Club': {
      level: 3,
      description: `Choose a fight club: Arena Royale, Bloodhound Bruisers, Dog & Hound, Hand of Dread, Piss & Vinegar, the Squared Circle, or the Sweet Science. Your fight club grants features at 3rd, 6th, 11th, and 17th level.`,
    },
    'Ability Score Improvement': {
      level: 4,
      description: `Increase one ability score by 2, or two ability scores by 1. Cannot exceed 20. (Also at levels 8, 12, 16, 19.)`,
    },
    'Dig Deep': {
      level: 4,
      description: `Bonus action: gain resistance to bludgeoning, piercing, and slashing damage for one minute. At the end of that minute you gain one level of exhaustion.`,
    },
    'Extra Attack': {
      level: 5,
      description: `You can attack twice whenever you take the Attack action on your turn.`,
    },
    'Haymaker': {
      level: 5,
      description: `Before making an attack without disadvantage, you can declare haymakers. All weapon attack rolls until end of turn are made with disadvantage, but you use the maximum die result instead of rolling damage.`,
    },
    'Moxie-Fueled Fists': {
      level: 6,
      description: `Your unarmed strikes count as magical for overcoming resistance and immunity to non-magical attacks and damage.`,
    },
    'Fancy Footwork': {
      level: 7,
      description: `You gain proficiency in Dexterity saving throws.`,
    },
    'Shake It Off': {
      level: 7,
      description: `You can use your action to end one effect on yourself causing you to be charmed or frightened.`,
    },
    'Down But Not Out': {
      level: 9,
      description: `When you use Bloodied But Unbowed, you can also add your proficiency bonus to damage with unarmed attacks and pugilist weapons for the next minute. Recharges on long rest.`,
    },
    'School of Hard Knocks': {
      level: 10,
      description: `You have resistance to psychic damage and advantage on saving throws against effects that would make you stunned or unconscious.`,
    },
    'Rabble Rouser': {
      level: 13,
      description: `After taking a long rest by carousing in a settlement, you gain advantage on all Charisma (Persuasion) and Charisma (Intimidation) rolls against people who live there.`,
    },
    'Unbreakable': {
      level: 14,
      description: `You have advantage on Strength, Dexterity, and Constitution saving throws. When you fail a saving throw, you can spend 1 moxie point to reroll it and take the second result.`,
    },
    'Herculean': {
      level: 15,
      description: `Your carrying capacity is doubled. Damage you deal to inanimate objects with melee weapons or unarmed strikes is doubled. Your standing jump distance equals your running jump distance.`,
    },
    'Fighting Spirit': {
      level: 18,
      description: `When you have 4 or fewer exhaustion levels and are reduced to 0 HP, you regain half your maximum HP, half your maximum moxie points, and gain one exhaustion level. Recharges on long rest.`,
    },
    'Peak Physical Condition': {
      level: 20,
      description: `STR and CON increase by 2 (max 22). Long rests recover 2 exhaustion levels instead of 1 and restore all expended hit dice.`,
    },
  },
};

export const PUGILIST_SUBCLASSES = {
  sweet_science: {
    name: 'The Sweet Science',
    features: {
      3:  [
        { name: 'Cross Counter', description: `Use your reaction and spend 2 moxie points to reduce a melee attack's damage by 1d10 + STR modifier + pugilist level. If reduced to 0, make an unarmed or pugilist weapon attack against a creature within range as part of the same reaction.` },
      ],
      6:  [
        { name: 'One, Two, Three, Floor', description: `When you use The Old One-Two and hit the same creature with both attacks, spend 1 moxie to make an additional unarmed strike. On a hit, the creature is knocked prone.` },
      ],
      11: [
        { name: 'Float Like a Butterfly, Sting Like a Bee', description: `When you reduce damage to 0 and hit with Cross Counter, regain 1 moxie point.` },
      ],
      17: [
        { name: 'Knock Out', description: `When you hit with an unarmed strike or pugilist weapon, spend 1+ moxie points. Roll 3d12 + 2d12 per extra moxie point + pugilist level. If the total equals or exceeds the creature's remaining HP, it is unconscious for 10 minutes.` },
      ],
    },
  },
  squared_circle: {
    name: 'The Squared Circle',
    features: {
      3:  [
        { name: 'Compression Lock', description: `When a creature succeeds on breaking your grapple, use your reaction and spend 1 moxie to force them to reroll, using the second result.` },
        { name: 'Quick Pin', description: `When a hostile creature's movement provokes an opportunity attack, spend 1 moxie to make a grapple attack instead.` },
        { name: 'To the Mat', description: `Bonus action: spend 1 moxie to make a grapple attack. On success, the creature is also knocked prone.` },
      ],
      6:  [
        { name: 'Meat Shield', description: `While you have a creature grappled, you gain half cover against attacks by creatures you aren't grappling. When such a creature misses you, spend 1 moxie to redirect the attack against your grappled creature.` },
      ],
      11: [
        { name: 'Heavyweight', description: `You count as one size larger for grappling. You can move at full speed when dragging or carrying a grappled creature your size or smaller.` },
      ],
      17: [
        { name: 'Clean Finish', description: `While you have a creature grappled, you have advantage on all attacks against it. Unarmed strikes and pugilist weapon attacks against a grappled creature score a critical hit on a roll of 19 or 20.` },
      ],
    },
  },
  street_saint: {
    name: 'Street Saint',
    features: {
      3:  [
        { name: 'Channel Divinity', description: `Channel divine energy for two effects — Fists of Faith (bonus action: unarmed strikes deal +1d4 radiant for 1 minute, or +2d4 vs fiends/undead) or Grace of the Gods (bonus action: resistance to necrotic damage and +1d4 to saving throws for 1 minute). Recharges on short or long rest.` },
        { name: 'Lay On Hands', description: `Healing pool equal to 3× pugilist level, restored on long rest. Bonus action: touch a creature to restore HP from the pool. Expend 5 HP from pool to remove the poisoned condition.` },
      ],
      6:  [
        { name: 'Ravaged But Resolute', description: `When you use Bloodied But Unbowed, you can fully replenish your Lay On Hands pool. Recharges on long rest.` },
      ],
      11: [
        { name: 'Aura of Resilience', description: `When you use Dig Deep, radiate a 10-foot aura for 10 minutes. Allies within the aura gain resistance to bludgeoning, piercing, and slashing damage. Recharges on long rest.` },
      ],
      17: [
        { name: 'Hallowed Hands', description: `Once per turn when you hit with an unarmed strike or pugilist weapon, expend points from your Lay On Hands pool to deal extra radiant damage (max = pugilist level). Doubled against fiends and undead.` },
      ],
    },
  },
  piss_and_vinegar: {
    name: 'Piss & Vinegar',
    features: {
      3:  [
        { name: 'Bonus Proficiency', description: `Gain proficiency in Intimidation if you don't already have it.` },
        { name: 'Salty Salute', description: `Bonus action: provoke a creature within 60 feet. It must make a WIS save (DC 8 + prof + CHA mod) or take fisticuffs die + CHA mod psychic damage and have disadvantage on attack rolls not targeting you until your next turn.` },
      ],
      6:  [
        { name: 'Dirty Tricks', description: `Three tricks, each usable once per short or long rest:\n• Heelstomper — on damage, target makes DEX save or speed halved 1 minute, you gain 1 moxie.\n• Low Blow — on damage, target makes STR save or knocked prone, you gain 1 moxie.\n• Pocket Sand — bonus action, creature within 5 ft makes CON save or blinded until end of its next turn, you gain 1 moxie.` },
      ],
      11: [
        { name: 'Mean Old Cuss', description: `When making an Intimidation check, use reaction and spend 1 moxie for advantage. When a creature saves against a Piss & Vinegar feature, use reaction and spend 1 moxie to impose disadvantage on their roll.` },
      ],
      17: [
        { name: 'The Uncouth Art', description: `Salty Salute can now target a number of creatures within 60 feet equal to your pugilist level. Gain 1 moxie the first time each targeted creature hits you before your next turn. Recharges on long rest.` },
      ],
    },
  },
  hand_of_dread: {
    name: 'Hand of Dread',
    features: {
      3:  [
        { name: 'Black Magic', description: `Learn blade ward, eldritch blast, and prestidigitation cantrips (CON is your spellcasting modifier). Also learn one of: Abyssal, Infernal, or Sylvan.` },
        { name: 'Dread Hand', description: `Bonus action: transform one limb for 1 minute. Benefits: reroll 1s on unarmed damage dice; first miss each turn allows an additional unarmed strike; spend 2 moxie after the Attack action to make three unarmed strikes as a bonus action. Recharges on short or long rest.` },
      ],
      6:  [
        { name: 'Deal With The Devil', description: `Gain two Warlock eldritch invocations of your choice. Can replace one per level gained.` },
      ],
      11: [
        { name: 'Grotesque Growth', description: `When using Dread Hand, optionally grow one size category for 1 minute. Gain advantage on STR checks/saves, reach becomes 10 ft, melee attacks deal +1d4 damage. Gain 1 exhaustion level when it ends.` },
      ],
      17: [
        { name: 'Fountain of Viscera', description: `Action: spend 6 moxie points to execute a creature within reach. DEX save (DC 8 + prof + STR mod): failure = 100 piercing damage, success = 50. If reduced to 0 HP, creature dies instantly. Creatures within 30 ft must make WIS save or be frightened 1 minute. Recharges on long rest.` },
      ],
    },
  },
  dog_and_hound: {
    name: 'Dog & Hound',
    features: {
      3:  [
        { name: "Brawler's Best Friend", description: `Gain a hound companion (wolf stats + your proficiency bonus to AC, saves, attacks, damage). Gains 1d8 HP per level after 3rd. Bonus action: command it to Attack, Dash, Disengage, Dodge, or Help. Replace a dead hound after 8 hours bonding with a new canine.` },
        { name: 'Mutt With Moxie', description: `Your hound benefits from your moxie use:\n• Brace Up: hound gains the same temp HP.\n• The Old One-Two: hound can make one or both attacks instead of you.\n• Stick and Move: hound can take the Dash action.` },
      ],
      6:  [
        { name: 'Arcanine Bite', description: `Your hound's attacks count as magical for overcoming resistance and immunity.` },
        { name: 'Coordinated Attack', description: `When you take the Attack action, your hound can use its reaction to make a melee attack if it can see you.` },
      ],
      11: [
        { name: "Hound's Best Friend", description: `When a creature deals damage to your hound, use your reaction to make an opportunity attack against that creature if you're within range.` },
      ],
      17: [
        { name: 'Dire Hound', description: `Your hound uses dire wolf statistics (size remains Medium), with the bonuses from Brawler's Best Friend still applied.` },
      ],
    },
  },
  arena_royale: {
    name: 'Arena Royale',
    features: {
      3:  [
        { name: 'Bonus Proficiency', description: `Gain proficiency in Performance. If you already have it, gain proficiency in Intimidation or Persuasion.` },
        { name: 'Persona Libre', description: `Create an alternate persona (adopt/discard as bonus action). Others don't know you and the persona are the same unless told. Gain persona points = 3 + CHA mod (min 1), usable in place of moxie points or to add STR mod to CHA checks (while in persona). Recharges on long rest.` },
      ],
      6:  [
        { name: 'Work the Crowd', description: `Action (while in persona): creatures within 30 ft make WIS save (DC 8 + prof + STR mod) or are charmed (adoration) or frightened (fear) for 1 minute. Recharges on long rest.` },
      ],
      11: [
        { name: 'High Flyer', description: `Base movement +10 ft, jump distance doubled, bonus action Dash on your turn.` },
      ],
      17: [
        { name: 'Signature Move', description: `Create a named signature move. Replace one attack on your turn with it: jump up to your speed, make an attack with advantage. On hit: automatic critical + creature stunned until end of its next turn. Must long rest to reuse after a hit; regains use after 1 minute if you miss.` },
      ],
    },
  },
  bloodhound_bruisers: {
    name: 'Bloodhound Bruisers',
    features: {
      3:  [
        { name: 'Ever Vigilant', description: `Advantage on initiative rolls. During the first round of combat, advantage on attack rolls against creatures who haven't acted yet.` },
        { name: 'Detective Work', description: `Gain proficiency in two of: Insight, Investigation, or Perception. Spend 1 moxie to gain advantage on Investigation, Insight, or Perception checks.` },
      ],
      6:  [
        { name: 'Scrap Like a Sleuth', description: `Bonus action: spend 2 moxie to hone in on an enemy within 30 ft. Gain advantage on attacks against it and add proficiency bonus to AC against its attacks, for 1 minute.` },
      ],
      11: [
        { name: 'Heart of the City', description: `After a long rest in a settlement, become familiar with it. Benefits while there: can't be surprised, +prof to initiative, darkvision 120 ft, double proficiency on Insight/Investigation/Perception checks, can't be lost, move twice as fast outside combat.` },
      ],
      17: [
        { name: 'Eyes Wide Open', description: `Bonus action: spend 1 moxie to open your senses for 1 minute. Advantage on saves vs blinded/deafened and truesight to 30 feet.` },
      ],
    },
  },
};
