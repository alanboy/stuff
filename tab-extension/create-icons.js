// Simple script to create base64 encoded PNG icons
// Run this with: node create-icons.js

const fs = require('fs');

// Create a simple SVG icon
const createSVG = (size) => `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <circle cx="${size/2}" cy="${size/2}" r="${size/2 - 2}" fill="#10b981"/>
  <path d="M ${size*0.3} ${size*0.5} L ${size*0.45} ${size*0.65} L ${size*0.7} ${size*0.35}" 
        stroke="white" stroke-width="${size/8}" stroke-linecap="round" 
        stroke-linejoin="round" fill="none"/>
</svg>
`;

// For now, just create SVG files
[16, 48, 128].forEach(size => {
  fs.writeFileSync(`icons/icon${size}.svg`, createSVG(size));
});

console.log('SVG icons created. For PNG icons, you can:');
console.log('1. Open icons/generate-icons.html in a browser');
console.log('2. Or use an online SVG to PNG converter');
console.log('3. Or install sharp: npm install sharp, then convert programmatically');
