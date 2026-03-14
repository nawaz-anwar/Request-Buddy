# Quick Reference Guide

**Last Updated**: March 12, 2026

---

## 🚀 Quick Start

```bash
# Start development server
npm run dev

# Open browser
http://localhost:5173/
```

---

## 🧪 Quick Tests

### Test Cookie System
```javascript
// In browser console
testCookieSystem()
```

### Test Draft Save
1. Open any request
2. Edit URL
3. Check for orange "Unsaved" indicator
4. Click Save
5. Check for green checkmark

---

## 🍪 Cookie System

### View Cookies
```javascript
const cookieStore = window.useCookieStore.getState()
console.log(cookieStore.cookieJar)
```

### Get Cookies for URL
```javascript
cookieStore.getCookiesForUrl('https://api.example.com/users')
```

### Add Cookie
```javascript
cookieStore.setCookie({
  name: 'session_id',
  value: 'abc123',
  domain: 'api.example.com',
  path: '/',
  httpOnly: true,
  secure: true
})
```

### Delete Cookie
```javascript
cookieStore.deleteCookie('api.example.com', 'session_id', '/')
```

### Clear All Cookies
```javascript
cookieStore.clearAllCookies()
```

---

## 💾 Draft Save Workflow

### How It Works
- Edit freely → No Firebase writes
- Click Save → Single Firebase write
- Clear indicators for unsaved/saved states

### Keyboard Shortcuts
- `Cmd/Ctrl + S` - Save request
- `Cmd/Ctrl + Enter` - Send request

---

## 📁 Key Files

### Cookie System
- `src/stores/cookieStore.js` - Store
- `src/utils/cookieUtils.js` - Utilities
- `src/components/request/CookiesTab.jsx` - UI
- `src/utils/requestRunner.js` - Integration

### Draft Save
- `src/stores/requestStore.js` - Store
- `src/components/request/RequestEditor.jsx` - UI

### Documentation
- `CURRENT_STATUS.md` - Complete status
- `COOKIE_SYSTEM.md` - Cookie docs
- `DRAFT_SAVE_WORKFLOW.md` - Draft save docs
- `CONTEXT_TRANSFER_COMPLETE.md` - Summary

---

## 🐛 Troubleshooting

### Cookies Not Working
1. Check console for "🍪" logs
2. Verify URL is valid
3. Check Cookies tab
4. Run `testCookieSystem()`

### Save Not Working
1. Check for unsaved indicator
2. Verify Firebase connection
3. Check browser console
4. Check Network tab

### General Issues
1. Refresh page
2. Clear browser cache
3. Check console for errors
4. Verify dependencies installed

---

## 📊 Status

- ✅ Draft Save Workflow - Working
- ✅ Cookie System - Working
- ✅ Profile Settings - Working
- 🔄 Monorepo - Optional (not active)

---

## 🎯 Next Steps

### Continue Current Structure
- Keep building features
- Deploy as-is
- No setup needed

### Activate Monorepo
- Read `NEXT_STEPS.md`
- Install dependencies
- Configure backend
- Update stores
- Test endpoints

---

## 💡 Tips

- Use Cookies tab to manage cookies manually
- Watch for unsaved indicator before closing tabs
- Check console for cookie logs (🍪)
- Use keyboard shortcuts for faster workflow
- Run tests to verify functionality

---

## 📞 Help

1. Check `CURRENT_STATUS.md`
2. Check specific documentation files
3. Run test suites
4. Check browser console
5. Verify environment setup

---

**Everything is working! Happy coding! 🚀**

