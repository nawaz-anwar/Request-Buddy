/**
 * Workspace Invitation Email Template
 * 
 * Generates a professional HTML email for workspace invitations
 */

export function generateWorkspaceInviteTemplate({ 
  workspaceName, 
  inviterEmail, 
  role, 
  inviteLink 
}) {
  const roleColors = {
    admin: '#ef4444',
    editor: '#3b82f6',
    viewer: '#6b7280'
  }

  const roleColor = roleColors[role.toLowerCase()] || '#6b7280'

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workspace Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f3f4f6;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); border-radius: 8px 8px 0 0;">
              <div style="display: inline-block; background-color: #ffffff; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px;">
                <span style="font-size: 32px;">⚡</span>
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                You've been invited to collaborate
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 24px; color: #374151; font-size: 16px; line-height: 1.5;">
                <strong>${inviterEmail}</strong> has invited you to join the workspace:
              </p>

              <!-- Workspace Card -->
              <div style="background-color: #f9fafb; border: 2px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h2 style="margin: 0 0 12px; color: #111827; font-size: 20px; font-weight: 600;">
                  ${workspaceName}
                </h2>
                <div style="display: inline-block; background-color: ${roleColor}; color: #ffffff; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: uppercase;">
                  ${role}
                </div>
              </div>

              <p style="margin: 0 0 32px; color: #6b7280; font-size: 14px; line-height: 1.5;">
                As a <strong>${role}</strong>, you'll be able to collaborate on API requests, collections, and environments within this workspace.
              </p>

              <!-- CTA Button -->
              <table role="presentation" style="width: 100%;">
                <tr>
                  <td align="center">
                    <a href="${inviteLink}" style="display: inline-block; background-color: #3b82f6; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                      Accept Invitation
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                Or copy and paste this link into your browser:<br>
                <a href="${inviteLink}" style="color: #3b82f6; text-decoration: none; word-break: break-all;">
                  ${inviteLink}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f9fafb; border-radius: 0 0 8px 8px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px; text-align: center;">
                <strong>Request Buddy</strong> - API Development Tool
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                This invitation was sent to you by ${inviterEmail}
              </p>
            </td>
          </tr>

        </table>

        <!-- Footer Note -->
        <p style="margin: 24px 0 0; color: #9ca3af; font-size: 12px; text-align: center;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()
}

/**
 * Generate plain text version of the invitation email
 */
export function generateWorkspaceInviteText({ 
  workspaceName, 
  inviterEmail, 
  role, 
  inviteLink 
}) {
  return `
You've been invited to collaborate

${inviterEmail} has invited you to join the workspace: ${workspaceName}

Role: ${role}

As a ${role}, you'll be able to collaborate on API requests, collections, and environments within this workspace.

Accept this invitation by clicking the link below:
${inviteLink}

---
Request Buddy - API Development Tool
This invitation was sent to you by ${inviterEmail}

If you didn't expect this invitation, you can safely ignore this email.
  `.trim()
}
