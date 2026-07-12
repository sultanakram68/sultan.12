const { execSync } = require('child_process');
const fs = require('fs');

try {
  const output = execSync('git log -p -n 3 app/pos/page.tsx', { encoding: 'utf8' });
  fs.writeFileSync('git-history.txt', output);
  console.log('Success');
} catch (error) {
  fs.writeFileSync('git-history.txt', error.toString() + '\n' + error.stdout + '\n' + error.stderr);
  console.log('Error', error);
}
