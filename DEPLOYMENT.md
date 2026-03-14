# 🚀 Request Buddy - Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project created
- SendGrid account with verified sender email

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Install functions dependencies
cd functions
npm install
cd ..
```

---

## 🔥 Firebase Setup

### 1. Login to Firebase
```bash
firebase login
```

### 2. Initialize Project (if not already done)
```bash
firebase init
```

Select:
- Firestore
- Functions
- Hosting

### 3. Configure Firebase
Update `firebase.json` and `.firebaserc` with your project details.

---

## 📧 Email Configuration (SendGrid)

### Current Setup
- **Method:** Firebase Cloud Functions + SendGrid
- **API Key:** Hardcoded in `functions/index.js` (temporary)
- **Sender:** `cse.nawaz.2003@gmail.com`

### Requirements
1. **Firebase Blaze Plan** (pay-as-you-go) - Required for Cloud Functions
2. **SendGrid Account** with verified sender email
3. **Valid API Key** in `functions/index.js`

### Verify SendGrid Setup
1. Go to: https://app.sendgrid.com
2. Settings → Sender Authentication
3. Verify `cse.nawaz.2003@gmail.com` is verified
4. Check API key is active

---

## 🚀 Deployment Steps

### 1. Build Application
```bash
npm run build
```

### 2. Deploy Cloud Functions
```bash
firebase deploy --only functions
```

Expected output:
```
✔  functions[sendWorkspaceInvitation]: Successful create operation.
✔  Deploy complete!
```

### 3. Deploy Hosting (Optional)
```bash
firebase deploy --only hosting
```

### 4. Deploy Everything
```bash
firebase deploy
```

---

## 🧪 Testing

### Test Locally
```bash
# Start development server
npm run dev

# In another terminal, test functions locally
firebase emulators:start
```

### Test Email Sending
1. Login to Request Buddy
2. Go to any workspace
3. Click "Invite Member"
4. Enter email and role
5. Click "Send Invitation"
6. Check email inbox (and spam folder)

### Check Function Logs
```bash
firebase functions:log
```

---

## ⚠️ Important Notes

### Firebase Spark Plan (Free)
- ❌ Cannot deploy Cloud Functions
- ❌ Email invitations won't send
- ✅ All other features work

### Firebase Blaze Plan (Required for Email)
- ✅ Can deploy Cloud Functions
- ✅ Email invitations work
- 💰 Pay-as-you-go (first 2M invocations free)

### Cost Estimate
- **Cloud Functions:** $0/month (within free tier)
- **SendGrid:** $0/month (100 emails/day free)
- **Total:** $0-5/month for typical usage

---

## 🔐 Security (Production)

### Move API Key to Secret Manager

After deploying, secure the SendGrid API key:

```bash
# Set secret
firebase functions:secrets:set SENDGRID_API_KEY
# Paste your API key when prompted
```

Update `functions/index.js`:
```javascript
const { defineSecret } = require("firebase-functions/params");
const sendgridApiKey = defineSecret("SENDGRID_API_KEY");

exports.sendWorkspaceInvitation = onCall(
  { secrets: [sendgridApiKey] },
  async (request) => {
    sgMail.setApiKey(sendgridApiKey.value());
    // ... rest of code
  }
);
```

Redeploy:
```bash
firebase deploy --only functions
```

---

## 🐛 Troubleshooting

### "Billing account not configured"
→ Upgrade to Firebase Blaze plan

### "SendGrid API key invalid"
→ Check API key in SendGrid dashboard, regenerate if needed

### "Sender email not verified"
→ Verify sender email in SendGrid settings

### Email not received
→ Check spam folder, SendGrid Activity Feed, function logs

### Deployment fails
→ Check Firebase CLI is logged in: `firebase login`
→ Verify project is selected: `firebase use --add`

---

## 📞 Support

- **Firebase Console:** https://console.firebase.google.com
- **SendGrid Dashboard:** https://app.sendgrid.com
- **Firebase Docs:** https://firebase.google.com/docs
- **SendGrid Docs:** https://docs.sendgrid.com
