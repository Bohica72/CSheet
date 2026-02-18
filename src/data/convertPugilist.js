import pugilistRaw from '../../pugilistsource.json' with { type: 'json' };
import { convertClassData } from '../utils/classDataConverter.js';
import fs from 'fs';

// Convert the data
const pugilistConverted = convertClassData(pugilistRaw);

// Write to a new file (same directory as this script)
fs.writeFileSync(
  './pugilist.json',  // Changed from 'src/data/pugilist.json'
  JSON.stringify(pugilistConverted, null, 2)
);

console.log('✅ Pugilist class data converted!');
console.log('📁 Output: src/data/pugilist.json');
console.log(`📊 Features: ${Object.keys(pugilistConverted.featureDefinitions).length}`);
console.log(`📊 Subclasses: ${pugilistConverted.subclasses.length}`);
