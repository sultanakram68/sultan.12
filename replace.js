const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  'components/ProductDetails.tsx',
  'components/ui/card.tsx',
  'components/Navbar.tsx',
  'components/Footer.tsx',
  'components/CrowdFavoritesClient.tsx',
  'components/HeroSection.tsx',
  'components/ContactUs.tsx',
  'components/ui/button.tsx',
  'tailwind.config.ts',
  'README.md'
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/neon-green/g, 'neon-orange');
    content = content.replace(/neon-emerald/g, 'neon-orange');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('All green class names have been replaced with orange!');
