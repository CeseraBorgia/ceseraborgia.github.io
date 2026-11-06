import { spawn } from 'child_process';

console.log('🚀 Starting TikTok LIVE Interactive Lunar Rave...\n');

// 1. Start WebSocket Bridge Server
const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true
});

// 2. Start Vite Dev Server
const viteProcess = spawn('npx.cmd', ['vite'], {
  stdio: 'inherit',
  shell: true
});

const cleanup = () => {
  serverProcess.kill();
  viteProcess.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
