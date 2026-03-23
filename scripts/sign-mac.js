#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Starting macOS app signing process...');

// Find the .app bundle in release directory
const releaseDir = path.join(__dirname, '..', 'release');
let appPath = null;

try {
  // Look for .app bundle in mac or mac-universal directory
  const macDirs = ['mac', 'mac-universal', 'mac-arm64', 'mac-x64'];
  
  for (const dir of macDirs) {
    const fullDir = path.join(releaseDir, dir);
    if (fs.existsSync(fullDir)) {
      const files = fs.readdirSync(fullDir);
      const appFile = files.find(file => file.endsWith('.app'));
      if (appFile) {
        appPath = path.join(fullDir, appFile);
        break;
      }
    }
  }

  if (!appPath) {
    console.log('⚠️  No .app bundle found, skipping signing');
    process.exit(0);
  }

  console.log(`📱 Found app bundle: ${appPath}`);

  // Step 1: Remove quarantine attributes
  console.log('🧹 Removing quarantine attributes...');
  try {
    execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
    console.log('✅ Quarantine attributes removed');
  } catch (error) {
    console.log('⚠️  No quarantine attributes to remove');
  }

  // Step 2: Ad-hoc code signing
  console.log('✍️  Applying ad-hoc code signing...');
  try {
    execSync(`codesign --deep --force --verify --verbose --sign - "${appPath}"`, { stdio: 'inherit' });
    console.log('✅ Ad-hoc signing completed');
  } catch (error) {
    console.error('❌ Code signing failed:', error.message);
    process.exit(1);
  }

  // Step 3: Verify signing
  console.log('🔍 Verifying code signature...');
  try {
    execSync(`codesign --verify --deep --strict "${appPath}"`, { stdio: 'inherit' });
    console.log('✅ Code signature verification passed');
  } catch (error) {
    console.error('❌ Code signature verification failed:', error.message);
    process.exit(1);
  }

  // Step 4: Display signing info
  console.log('📋 Code signing information:');
  try {
    execSync(`codesign -dv "${appPath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️  Could not display signing info');
  }

  console.log('🎉 macOS app signing completed successfully!');
  console.log('');
  console.log('📦 Your app should now open without "damaged" or "unidentified developer" warnings');
  console.log('');

} catch (error) {
  console.error('❌ Signing process failed:', error.message);
  process.exit(1);
}