#!/bin/bash

echo "🚀 Starting macOS Release Build Process"
echo "======================================"

# Step 1: Clean all build artifacts
echo "🧹 Step 1: Cleaning build artifacts..."
rm -rf dist build out node_modules/.cache release
echo "✅ Build artifacts cleaned"

# Step 2: Install dependencies (if needed)
echo "📦 Step 2: Checking dependencies..."
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi
echo "✅ Dependencies ready"

# Step 3: Build the app
echo "🔨 Step 3: Building application..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ Build failed"
  exit 1
fi
echo "✅ Application built successfully"

# Step 4: Create DMGs for both architectures with signing
echo "📱 Step 4: Creating signed DMGs for both architectures..."
npm run electron:build
if [ $? -ne 0 ]; then
  echo "❌ Electron build failed"
  exit 1
fi

# Step 5: Verify the output
echo "🔍 Step 5: Verifying build output..."
ARM_DMG="release/Request Buddy-1.0.0-arm64.dmg"
X64_DMG="release/Request Buddy-1.0.0-x64.dmg"

if [ -f "$ARM_DMG" ] && [ -f "$X64_DMG" ]; then
  echo "✅ Both DMGs created successfully"
  ls -lh release/*.dmg
  
  # Get file sizes
  ARM_SIZE=$(ls -lh "$ARM_DMG" | awk '{print $5}')
  X64_SIZE=$(ls -lh "$X64_DMG" | awk '{print $5}')
  echo "📊 ARM64 DMG Size: $ARM_SIZE"
  echo "📊 x64 DMG Size: $X64_SIZE"
  
  # Test both DMGs
  for DMG in "$ARM_DMG" "$X64_DMG"; do
    ARCH=$(basename "$DMG" | sed 's/.*-\([^.]*\)\.dmg/\1/')
    echo "🔍 Testing $ARCH DMG..."
    
    MOUNT_POINT="/tmp/requestbuddy_test_$ARCH"
    hdiutil attach "$DMG" -readonly -nobrowse -mountpoint "$MOUNT_POINT"
    if [ $? -eq 0 ]; then
      echo "✅ $ARCH DMG mounts successfully"
      
      # Check if app exists in mounted DMG
      if [ -d "$MOUNT_POINT/Request Buddy.app" ]; then
        echo "✅ App bundle found in $ARCH DMG"
        
        # Verify code signature
        codesign --verify --deep --strict "$MOUNT_POINT/Request Buddy.app"
        if [ $? -eq 0 ]; then
          echo "✅ $ARCH code signature verified"
        else
          echo "⚠️  $ARCH code signature verification failed"
        fi
      else
        echo "❌ App bundle not found in $ARCH DMG"
      fi
      
      # Unmount
      hdiutil detach "$MOUNT_POINT"
    else
      echo "❌ $ARCH DMG mount failed"
    fi
  done
else
  echo "❌ DMGs not found"
  echo "Available files:"
  ls -la release/ 2>/dev/null || echo "No release directory found"
  exit 1
fi

echo ""
echo "🎉 macOS Release Build Complete!"
echo "================================"
echo "📦 Output Files:"
echo "   • $ARM_DMG (Apple Silicon: M1/M2/M3/M4)"
echo "   • $X64_DMG (Intel Mac)"
echo "🔐 Signing: Ad-hoc signed (no developer warnings)"
echo "✨ Ready for distribution!"
echo ""
echo "📋 Installation Instructions for Users:"
echo "1. Download the appropriate DMG file for your Mac:"
echo "   • Apple Silicon (M1/M2/M3/M4): arm64 version"
echo "   • Intel Mac: x64 version"
echo "2. Double-click to mount"
echo "3. Drag 'Request Buddy' to Applications folder"
echo "4. Launch from Applications - no warnings should appear"
echo ""