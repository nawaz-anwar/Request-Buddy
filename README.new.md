# Request Buddy Monorepo

> A modern, Postman-like API development and testing desktop application built with React, Electron, NestJS, and Firebase.

**Version**: 2.0.0 (Monorepo Architecture)  
**Platform**: macOS (Intel & Apple Silicon), Windows, Linux  
**Tech Stack**: React 18, Electron 27, NestJS 10, Firebase Admin SDK, Zustand, TailwindCSS

---

## 🏗️ Architecture Overview

This is a monorepo containing multiple interconnected applications and packages:

```
request-buddy-monorepo/
├── apps/
│   ├── web/              # React Vite frontend
│   └── desktop/          # Electron desktop wrapper
├── backend/
│   └── api/              # NestJS API gateway
├── packages/
│   └── shared/           # Shared types and utilities
└── package.json          # Root workspace configuration
```

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Desktop App                     │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Frontend (apps/web)                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌───────────┐  │  │
│  │  │   React UI   │  │  Zustand     │  │  Axios    │  │  │
│  │  │  Components  │◄─┤   Stores     │◄─┤  Client   │  │  │
│  │  └──────────────┘  └──────────────┘  └─────┬─────┘  │  │
│  │                                              │        │  │
│  │  ┌──────────────────┐                       │        │  │
│  │  │  Firebase Auth   │                       │        │  │
│  │  │  (Frontend Only) │                       │        │  │
│  │  └──────────────────┘                       │        │  │
│  └──────────────────────────────────────────────┼────────┘  │
└─────────────────────────────────────────────────┼───────────┘
                                                  │
                                                  │ HTTP + JWT
                                                  │
                                                  ▼
                                    ┌──────────────────────┐
                                    │   NestJS API Gateway │
                                    │   (backend/api)      │
                                    │                      │
                                    │  ┌────────────────┐  │
                                    │  │  Auth Guard    │  │
                                    │  │  (Verify JWT)  │  │
                                    │  └────────┬───────┘  │
                                    │           │          │
                                    │  ┌────────▼───────┐  │
                                    │  │ Firebase Admin │  │
                                    │  │      SDK       │  │
                                    │  └────────┬───────┘  │
                                    └───────────┼──────────┘
                                                │
                                                ▼
                                    ┌──────────────────────┐
                                    │  Firebase Firestore  │
                                    │     (Database)       │
                                    └──────────────────────┘
```

---

## 📋 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Firebase project with Firestore enabled
- Firebase service account key (for backend)

### Installation

```bash
# Install all dependencies (root + all workspaces)
npm install
```

### Development

```bash
# Start all services (API + Web)
npm run dev

# Or start individually:
npm run dev:api      # NestJS backend on :3000
npm run dev:web      # React frontend on :5173
npm run dev:desktop  # Electron app
```

### Build

```bash
# Build all workspaces
npm run build

# Or build individually:
npm run build:web
npm run build:api
npm run build:desktop
```

### Release Desktop App

```bash
npm run release
```

---

## 📦 Workspaces

### apps/web

React Vite frontend application.

**Tech Stack**: React 18, Vite, TailwindCSS, Zustand, Axios

**Key Features**:
- API request builder and tester
- Collections and folders organization
- Environment variable management
- Real-time collaboration
- Postman import/export

**Development**:
```bash
cd apps/web
npm run dev
```

**See**: [apps/web/README.md](apps/web/README.md)

---

### apps/desktop

Electron desktop wrapper for the web application.

**Tech Stack**: Electron 27, Node.js

**Features**:
- Cross-platform desktop app (macOS, Windows, Linux)
- Native HTTP request execution
- AI assistant integration (Gemini)
- System menu integration

**Development**:
```bash
cd apps/desktop
npm run electron:dev
```

**Build**:
```bash
cd apps/desktop
npm run build
```

---

### backend/api

NestJS API gateway that sits between frontend and Firebase.

**Tech Stack**: NestJS 10, Firebase Admin SDK, TypeScript

**Features**:
- RESTful API endpoints
- JWT token verification
- Firebase Firestore integration
- CORS enabled
- Modular architecture

**Development**:
```bash
cd backend/api
npm run start:dev
```

**See**: [backend/api/README.md](backend/api/README.md)

---

### packages/shared

Shared TypeScript types and utilities.

**Contents**:
- Type definitions for all entities
- Shared constants
- Utility functions

**Usage**:
```typescript
import { Workspace, Collection } from '@request-buddy/shared';
```

---

## 🔧 Configuration

### Backend Configuration

1. **Get Firebase Service Account Key**:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save as `backend/api/serviceAccountKey.json`

2. **Create `.env` file**:
   ```bash
   cd backend/api
   cp .env.example .env
   ```

3. **Edit `.env`**:
   ```env
   PORT=3000
   NODE_ENV=development
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   FIREBASE_PROJECT_ID=teamapi-96507
   ```

### Frontend Configuration

1. **Create `.env` file**:
   ```bash
   cd apps/web
   cp .env.example .env
   ```

2. **Edit `.env`**:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

---

## 🚀 Features

### Core Features

- ✅ **API Testing**: Send HTTP requests (GET, POST, PUT, PATCH, DELETE, etc.)
- ✅ **Collections**: Organize requests into collections and folders
- ✅ **Collaboration**: Multi-user workspaces with role-based access control
- ✅ **Environment Variables**: Manage variables across different environments
- ✅ **Import/Export**: Full Postman Collection v2.1 compatibility
- ✅ **Real-time Sync**: Changes sync across all team members instantly
- ✅ **Request History**: Track all API requests
- ✅ **Authentication**: Email/Password and Google OAuth
- ✅ **Desktop App**: Native desktop application for macOS, Windows, Linux

### New in v2.0 (Monorepo)

- ✅ **API Gateway**: NestJS backend for better security and scalability
- ✅ **Monorepo Structure**: Clean separation of concerns
- ✅ **Shared Types**: Type safety across frontend and backend
- ✅ **Better Security**: Firebase Admin SDK with elevated privileges
- ✅ **Scalable Architecture**: Backend can be deployed independently

---

## 📚 Documentation

- [Monorepo Migration Guide](MONOREPO_MIGRATION_GUIDE.md) - Complete migration documentation
- [Backend API Documentation](backend/api/README.md) - NestJS API reference
- [Architecture Documentation](ARCHITECTURE.md) - System architecture details
- [Deployment Guide](DEPLOYMENT.md) - Production deployment instructions
- [Features Documentation](FEATURES.md) - Feature specifications

---

## 🔐 Security

### Authentication Flow

1. User signs in via Firebase Auth (frontend)
2. Frontend receives Firebase ID token
3. Frontend sends token in `Authorization: Bearer <token>` header
4. Backend verifies token using Firebase Admin SDK
5. Backend processes request with verified user identity

### Security Best Practices

- ✅ All API routes protected with AuthGuard
- ✅ Firebase ID tokens verified on every request
- ✅ CORS configured for specific origins
- ✅ Service account key not committed to git
- ✅ Environment variables for sensitive data
- ✅ Firestore security rules enforced

---

## 🧪 Testing

### Manual Testing

```bash
# Start all services
npm run dev

# Test authentication
# 1. Go to http://localhost:5173
# 2. Sign up with email/password
# 3. Create a workspace
# 4. Create a collection
# 5. Create a request
# 6. Send the request
```

### API Testing

```bash
# Test API endpoints directly
curl -X GET http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer <firebase-token>"
```

---

## 📦 Building & Deployment

### Build All

```bash
npm run build
```

### Deploy Backend

```bash
cd backend/api
npm run build
npm run start:prod
```

### Deploy Frontend

```bash
cd apps/web
npm run build
# Deploy dist/ to your hosting provider
```

### Build Desktop App

```bash
npm run release
```

Output: `release/` directory

---

## 🐛 Troubleshooting

### Backend won't start

- Check Firebase service account key path
- Verify `GOOGLE_APPLICATION_CREDENTIALS` environment variable
- Ensure Firebase project ID is correct

### Frontend can't connect to backend

- Verify backend is running on port 3000
- Check `VITE_API_BASE_URL` in frontend `.env`
- Check CORS configuration in backend

### Authentication errors

- Ensure user is logged in via Firebase Auth
- Check token is being sent in Authorization header
- Verify Firebase Admin SDK can verify tokens

### Electron app won't load

- Check paths in `apps/desktop/electron/main.js`
- Ensure web app is built before running Electron
- Verify `dist` directory exists in `apps/web/`

---

## 📝 Scripts Reference

### Root Scripts

```bash
npm run dev              # Start API + Web
npm run dev:web          # Start web only
npm run dev:api          # Start API only
npm run dev:desktop      # Start desktop app
npm run build            # Build all workspaces
npm run build:web        # Build web only
npm run build:api        # Build API only
npm run build:desktop    # Build desktop only
npm run release          # Build and package desktop app
```

### Workspace Scripts

```bash
# Web (apps/web)
npm run dev --workspace=apps/web
npm run build --workspace=apps/web

# API (backend/api)
npm run start:dev --workspace=backend/api
npm run build --workspace=backend/api

# Desktop (apps/desktop)
npm run electron:dev --workspace=apps/desktop
npm run build --workspace=apps/desktop
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

- React Team for React 18
- NestJS Team for the amazing framework
- Firebase Team for the backend infrastructure
- Electron Team for cross-platform desktop support

---

**Built with ❤️ using React, Electron, NestJS, and Firebase**

**Version**: 2.0.0 (Monorepo)  
**Last Updated**: March 12, 2026
