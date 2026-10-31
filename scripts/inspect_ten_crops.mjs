import fs from 'fs';

const content = fs.readFileSync('src/data/agmarknetBenchmarks.ts', 'utf8');
const lines = content.split('\n');
let cur = {};
const list = [];
for (const line of lines) {
  if (line.includes('"marketId"') || line.includes('marketId:')) cur = {};
  const mCom = line.match(/(?:"commodity"|commodity):\s*['"]([^'"]+)['"]/);
  if (mCom) cur.commodity = mCom[1];
  const mMod = line.match(/(?:"modalPrice"|modalPrice):\s*(\d+)/);
  if (mMod) cur.modalPrice = parseInt(mMod[1]);
  const mArr = line.match(/(?:"arrivalDate"|arrivalDate):\s*['"]([^'"]+)['"]/);
  if (mArr) cur.arrivalDate = mArr[1];
  const mSource = line.match(/(?:"source"|source):\s*['"]([^'"]+)['"]/);
  if (mSource) cur.source = mSource[1];
  if (line.includes('}') && cur.commodity && cur.modalPrice) {
    list.push({...cur});
    cur = {};
  }
}
console.log('Total benchmark entries parsed:', list.length);
const crops = [
  { name: 'Tomato', id: 'tomato' },
  { name: 'Potato', id: 'potato' },
  { name: 'Brinjal', id: 'brinjal' },
  { name: 'Onion', id: 'onion' },
  { name: 'Carrot', id: 'carrot' },
  { name: 'Rice', id: 'rice' },
  { name: 'Wheat', id: 'wheat' },
  { name: 'Maize', id: 'maize' },
  { name: 'Chilli', id: 'chilli' },
  { name: 'Green Gram', id: 'green_gram' }
];

crops.forEach(c => {
  const match = list.find(x => 
    x.commodity.toLowerCase().includes(c.name.toLowerCase()) || 
    (c.id === 'rice' && x.commodity.toLowerCase().includes('paddy'))
  );
  console.log(`${c.name} (${c.id}): ${match ? match.modalPrice + ' (Arrival: ' + match.arrivalDate + ', ' + match.commodity + ')' : 'NOT FOUND'}`);
});
