# Cookie System Implementation

## Overview

Request Buddy now includes a comprehensive Cookie Jar system similar to Postman's cookie management. Cookies are automatically captured from responses and attached to subsequent requests.

## Features

### ✅ Implemented

1. **Cookie Jar Storage** - Cookies organized by domain with local persistence
2. **Automatic Cookie Capture** - Set-Cookie headers automatically parsed and stored
3. **Automatic Cookie Attachment** - Cookies automatically sent with matching requests
4. **Cookie Tab UI** - Manage cookies in the request editor
5. **Cookie Expiration** - Expired cookies automatically filtered
6. **Multiple Cookie Support** - Multiple cookies sent in single Cookie header
7. **Path Matching** - Cookies only sent to matching paths
8. **Secure Flag Support** - Secure cookies only sent over HTTPS
9. **HttpOnly Flag Support** - HttpOnly cookies properly stored
10. **Local Persistence** - Cookies persist across app restarts

## Architecture

### Cookie Store (`src/stores/cookieStore.js`)

Zustand store with localStorage persistence:

```javascript
{
  cookieJar: {
    "api.example.com": [
      {
        name: "session_id",
        value: "abc123",
        domain: "api.example.com",
        path: "/",
        expires: 1234567890000,
        httpOnly: true,
        secure: false,
        sameSite: "Lax"
      }
    ]
  }
}
```

**Key Methods**:
- `setCookie(cookie)` - Add or update a cookie
- `getCookiesForUrl(url)` - Get cookies matching URL
- `deleteCookie(domain, name, path)` - Remove a cookie
- `clearAllCookies()` - Clear all cookies
- `cleanupExpiredCookies()` - Remove expired cookies

### Cookie Utilities (`src/utils/cookieUtils.js`)

**Parsing**:
- `parseSetCookie(header, domain)` - Parse Set-Cookie header
- `parseSetCookieHeaders(headers, domain)` - Parse multiple Set-Cookie headers

**Formatting**:
- `formatCookieHeader(cookies)` - Format cookies for Cookie header
- `formatCookieDisplay(cookie)` - Human-readable cookie info

**Validation**:
- `isValidCookieName(name)` - Validate cookie name
- `isCookieExpired(cookie)` - Check if cookie expired
- `extractDomain(url)` - Extract domain from URL

### Request Runner Integration (`src/utils/requestRunner.js`)

**Before Request**:
1. Get cookies for request URL
2. Format Cookie header
3. Attach to request headers

**After Response**:
1. Extract Set-Cookie headers
2. Parse cookie attributes
3. Store in Cookie Jar

### UI Component (`src/components/request/CookiesTab.jsx`)

**Features**:
- View cookies for current domain
- Add new cookies manually
- Edit cookie attributes
- Delete cookies
- Visual indicators for expired cookies
- HttpOnly and Secure flags

## Usage

### Automatic Cookie Handling

```javascript
// 1. User sends login request
POST https://api.example.com/login
Body: { username: "user", password: "pass" }

// 2. Server responds with Set-Cookie
Response Headers:
Set-Cookie: session_id=abc123; Path=/; HttpOnly; Secure

// 3. Cookie automatically stored in Cookie Jar
cookieJar["api.example.com"] = [{
  name: "session_id",
  value: "abc123",
  path: "/",
  httpOnly: true,
  secure: true
}]

// 4. Next request automatically includes cookie
GET https://api.example.com/profile
Request Headers:
Cookie: session_id=abc123
```

### Manual Cookie Management

**Add Cookie**:
1. Open request editor
2. Click "Cookies" tab
3. Click "Add Cookie"
4. Enter name, value, and options
5. Click "Add Cookie"

**Delete Cookie**:
1. Open "Cookies" tab
2. Find cookie in list
3. Click trash icon

**View Cookies**:
- Cookies tab shows all cookies for current domain
- Displays name, value, domain, path, expiration
- Shows HttpOnly and Secure flags
- Highlights expired cookies

## Cookie Attributes

### Supported Attributes

| Attribute | Description | Example |
|-----------|-------------|---------|
| `name` | Cookie name | `session_id` |
| `value` | Cookie value | `abc123` |
| `domain` | Cookie domain | `api.example.com` |
| `path` | Cookie path | `/` or `/api` |
| `expires` | Expiration timestamp | `1234567890000` |
| `httpOnly` | HTTP-only flag | `true` or `false` |
| `secure` | Secure flag (HTTPS only) | `true` or `false` |
| `sameSite` | SameSite policy | `Lax`, `Strict`, `None` |

### Cookie Matching Rules

**Domain Matching**:
- Exact match: `api.example.com` matches `api.example.com`
- Subdomain match: `.example.com` matches `api.example.com`

**Path Matching**:
- Cookie path must be prefix of request path
- `/` matches all paths
- `/api` matches `/api/users` but not `/admin`

**Secure Flag**:
- Secure cookies only sent over HTTPS
- Non-secure cookies sent over HTTP and HTTPS

**Expiration**:
- Expired cookies automatically filtered
- No expiration = session cookie (persists until app restart)

## Storage

### LocalStorage Persistence

Cookies stored in browser LocalStorage:
- Key: `request-buddy-cookies`
- Format: JSON
- Automatic save on changes
- Automatic load on app start

### Auto-Cleanup

Expired cookies automatically removed every 5 minutes.

## Examples

### Example 1: Login Flow

```javascript
// Step 1: Login
POST https://api.example.com/auth/login
Body: { "email": "user@example.com", "password": "secret" }

Response:
Status: 200 OK
Headers:
  Set-Cookie: access_token=eyJhbGc...; Path=/; HttpOnly; Secure
  Set-Cookie: refresh_token=dGhpcyBp...; Path=/auth; HttpOnly; Secure

// Cookies automatically stored

// Step 2: Get Profile (cookie automatically attached)
GET https://api.example.com/user/profile
Request Headers:
  Cookie: access_token=eyJhbGc...

Response:
Status: 200 OK
Body: { "name": "John Doe", "email": "user@example.com" }
```

### Example 2: Multiple Cookies

```javascript
// Server sets multiple cookies
Response Headers:
Set-Cookie: session=abc123; Path=/
Set-Cookie: preferences=dark_mode; Path=/
Set-Cookie: analytics=xyz789; Path=/

// All cookies sent together
Request Headers:
Cookie: session=abc123; preferences=dark_mode; analytics=xyz789
```

### Example 3: Path-Specific Cookies

```javascript
// Cookie with specific path
Set-Cookie: admin_token=secret; Path=/admin

// Cookie sent to /admin paths
GET /admin/users → Cookie: admin_token=secret
GET /admin/settings → Cookie: admin_token=secret

// Cookie NOT sent to other paths
GET /api/users → (no admin_token cookie)
GET /profile → (no admin_token cookie)
```

## Testing

### Manual Testing

1. **Test Cookie Capture**:
   - Send request to API that returns Set-Cookie
   - Open Cookies tab
   - Verify cookie appears in list

2. **Test Cookie Attachment**:
   - Add cookie manually or via response
   - Send another request to same domain
   - Check browser console for "🍪 Attached cookies" log
   - Verify Cookie header in request

3. **Test Cookie Expiration**:
   - Add cookie with short expiration
   - Wait for expiration
   - Verify cookie marked as expired
   - Verify expired cookie not sent

4. **Test Cookie Deletion**:
   - Add cookie
   - Click delete button
   - Verify cookie removed from list
   - Verify cookie not sent in next request

### Browser Console Commands

```javascript
// Get cookie store
const cookieStore = window.useCookieStore.getState()

// View all cookies
console.log(cookieStore.cookieJar)

// Get cookies for URL
cookieStore.getCookiesForUrl('https://api.example.com/users')

// Add cookie manually
cookieStore.setCookie({
  name: 'test',
  value: '123',
  domain: 'api.example.com',
  path: '/',
  httpOnly: false,
  secure: false
})

// Delete cookie
cookieStore.deleteCookie('api.example.com', 'test', '/')

// Clear all cookies
cookieStore.clearAllCookies()

// Export cookies (backup)
const backup = cookieStore.exportCookies()
console.log(backup)

// Import cookies (restore)
cookieStore.importCookies(backup)
```

## Limitations

### Current Limitations

1. **Browser Fetch API Limitations**:
   - Browser fetch() cannot access Set-Cookie headers due to security
   - Workaround: Use Electron API for full cookie support
   - In browser mode, cookies work but Set-Cookie parsing limited

2. **No Cookie Sync**:
   - Cookies stored locally only
   - Not synced across devices
   - Not stored in Firebase

3. **No Cookie Encryption**:
   - Cookies stored in plain text in LocalStorage
   - Sensitive cookies should use HttpOnly flag

### Future Enhancements

1. **Cookie Sync**: Sync cookies across devices via Firebase
2. **Cookie Encryption**: Encrypt sensitive cookies
3. **Cookie Import/Export**: Import/Export cookies from/to Postman
4. **Cookie Domains View**: Manage all cookies by domain
5. **Cookie Search**: Search cookies by name/value
6. **Cookie Editing**: Edit existing cookies inline

## Security Considerations

### Best Practices

1. **Use HttpOnly**: Prevents JavaScript access to sensitive cookies
2. **Use Secure**: Ensures cookies only sent over HTTPS
3. **Set Expiration**: Limit cookie lifetime
4. **Use SameSite**: Prevent CSRF attacks
5. **Minimal Scope**: Use specific paths when possible

### Security Features

- ✅ HttpOnly flag support
- ✅ Secure flag support
- ✅ SameSite attribute support
- ✅ Path-based scoping
- ✅ Domain-based scoping
- ✅ Automatic expiration handling

## Troubleshooting

### Cookies Not Appearing

**Problem**: Cookies not showing in Cookies tab

**Solutions**:
1. Check if response has Set-Cookie header
2. Verify domain matches request URL
3. Check browser console for cookie parsing errors
4. Ensure cookies not expired

### Cookies Not Sent

**Problem**: Cookies not attached to requests

**Solutions**:
1. Verify cookie domain matches request domain
2. Check cookie path matches request path
3. Ensure cookie not expired
4. Check secure flag (HTTPS required if secure=true)
5. Look for "🍪 Attached cookies" log in console

### Cookies Disappearing

**Problem**: Cookies disappear after restart

**Solutions**:
1. Check if cookies have expiration set
2. Verify LocalStorage not being cleared
3. Check browser console for errors
4. Try exporting/importing cookies as backup

## Files Created

1. `src/stores/cookieStore.js` - Cookie Jar store
2. `src/utils/cookieUtils.js` - Cookie utilities
3. `src/components/request/CookiesTab.jsx` - Cookies UI
4. `src/utils/requestRunner.js` - Updated with cookie support
5. `src/components/request/RequestEditor.jsx` - Added Cookies tab
6. `COOKIE_SYSTEM.md` - This documentation

## Summary

The Cookie Jar system provides Postman-like cookie management with:
- ✅ Automatic cookie capture from responses
- ✅ Automatic cookie attachment to requests
- ✅ Manual cookie management UI
- ✅ Local persistence across restarts
- ✅ Full cookie attribute support
- ✅ Domain and path matching
- ✅ Expiration handling
- ✅ Security flag support

Cookies are now seamlessly integrated into the request workflow, making authenticated API testing much easier!

---

**Implemented**: March 12, 2026  
**Status**: ✅ Complete  
**Impact**: High (Feature Parity with Postman)
