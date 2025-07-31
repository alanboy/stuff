const fs = require('fs');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
let numLines = 10; // default number of lines
let filePath = null;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '-n' && i + 1 < args.length) {
        numLines = parseInt(args[i + 1]);
        i++; // skip the next argument since we used it
    } else if (!filePath) {
        filePath = args[i];
    }
}

if (!filePath) {
    console.error('Usage: node tail.js <filename> [-n lines]');
    process.exit(1);
}

// Create interface for stdin/stdout
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// ANSI escape codes for red background and reset
const RED_BG = '\x1b[41m';
const RESET = '\x1b[0m';

// Function to read last N lines of a file
function readLastLines(file, n) {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        return lines.slice(-n).join('\n');
    } catch (err) {
        console.error(`Error reading file: ${err.message}`);
        process.exit(1);
    }
}

// Function to follow file changes
function followFile(file) {
    let fileSize = fs.statSync(file).size;

    fs.watch(file, (eventType) => {
        if (eventType === 'change') {
            const newSize = fs.statSync(file).size;
            if (newSize > fileSize) {
                const stream = fs.createReadStream(file, {
                    start: fileSize,
                    encoding: 'utf8'
                });
                stream.on('data', (chunk) => process.stdout.write(chunk));
                fileSize = newSize;
            }
        }
    });
}

// Show initial lines
console.log(`Last ${numLines} lines of ${filePath}:`);
console.log(readLastLines(filePath, numLines));
console.log('\n--- Following file (Press Enter for timestamp, Ctrl+C to exit) ---');

// Start following the file
followFile(filePath);

// Listen for Enter key press
rl.on('line', () => {
    const now = new Date();
    const timestamp = now.toISOString();
    console.log(`${RED_BG}${timestamp}${RESET}`);
});
