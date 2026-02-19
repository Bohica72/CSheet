const fs = require('fs');
const path = require('path');

const csv = fs.readFileSync(path.join(__dirname, '../src/data/items.csv'), 'utf8');
const lines = csv.trim().split('\n');
const headers = lines[0].split(',').map(h => h.trim());

const items = lines.slice(1).map(line => {
  // Handle quoted fields containing commas
  const values = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') { inQuotes = !inQuotes; }
    else if (char === ',' && !inQuotes) { values.push(current.trim()); current = ''; }
    else { current += char; }
  }
  values.push(current.trim());

  return headers.reduce((obj, header, i) => {
    const val = values[i] ?? '';
    // Coerce numeric bonus fields
    if (header === 'BonusAC' || header === 'BonusWeapon' || header === 'Charges' || header === 'Weight') {
      obj[header] = val === '' ? null : Number(val);
    } else {
      obj[header] = val;
    }
    return obj;
  }, {});
});

fs.writeFileSync(
  path.join(__dirname, '../src/data/items.json'),
  JSON.stringify(items, null, 2)
);
console.log(`✅ Converted ${items.length} items to src/data/items.json`);
