# ⚡ Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development
```bash
npm run dev
```

Open http://localhost:5173

### 3. Login
- Use Email/Password or Google OAuth
- Create your first workspace

### 4. Start Testing APIs
- Create a collection
- Add a request
- Send it!

---

## 📧 Email Invitations Setup

### Current Status
- ✅ Code implemented
- ⚠️ Requires Firebase Blaze plan to deploy

### Deploy Email Function
```bash
# Upgrade to Blaze plan first
firebase deploy --only functions
```

### Test Email
1. Go to workspace
2. Click "Invite Member"
3. Enter email and role
4. Check inbox

---

## 📚 Documentation

- [README.md](README.md) - Complete guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deploy to Firebase
- [ARCHITECTURE.md](ARCHITECTURE.md) - System design
- [FEATURES.md](FEATURES.md) - Feature list

---

## 🛠️ Common Commands

```bash
# Development
npm run dev                 # Start dev server
npm run electron:dev        # Start Electron app

# Build
npm run build              # Build web app
npm run electron:build     # Build desktop app
npm run release            # Create release

# Firebase
firebase deploy            # Deploy everything
firebase deploy --only functions  # Deploy functions only
firebase functions:log     # View logs
```

---

## 🐛 Troubleshooting

### Can't login?
- Check internet connection
- Verify Firebase config in `src/services/firebase.js`

### Email not sending?
- Upgrade to Firebase Blaze plan
- Deploy Cloud Function: `firebase deploy --only functions`
- Check SendGrid API key in `functions/index.js`

### Import not working?
- Select a workspace first
- Check browser console for errors

---

## 📞 Need Help?

Check the full [README.md](README.md) for detailed documentation.
