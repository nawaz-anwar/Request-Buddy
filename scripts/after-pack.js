#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

exports.default = async function(context) {
  // Only run on macOS
  if (context.electronPlatformName !== 'darwin') {
    return;
  }

  const appPath = context.appOutDir + '/' + context.packager.appInfo.productFilename + '.app';
  
  console.log('🔐 Post-pack: Starting macOS app signing...');
  console.log(`📱 App path: ${appPath}`);

  try {
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
    execSync(`codesign --deep --force --verify --verbose --sign - "${appPath}"`, { stdio: 'inherit' });
    console.log('✅ Ad-hoc signing completed');

    // Step 3: Verify signing
    console.log('🔍 Verifying code signature...');
    execSync(`codesign --verify --deep --strict "${appPath}"`, { stdio: 'inherit' });
    console.log('✅ Code signature verification passed');

    console.log('🎉 Post-pack signing completed successfully!');

  } catch (error) {
    console.error('❌ Post-pack signing failed:', error.message);
    throw error;
  }
};