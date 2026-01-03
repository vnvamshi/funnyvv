const fs = require('fs');
const path = require('path');

// Read the existing glb.json
const glbPath = path.join(__dirname, 'public', 'glb.json');
const data = JSON.parse(fs.readFileSync(glbPath, 'utf8'));

const residenceTypes = ['1NE', '2WO', '3HREE', '4OUR'];
const amenitiesOptions = [
  ['Clubhouses', 'Rooftop'],
  ['Clubhouses'],
  ['Rooftop'],
  ['Clubhouses', 'Rooftop', 'Helipad'],
  ['Helipad', 'Clubhouses']
];

// Update each plane's properties
Object.keys(data).forEach(planeName => {
  const floor = data[planeName].floor;
  data[planeName].property = data[planeName].property.map((prop, idx) => {
    // Calculate price based on floor (higher floors = higher prices)
    // Starting from 3 crores, increasing by ~0.1 crore per floor
    // Plus variation based on residence type
    const basePrice = 3 + (floor * 0.1);
    const price = Number((basePrice + (idx * 0.3)).toFixed(2));
    
    return {
      ...prop,
      price, // in crores
      residenceType: prop.id,
      amenities: amenitiesOptions[idx % amenitiesOptions.length]
    };
  });
});

// Write the updated data back to glb.json
fs.writeFileSync(glbPath, JSON.stringify(data, null, 2));
console.log('Successfully updated glb.json with price and amenities data!');
