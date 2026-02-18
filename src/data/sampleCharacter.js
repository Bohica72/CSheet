export const sampleCharacter = {
  id: "char_001",
  name: "Thorin Ironforge",
  race: "Dwarf",
  classes: [{ className: "Fighter", level: 3 }],
  abilities: {
    str: 16,
    dex: 12,
    con: 14,
    int: 10,
    wis: 13,
    cha: 8
  },
  proficiencyBonus: 2,
  hitPoints: { max: 28, current: 28, temp: 0 },
  proficiencies: {
    saves: ["str", "con"],
    skills: ["athletics", "intimidation", "perception"]
  }
};
