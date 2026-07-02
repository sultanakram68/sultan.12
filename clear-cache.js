const fs = require('fs');
const path = require('path');

const nextDir = path.join(__dirname, '.next');

if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log('Successfully cleared Next.js cache (.next folder)');
} else {
  console.log('No cache found to clear.');
}
