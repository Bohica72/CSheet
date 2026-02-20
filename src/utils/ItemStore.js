import itemsData from '../data/items.json';

// Full item list, available synchronously
export const ALL_ITEMS = itemsData;

// Search by name, returns up to `limit` results
export function searchItems(query, limit = 30) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return ALL_ITEMS.filter(item =>
    item.Name.toLowerCase().includes(q)
  ).slice(0, limit);
}

// Look up a single item by exact name
export function getItemByName(name) {
  console.log('getItemByName called with:', name);
  const result = ALL_ITEMS.find(item => item.Name === name) ?? null;
  console.log('getItemByName result:', result?.Name ?? 'null');
  return result;
}
