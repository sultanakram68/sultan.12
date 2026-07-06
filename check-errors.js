const { exec } = require('child_process');
const fs = require('fs');

console.log('Running TypeScript check...');
exec('npx tsc --noEmit', (error, stdout, stderr) => {
  const output = `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}\n\nERROR:\n${error}`;
  fs.writeFileSync('ts-errors.txt', output);
  console.log('Done! Errors written to ts-errors.txt');
});
