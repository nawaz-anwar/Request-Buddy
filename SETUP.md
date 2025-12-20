# Request Buddy - Complete Setup Guide

## Quick Start

1. **Install Dependencies**
   \`\`\`bash
   npm install
   \`\`\`

2. **Configure Firebase** (See FIREBASE_SETUP.md for detailed instructions)
   - Create Firebase project
   - Enable Authentication (Email/Password + Google)
   - Create Firestore database
   - Update \`src/services/firebase.js\` with your config

3. **Start Development**
   \`\`\`bash
   npm run dev
   \`\`\`

## Detailed Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Firebase account

### 1. Project Setup
\`\`\`bash
# Clone the repository
git clone <your-repo-url>
cd request-buddy

# Install all dependencies
npm install
\`\`\`

### 2. Firebase Configuration
Follow the detailed guide in \`FIREBASE_SETUP.md\` to:
- Create Firebase project
- Configure authentication
- Set up Firestore
- Update configuration

### 3. Development Commands

\`\`\`bash
# Start both React and Electron in development mode
npm run dev

# Or start them separately:
npm start          # React development server
npm run electron-dev  # Electron in development mode
\`\`\`

### 4. Building for Production

\`\`\`bash
# Build React app
npm run build

# Create Electron distributables
npm run dist

# Create distributables for specific platforms
npm run dist -- --mac     # macOS .dmg
npm run dist -- --win     # Windows .exe
npm run dist -- --linux   # Linux AppImage
\`\`\`

## Project Features

### ✅ Implemented Features
- User authentication (Email/Password + Google)
- Collections and request organization
- HTTP request builder (GET, POST, PUT, PATCH, DELETE)
- Headers, parameters, body, and auth configuration
- Response viewer with formatting
- Request history
- Tabbed interface
- Dark/Light theme
- Real-time Firebase sync
- Cross-platform desktop app

### 🚧 Future Enhancements
- Environment variables
- Request scripting
- Team collaboration features
- Export/Import collections
- GraphQL support
- Request examples and documentation

## Architecture

\`\`\`
Frontend (React)
├── Authentication (Firebase Auth)
├── State Management (React Context)
├── UI Components (TailwindCSS)
└── HTTP Client (Axios)

Backend (Firebase)
├── Authentication
├── Firestore Database
└── Real-time Sync

Desktop (Electron)
├── Main Process
├── Renderer Process
└── IPC Communication
\`\`\`

## File Structure Overview

\`\`\`
request-buddy/
├── electron/           # Electron main process
├── src/
│   ├── components/     # React UI components
│   ├── contexts/       # State management
│   ├── pages/          # Main application pages
│   ├── services/       # External service integrations
│   └── utils/          # Utility functions
├── public/             # Static assets
├── scripts/            # Build and development scripts
└── docs/               # Documentation
\`\`\`

## Troubleshooting

### Common Issues

1. **Electron won't start**
   - Ensure React dev server is running first
   - Check if port 3000 is available

2. **Firebase authentication errors**
   - Verify Firebase configuration in \`src/services/firebase.js\`
   - Check if authentication providers are enabled

3. **Build errors**
   - Clear node_modules and reinstall: \`rm -rf node_modules && npm install\`
   - Check Node.js version compatibility

### Development Tips

- Use \`npm run dev\` for the best development experience
- Check browser console for React errors
- Check Electron console for main process errors
- Firebase console for backend issues

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

- Check existing issues in the repository
- Create new issues for bugs or feature requests
- Refer to documentation files for detailed guides