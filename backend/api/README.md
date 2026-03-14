# Request Buddy API Gateway

NestJS-based API gateway that sits between the Request Buddy frontend and Firebase Firestore.

## Features

- RESTful API endpoints for all Request Buddy operations
- Firebase Admin SDK integration
- JWT token verification via Firebase Auth
- CORS enabled for frontend access
- TypeScript with strict typing
- Modular architecture with controllers and services

## Tech Stack

- **Framework**: NestJS 10
- **Database**: Firebase Firestore (via Firebase Admin SDK)
- **Authentication**: Firebase Auth token verification
- **Language**: TypeScript
- **HTTP Client**: Axios

## Project Structure

```
backend/api/
├── src/
│   ├── firebase/           # Firebase Admin SDK service & auth guard
│   ├── workspace/          # Workspace module
│   ├── collection/         # Collection module
│   ├── request/            # Request module
│   ├── environment/        # Environment module
│   ├── history/            # History module
│   ├── invitation/         # Invitation module
│   ├── app.module.ts       # Root module
│   └── main.ts             # Application entry point
├── .env.example            # Environment variables template
├── nest-cli.json           # NestJS CLI configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies and scripts
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Firebase Admin SDK

**Option A: Service Account Key (Recommended for Development)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings → Service Accounts
4. Click "Generate New Private Key"
5. Save the JSON file as `serviceAccountKey.json` in this directory

**Option B: Application Default Credentials (ADC)**

```bash
gcloud auth application-default login
```

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=3000
NODE_ENV=development
GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
FIREBASE_PROJECT_ID=teamapi-96507
```

### 4. Start Development Server

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`

## Available Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with hot reload
- `npm run start:debug` - Start server in debug mode
- `npm run build` - Build for production
- `npm run format` - Format code with Prettier

## API Documentation

### Authentication

All endpoints require a Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

The token is verified using Firebase Admin SDK. The decoded user information is available in `req.user`.

### Endpoints

See [MONOREPO_MIGRATION_GUIDE.md](../../MONOREPO_MIGRATION_GUIDE.md) for complete API documentation.

## Development

### Adding a New Module

1. Generate module using NestJS CLI:
```bash
nest generate module feature-name
nest generate controller feature-name
nest generate service feature-name
```

2. Implement service methods using FirebaseService
3. Create controller endpoints
4. Add module to `app.module.ts`

### Example Service Method

```typescript
async getItems(workspaceId: string) {
  const db = this.firebaseService.getFirestore();
  const snapshot = await db.collection('items')
    .where('workspaceId', '==', workspaceId)
    .get();

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
```

### Example Controller Endpoint

```typescript
@Get()
@UseGuards(AuthGuard)
async getItems(@Query('workspaceId') workspaceId: string) {
  return this.itemService.getItems(workspaceId);
}
```

## Security

- All routes protected with `AuthGuard`
- Firebase ID tokens verified on every request
- CORS configured for specific origins
- No sensitive data in responses
- Service account key not committed to git

## Error Handling

The API returns standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error responses include a message:
```json
{
  "statusCode": 404,
  "message": "Workspace not found",
  "error": "Not Found"
}
```

## Deployment

### Prerequisites
- Node.js 18+ runtime
- Firebase project with Firestore enabled
- Service account key or ADC configured

### Build

```bash
npm run build
```

### Start Production Server

```bash
npm run start:prod
```

### Environment Variables for Production

```env
PORT=3000
NODE_ENV=production
GOOGLE_APPLICATION_CREDENTIALS=/path/to/serviceAccountKey.json
FIREBASE_PROJECT_ID=teamapi-96507
CORS_ORIGINS=https://your-frontend-domain.com
```

## Troubleshooting

### "Firebase Admin SDK not initialized"
- Check `GOOGLE_APPLICATION_CREDENTIALS` path
- Verify service account key is valid
- Ensure Firebase project ID is correct

### "Unauthorized" errors
- Verify frontend is sending valid Firebase ID token
- Check token format: `Bearer <token>`
- Ensure user is authenticated in frontend

### CORS errors
- Check `CORS_ORIGINS` in `.env`
- Verify frontend URL matches allowed origins
- Check browser console for specific CORS error

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

Private - Request Buddy Project
