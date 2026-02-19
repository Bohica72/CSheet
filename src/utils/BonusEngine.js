import { getItemByName } from './ItemStore';

export function getEquippedBonuses(inventoryEntries) {
  let bonusAC = 0;
  let bonusWeapon = 0;
  let attunedCount = 0;

  for (const entry of inventoryEntries) {
    if (!entry.equipped) continue;
    const item = getItemByName(entry.itemName);
    if (!item) continue;
    if (item.BonusAC) bonusAC += item.BonusAC;
    if (item.BonusWeapon) bonusWeapon += item.BonusWeapon;
    if (item.Attunement === 'Yes') attunedCount++;
  }

  return { bonusAC, bonusWeapon, attunedCount };
}

export const MAX_ATTUNEMENT = 3;
