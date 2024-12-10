const fs = require('fs');
const readline = require('readline');

// Define the filename and number of lines
const filename = process.argv[2];
const numLines = parseInt(process.argv[3]) || 10;

if (!filename) {
  console.error('Usage: node tail.js <filename> [number of lines]');
  process.exit(1);
}

// Function to read the last N lines
function readLastLines(file, numLines) {
  return new Promise((resolve, reject) => {
    const lines = [];
    const stream = fs.createReadStream(file, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });

    rl.on('line', (line) => {
      lines.push(line);
      if (lines.length > numLines) {
        lines.shift();
      }
    });

    rl.on('close', () => resolve(lines));
    rl.on('error', reject);
  });
}

// Function to follow the file
function followFile(file) {
  let fileSize = fs.statSync(file).size;

  fs.watch(file, (eventType) => {
    if (eventType === 'change') {
      const newFileSize = fs.statSync(file).size;
      if (newFileSize > fileSize) {
        const stream = fs.createReadStream(file, {
          encoding: 'utf8',
          start: fileSize,
        });

        stream.on('data', (chunk) => {
          process.stdout.write(chunk);
        });

        fileSize = newFileSize;
      }
    }
  });
}

// Read the last few lines and start following the file
readLastLines(filename, numLines)
  .then((lines) => {
    console.log(lines.join('\n'));
    console.log('\n--- Start Following File ---');
    followFile(filename);
  })
  .catch((err) => {
    console.error(`Error: ${err.message}`);
  });

