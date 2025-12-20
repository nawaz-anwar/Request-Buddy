const { spawn } = require('child_process');
const { createServer } = require('http');
const path = require('path');

// Check if React dev server is running
function checkReactServer() {
  return new Promise((resolve) => {
    const req = createServer().listen(0, () => {
      const port = req.address().port;
      req.close();
      
      const testReq = createServer().listen(3000, () => {
        testReq.close();
        resolve(false); // Port 3000 is available, React not running
      }).on('error', () => {
        resolve(true); // Port 3000 is busy, React likely running
      });
    });
  });
}

async function startDev() {
  console.log('🚀 Starting Request Buddy in development mode...\n');
  
  const isReactRunning = await checkReactServer();
  
  if (!isReactRunning) {
    console.log('📦 Starting React development server...');
    const reactProcess = spawn('npm', ['start'], {
      stdio: 'inherit',
      shell: true,
      cwd: process.cwd()
    });
    
    // Wait a bit for React to start
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    console.log('✅ React development server already running');
  }
  
  console.log('⚡ Starting Electron...');
  const electronProcess = spawn('npm', ['run', 'electron-dev'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd(),
    env: { ...process.env, ELECTRON_IS_DEV: 'true' }
  });
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    electronProcess.kill();
    process.exit(0);
  });
}

startDev().catch(console.error);