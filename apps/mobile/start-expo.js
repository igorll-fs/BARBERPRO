// Auto-start Expo and bypass login prompt
const { spawn } = require('child_process');

const env = {
  ...process.env,
  REACT_NATIVE_PACKAGER_HOSTNAME: '192.168.2.104',
};

const child = spawn('npx', ['expo', 'start', '--clear'], {
  cwd: __dirname,
  env,
  stdio: ['pipe', 'pipe', 'pipe'],
  shell: true,
});

let answered = false;

child.stdout.on('data', (data) => {
  const text = data.toString();
  process.stdout.write(text);
  
  // Auto-select "Proceed anonymously" when login prompt appears
  if (!answered && text.includes('Proceed anonymously')) {
    answered = true;
    // Send Down arrow key + Enter to select "Proceed anonymously"
    setTimeout(() => {
      child.stdin.write('\x1B[B'); // Down arrow
      setTimeout(() => {
        child.stdin.write('\r');    // Enter
        console.log('\n>> Auto-selected: Proceed anonymously\n');
      }, 500);
    }, 500);
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data.toString());
});

child.on('close', (code) => {
  process.exit(code);
});

process.on('SIGINT', () => {
  child.kill();
  process.exit();
});
