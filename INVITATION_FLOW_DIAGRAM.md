# Invitation System Flow Diagram

## Login Flow with Smart Popup

```
┌─────────────────────────────────────────────────────────────┐
│                      USER LOGS IN                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Subscribe to Pending Invitations                     │
│         (where email == user.email && status == pending)     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Check localStorage                              │
│         requestBuddy_seenInvitations                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
                ┌───────────┴───────────┐
                │                       │
         ┌──────▼──────┐         ┌─────▼──────┐
         │  Has NEW    │         │  All       │
         │  Invitations│         │  Invitations│
         │  ?          │         │  Seen?     │
         └──────┬──────┘         └─────┬──────┘
                │ YES                  │ NO
                ↓                      ↓
    ┌───────────────────┐    ┌────────────────┐
    │  SHOW POPUP       │    │  NO POPUP      │
    │  Automatically    │    │                │
    └───────┬───────────┘    └────────────────┘
            │
            ↓
    ┌───────────────────┐
    │  Mark as Seen     │
    │  in localStorage  │
    └───────────────────┘
```

## Invitation Modal Actions

```
┌─────────────────────────────────────────────────────────────┐
│              WORKSPACE INVITATIONS MODAL                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│         Fetch Inviter Profiles (Batch)                       │
│         firebaseUserService.getUserProfiles()                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Display Each Invitation                         │
│  ┌────────────────────────────────────────────────────┐     │
│  │  Workspace Name                                     │     │
│  │  Invited by: [Name/Email]  ← FEATURE 4            │     │
│  │  Role: [Admin/Editor/Viewer]                       │     │
│  │  Date: [Created Date]                              │     │
│  │                                                     │     │
│  │  [Expired Badge] ← FEATURE 5 (if expired)         │     │
│  │  [Expiration Message] ← FEATURE 5                 │     │
│  │                                                     │     │
│  │  Actions:                                          │     │
│  │  [🗑️ Delete] ← FEATURE 3 (always available)       │     │
│  │  [Decline] [Accept] ← FEATURE 5 (disabled if exp) │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## Invitation States

```
┌──────────────────────────────────────────────────────────────┐
│                    INVITATION STATES                          │
└──────────────────────────────────────────────────────────────┘

┌─────────────┐
│  PENDING    │  ← User can Accept/Decline/Delete
└──────┬──────┘
       │
       ├─────► [Accept] ──► ACCEPTED ──► User added to workspace
       │
       ├─────► [Decline] ──► DECLINED ──► Invitation hidden
       │
       └─────► [Delete] ──► DELETED ──► Invitation removed
                                          ↑ FEATURE 3

┌─────────────┐
│  EXPIRED    │  ← User can only Delete
└──────┬──────┘    Accept button disabled ← FEATURE 5
       │
       └─────► [Delete] ──► DELETED ──► Invitation removed
```

## localStorage Structure

```
┌──────────────────────────────────────────────────────────────┐
│                    localStorage                               │
└──────────────────────────────────────────────────────────────┘

Key: "requestBuddy_seenInvitations"

Value:
{
  "invite_abc123": true,  ← Seen on 2026-03-15
  "invite_def456": true,  ← Seen on 2026-03-14
  "invite_ghi789": true   ← Seen on 2026-03-13
}

Purpose:
- Track which invitations user has seen
- Prevent repeated popup for same invitations
- Survives logout/login cycles
- FEATURE 1 & 2
```

## Popup Decision Tree

```
                    ┌─────────────────┐
                    │  User Logs In   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Get Pending     │
                    │ Invitations     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Any Invitations?│
                    └────────┬────────┘
                             │
                    ┌────────┴────────┐
                    │                 │
              ┌─────▼─────┐     ┌────▼────┐
              │    YES    │     │   NO    │
              └─────┬─────┘     └────┬────┘
                    │                │
        ┌───────────▼───────────┐    │
        │ Check localStorage    │    │
        │ seenInvitations       │    │
        └───────────┬───────────┘    │
                    │                │
        ┌───────────▼───────────┐    │
        │ Any NEW invitations?  │    │
        │ (not in localStorage) │    │
        └───────────┬───────────┘    │
                    │                │
            ┌───────┴───────┐        │
            │               │        │
      ┌─────▼─────┐   ┌────▼────┐   │
      │    YES    │   │   NO    │   │
      └─────┬─────┘   └────┬────┘   │
            │              │        │
    ┌───────▼───────┐      │        │
    │  SHOW POPUP   │      │        │
    │  ✅           │      │        │
    └───────┬───────┘      │        │
            │              │        │
    ┌───────▼───────┐      │        │
    │ Mark as Seen  │      │        │
    └───────────────┘      │        │
                           │        │
                    ┌──────▼────────▼────┐
                    │   NO POPUP          │
                    │   ❌                │
                    └─────────────────────┘
```

## Feature Integration

```
┌──────────────────────────────────────────────────────────────┐
│                  ALL 6 FEATURES WORKING                       │
└──────────────────────────────────────────────────────────────┘

FEATURE 1: Show Popup Only for NEW Invitations
           ↓
           localStorage tracking
           ↓
FEATURE 2: No Popup for Already Seen
           ↓
           Check before showing
           ↓
FEATURE 3: Delete Invitation Button
           ↓
           Trash icon on each card
           ↓
FEATURE 4: Fix "Invited by Unknown"
           ↓
           Fetch inviter profiles
           ↓
FEATURE 5: Handle Expired Invitations
           ↓
           Visual indicators + disabled Accept
           ↓
FEATURE 6: No Backend Changes
           ↓
           Frontend only modifications
           ↓
           ✅ COMPLETE
```
