// src/utils/featUtils.js
export function formatFeatSummary(feat) {
  const parts = [];
  if (feat.abilityBonus?.type === 'fixed') {
    const bonuses = Object.entries(feat.abilityBonus.bonuses)
      .map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', ');
    parts.push(bonuses);
  }
  if (feat.abilityBonus?.type === 'choice') {
    parts.push(`+1 to ${feat.abilityBonus.from.map(s => s.toUpperCase()).join(' or ')}`);
  }
  if (feat.armorProficiencies) parts.push('Armor proficiency');
  if (feat.skillProficiencies)  parts.push('Skill proficiencies');
  return parts.length ? parts.join(' · ') : 'Feature';
}
