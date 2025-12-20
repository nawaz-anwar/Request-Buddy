# Request Buddy

A modern desktop application for API development and testing, built with Electron, React, and Firebase. Features real-time collaboration, environment variables, and a professional Postman-like interface.

## 🚀 Features

### Core Features
- ✅ **Workspace Management**: 
  - **Multi-workspace Support**: Create and switch between workspaces
  - **Workspace CRUD**: Create, rename, delete with confirmation
  - **Cascade Delete**: Automatically removes all collections and requests
  - **Auto-switching**: Switches to available workspace after deletion
- ✅ **Collections & Folders**: 
  - **Full CRUD Operations**: Create, rename, delete collections
  - **Modern Modals**: Professional confirmation dialogs
  - **Cascade Delete**: Removes all folders and requests in collection
  - **Context Menus**: Right-click for quick actions
- ✅ **Postman Import/Export**: 
  - **Full Postman v2.1 Support**: Import and export collections
  - **Drag & Drop Import**: Easy collection importing with validation
  - **Recursive Structure**: Preserves folders and nested organization
  - **Format Conversion**: Headers, body, auth, and URL conversion
  - **Error Handling**: Comprehensive validation and error reporting
- ✅ **HTTP Methods**: Full support for GET, POST, PUT, PATCH, DELETE
- ✅ **Request Configuration**: 
  - **Tabbed Interface**: Params, Headers, Body tabs
  - **Smart Headers**: Auto-suggestions and enable/disable toggles
  - **Query Parameters**: Enable/disable individual params with URL preview
  - **Request Body**: JSON (with formatting), Raw Text, Form Data with file upload
  - **Auto-save**: Changes automatically saved to Firestore
  - **Keyboard Shortcuts**: Cmd+Enter/Ctrl+Enter to send requests
- ✅ **Response Viewer**: 
  - **Tabbed Interface**: Body, Headers, Meta tabs
  - **JSON Syntax Highlighting**: Pretty-printed with color coding
  - **Raw/Pretty Toggle**: Switch between formatted and raw view
  - **HTML Preview**: Collapsible iframe preview for HTML responses
  - **Status Indicators**: Color-coded status badges with icons
  - **Response Metadata**: Timing, size, timestamp display
  - **Copy & Download**: Export responses to clipboard or file
  - **Content Type Detection**: Auto-format based on response type
- ✅ **Request Management**:
  - **Full CRUD Operations**: Create, rename, duplicate, delete requests
  - **Smart Creation**: Auto-opens new requests in tabs
  - **Duplicate Functionality**: Copy requests with all settings
  - **Tab Integration**: Auto-closes tabs when requests are deleted
  - **Context Menus**: Right-click for quick actions
- ✅ **Request History**: 
  - Automatic history tracking for all sent requests
  - History sidebar with search and filtering
  - Click history items to view past responses (read-only)
  - Status code filtering (success/error)
  - Time and size tracking
- ✅ **Tabbed Interface**: 
  - Multiple request tabs like Postman
  - Unsaved changes tracking with visual indicators
  - Tab context menu (save, duplicate, close)
  - Keyboard shortcuts (Cmd+T new tab, Cmd+W close tab)
  - Drag and drop tab reordering
- ✅ **Environment Variables**: 
  - Create/manage multiple environments (dev/staging/prod)
  - Variable replacement with `{{variable}}` syntax
  - Environment selector in header
  - Visual hints for available/missing variables
- ✅ **Real-time Sync**: Firebase-powered collaboration

### Collaboration Features
- 🔐 **Firebase Authentication**: Email/Password + Google Sign-in
- 👥 **Multi-User Workspaces**: 
  - **Role-Based Access**: Admin, Editor, Viewer permissions
  - **Member Management**: Invite users by email, change roles
  - **Real-time Collaboration**: All changes sync instantly
  - **Permission Enforcement**: UI adapts based on user role
- 🔄 **Real-time Sync**: Share collections and requests with team members
- 🌐 **Environment Management**: Shared environment variables
- 🛡️ **Security**: Firestore rules enforce workspace permissions

## 🛠 Tech Stack

- **Desktop Framework**: Electron
- **Frontend**: React 18 + Vite
- **State Management**: Zustand
- **Styling**: TailwindCSS
- **Backend**: Firebase (Auth + Firestore)
- **HTTP Client**: Axios (in main process)
- **Icons**: Lucide React

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### 1. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 2. Firebase Configuration

The app is pre-configured with Firebase. The configuration is already set in \`src/services/firebase.js\`.

### 3. Development

\`\`\`bash
# Start development server
npm run dev

# Start Electron in development mode
npm run electron:dev
\`\`\`

### 4. Building for Production

\`\`\`bash
# Build for production
npm run build

# Create Electron distributables
npm run electron:build

# Create release packages
npm run release
\`\`\`

## 🏗 Project Structure

\`\`\`
request-buddy/
├── electron/                    # Electron main process
│   ├── main.js                 # Main Electron process
│   ├── preload.js              # Secure IPC bridge
│   └── electron-builder.yml    # Build configuration
├── src/
│   ├── components/
│   │   ├── layout/             # Main layout components
│   │   │   ├── Header.jsx      # App header
│   │   │   ├── Sidebar.jsx     # Collections sidebar
│   │   │   ├── RequestEditor.jsx # Request configuration
│   │   │   └── ResponseViewer.jsx # Response display
│   │   └── ui/                 # Reusable UI components
│   ├── layouts/
│   │   └── DashboardLayout.jsx # Main app layout
│   ├── pages/
│   │   ├── AuthPage.jsx        # Authentication page
│   │   └── DashboardPage.jsx   # Main dashboard
│   ├── stores/                 # Zustand state stores
│   │   ├── authStore.js        # Authentication state
│   │   ├── workspaceStore.js   # Workspace management
│   │   ├── collectionStore.js  # Collections & folders
│   │   ├── requestStore.js     # Requests & tabs
│   │   ├── historyStore.js     # Request history
│   │   └── environmentStore.js # Environment variables
│   ├── services/
│   │   └── firebase.js         # Firebase configuration
│   ├── App.jsx                 # Root component
│   └── main.jsx               # Entry point
├── index.html                  # HTML template
├── vite.config.js             # Vite configuration
├── tailwind.config.js         # Tailwind configuration
└── package.json               # Dependencies & scripts
\`\`\`

## 🗄 Firestore Data Structure

### Workspaces
\`\`\`javascript
{
  id: "workspace_id",
  name: "My Workspace",
  createdAt: timestamp,
  members: { "user_id": "owner" },
  memberIds: ["user_id"]
}
\`\`\`

### Collections
\`\`\`javascript
{
  id: "collection_id",
  name: "API Collection",
  workspaceId: "workspace_id",
  createdAt: timestamp
}
\`\`\`

### Folders
\`\`\`javascript
{
  id: "folder_id",
  name: "Auth Endpoints",
  collectionId: "collection_id",
  workspaceId: "workspace_id",
  createdAt: timestamp
}
\`\`\`

### Requests
\`\`\`javascript
{
  id: "request_id",
  name: "Get Users",
  method: "GET",
  url: "https://api.example.com/users",
  headers: { "Content-Type": "application/json" },
  params: { "page": "1", "limit": "10" },
  body: { type: "json", content: "{}" },
  auth: { type: "bearer", token: "..." },
  folderId: "folder_id",
  collectionId: "collection_id",
  workspaceId: "workspace_id",
  createdAt: timestamp,
  updatedAt: timestamp
}
\`\`\`

### Environments
\`\`\`javascript
{
  id: "environment_id",
  name: "Development",
  workspaceId: "workspace_id",
  variables: {
    "baseUrl": "https://api-dev.example.com",
    "token": "dev-token-123",
    "apiKey": "dev-key-456"
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
\`\`\`

### History
\`\`\`javascript
{
  id: "history_id",
  requestId: "request_id",
  workspaceId: "workspace_id",
  method: "GET",
  url: "https://api.example.com/users",
  status: 200,
  time: 150,
  responseData: {...},
  responseHeaders: {...},
  responseSize: 1024,
  createdAt: timestamp
}
\`\`\`

## ⌨️ Keyboard Shortcuts

- \`Cmd/Ctrl + Enter\`: Send Request
- \`Cmd/Ctrl + S\`: Save Current Request
- \`Cmd/Ctrl + T\`: New Request Tab
- \`Cmd/Ctrl + W\`: Close Current Tab
- \`Cmd/Ctrl + 1-9\`: Switch to Tab (by number)
- \`Cmd/Ctrl + N\`: New Request
- \`Cmd/Ctrl + Shift + N\`: New Collection

## 🔧 Development Commands

\`\`\`bash
# Development
npm run dev              # Start Vite dev server
npm run electron:dev     # Start Electron with React dev server

# Building
npm run build           # Build React app
npm run electron:build  # Build Electron app
npm run release         # Create release packages

# Preview
npm run preview         # Preview built React app
npm run electron:preview # Preview built Electron app
\`\`\`

## 🚀 Features in Detail

### Postman Import/Export
- **Import Collections**: Click the upload icon in the collections sidebar
- **Supported Format**: Postman Collection v2.1 (exact schema validation)
- **Drag & Drop**: Simply drag .json files into the import modal
- **Export Collections**: Right-click any collection and select "Export as Postman"
- **Structure Preservation**: Maintains folder hierarchy and request organization
- **Format Conversion**: 
  - Headers with enable/disable states
  - Request bodies (raw, form-data, urlencoded)
  - Authentication (Bearer token, Basic auth)
  - URL parsing (both raw strings and object format)
- **Error Handling**: Clear validation messages for invalid collections
- **File Naming**: Exports use format `postman-{collection-name}.json`

### Environment Variables
- Create multiple environments (dev, staging, prod) with key-value pairs
- Use `{{variable}}` syntax in URLs, headers, parameters, and request bodies
- Automatic variable replacement during requests
- Environment selector dropdown in the header
- Visual indicators for available and missing variables
- Secure variable storage in Firestore

### Multi-User Collaboration
- **Workspace Sharing**: Invite team members to shared workspaces
- **Role-Based Permissions**:
  - **Admin**: Manage members, full CRUD access, delete workspace
  - **Editor**: Create/edit/delete collections and requests
  - **Viewer**: Read-only access to all workspace content
- **Member Management**: 
  - Invite users by email address
  - Change user roles dynamically
  - Remove users from workspace
  - Prevent removing last admin or workspace owner
- **Real-time Sync**: All workspace members see changes instantly
- **Permission Enforcement**: UI elements show/hide based on user role
- **Secure Access**: Firestore rules enforce workspace-level permissions

### Professional UI
- Dark theme optimized for developers
- Resizable panels
- Tabbed interface for multiple requests
- Postman-inspired design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and feature requests, please create an issue in the GitHub repository.