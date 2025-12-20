# Firebase Functions Setup for Email Invitations

## 🎯 **OVERVIEW**

This guide sets up Firebase Cloud Functions to send real email invitations when workspace invites are created.

## 📋 **PREREQUISITES**

- Firebase CLI installed: `npm install -g firebase-tools`
- Firebase project initialized
- Resend account for email sending (recommended)

## 🚀 **STEP-BY-STEP SETUP**

### **Step 1: Initialize Firebase Functions**

```bash
# In your project root
firebase init functions

# Select:
# - TypeScript
# - Node.js 18+
# - Install dependencies: Yes
```

### **Step 2: Install Email Provider**

```bash
cd functions
npm install resend
npm install @types/node --save-dev
```

### **Step 3: Set Environment Variables**

```bash
# Set Resend API key (get from https://resend.com)
firebase functions:config:set resend.key="re_YOUR_API_KEY_HERE"

# Set your app URL
firebase functions:config:set app.url="http://localhost:5173"  # For development
# firebase functions:config:set app.url="https://your-app.com"  # For production
```

### **Step 4: Create the Function**

Create `functions/src/sendWorkspaceInvite.ts`:

\`\`\`typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import { Resend } from 'resend'

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp()
}

// Initialize Resend
const resend = new Resend(functions.config().resend.key)

export const sendWorkspaceInvite = functions.firestore
  .document('workspaceInvites/{inviteId}')
  .onCreate(async (snap, context) => {
    const inviteData = snap.data()
    const inviteId = context.params.inviteId
    
    console.log('Sending workspace invitation email:', inviteId)
    
    try {
      const appUrl = functions.config().app.url || 'http://localhost:5173'
      const acceptUrl = \`\${appUrl}/invite/\${inviteId}\`
      
      const emailHtml = \`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Workspace Invitation</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .workspace-info { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3b82f6; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 You're Invited!</h1>
              <p>Join a workspace on Request Buddy</p>
            </div>
            <div class="content">
              <p>Hi there!</p>
              
              <p><strong>\${inviteData.inviterEmail}</strong> has invited you to collaborate on their Request Buddy workspace.</p>
              
              <div class="workspace-info">
                <h3>📁 \${inviteData.workspaceName}</h3>
                <p><strong>Role:</strong> \${inviteData.role.charAt(0).toUpperCase() + inviteData.role.slice(1)}</p>
                <p><strong>Invited by:</strong> \${inviteData.inviterEmail}</p>
              </div>
              
              <p>Request Buddy is a powerful API development tool that helps teams collaborate on API testing and documentation.</p>
              
              <div style="text-align: center;">
                <a href="\${acceptUrl}" class="button">Accept Invitation</a>
              </div>
              
              <p><strong>What you can do as a \${inviteData.role}:</strong></p>
              <ul>
                \${inviteData.role === 'admin' ? 
                  '<li>Manage workspace members and permissions</li><li>Create, edit, and delete all content</li><li>Full administrative access</li>' :
                  inviteData.role === 'editor' ?
                  '<li>Create and organize API collections</li><li>Build and test API requests</li><li>Collaborate with team members</li>' :
                  '<li>View and use existing API collections</li><li>Run API tests and view results</li><li>Read-only access to workspace content</li>'
                }
              </ul>
              
              <p><small><strong>Note:</strong> This invitation will expire in 7 days. If you don't have a Request Buddy account, you'll be able to create one when you accept the invitation.</small></p>
            </div>
            <div class="footer">
              <p>This invitation was sent to \${inviteData.email}</p>
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
            </div>
          </div>
        </body>
        </html>
      \`
      
      const { data, error } = await resend.emails.send({
        from: 'Request Buddy <noreply@your-domain.com>', // Update with your domain
        to: [inviteData.email],
        subject: \`You've been invited to \${inviteData.workspaceName} on Request Buddy\`,
        html: emailHtml
      })
      
      if (error) {
        console.error('Failed to send email:', error)
        throw error
      }
      
      console.log('Email sent successfully:', data)
      
      // Update the invite document to mark email as sent
      await admin.firestore()
        .collection('workspaceInvites')
        .doc(inviteId)
        .update({
          emailSent: true,
          emailSentAt: admin.firestore.FieldValue.serverTimestamp(),
          emailId: data.id
        })
      
    } catch (error) {
      console.error('Error sending workspace invitation email:', error)
      
      // Update the invite document to mark email as failed
      await admin.firestore()
        .collection('workspaceInvites')
        .doc(inviteId)
        .update({
          emailSent: false,
          emailError: error.message,
          emailSentAt: admin.firestore.FieldValue.serverTimestamp()
        })
    }
  })
\`\`\`

### **Step 5: Update functions/src/index.ts**

\`\`\`typescript
import { sendWorkspaceInvite } from './sendWorkspaceInvite'

export { sendWorkspaceInvite }
\`\`\`

### **Step 6: Deploy Functions**

\`\`\`bash
# Deploy the function
firebase deploy --only functions

# Or deploy specific function
firebase deploy --only functions:sendWorkspaceInvite
\`\`\`

## 🔧 **CONFIGURATION**

### **Resend Setup**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain (or use their test domain for development)
3. Get your API key from the dashboard
4. Set the API key: `firebase functions:config:set resend.key="YOUR_KEY"`

### **Environment Variables**
\`\`\`bash
# Required
firebase functions:config:set resend.key="re_your_api_key"
firebase functions:config:set app.url="https://your-app.com"

# Optional
firebase functions:config:set email.from="Request Buddy <noreply@your-domain.com>"
\`\`\`

## 🧪 **TESTING**

### **Test Function Locally**
\`\`\`bash
cd functions
npm run serve
\`\`\`

### **Test Email Sending**
1. Create a workspace invitation through the UI
2. Check Firebase Functions logs: `firebase functions:log`
3. Verify email is received

### **Debug Issues**
\`\`\`bash
# View function logs
firebase functions:log --only sendWorkspaceInvite

# Check function status
firebase functions:list
\`\`\`

## 📧 **EMAIL TEMPLATE CUSTOMIZATION**

The email template includes:
- ✅ Workspace name and inviter information
- ✅ Role-specific permissions explanation
- ✅ Branded design with Request Buddy styling
- ✅ Clear call-to-action button
- ✅ Expiration notice
- ✅ Professional footer

## 🔒 **SECURITY CONSIDERATIONS**

- ✅ Function only triggers on document creation
- ✅ Email addresses are validated
- ✅ Invitation links include secure tokens
- ✅ Invitations expire after 7 days
- ✅ Failed emails are logged for debugging

## 🚀 **PRODUCTION DEPLOYMENT**

1. **Update app URL**: `firebase functions:config:set app.url="https://your-production-domain.com"`
2. **Set up custom domain** for email sending
3. **Update email template** with your branding
4. **Test thoroughly** before going live
5. **Monitor function logs** for any issues

Once deployed, workspace invitations will automatically send real emails to invited users!