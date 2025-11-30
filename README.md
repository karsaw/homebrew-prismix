# Prismix - CouchDB Visual Query Builder

A modern, professional React application for visual CouchDB query building, database management, and AI-powered query generation.

## ✨ Key Features

### 🎯 Visual Query Builder
- **Node-Based Interface** - Build queries using an intuitive horizontal flow of connected nodes
- **FROM Node** - Select database with searchable dropdown
- **SELECT Node** - Choose fields with checkboxes, Select All/Deselect All options
- **WHERE Node** - Add multiple conditions with 14 advanced operators
- **ORDER BY Node** - Sort results by any field (ascending/descending)
- **LIMIT Node** - Control result count with optional "No Limit" toggle
- **Dual Modes** - Switch between Visual and Code modes seamlessly

### 🤖 AI-Powered Query Generation
- **Natural Language Queries** - Describe what you want in plain English
- **Multi-Provider Support** - Works with OpenAI, Google Gemini, and Anthropic Claude
- **Smart Schema Awareness** - AI understands your database structure
- **Floating Action Button** - Quick access with animated purple gradient button
- **Automatic Code Generation** - AI generates valid Mango queries instantly

### � Advanced Query Operators
- `$eq` - Equals
- `$ne` - Not equals
- `$gt` - Greater than
- `$gte` - Greater than or equal
- `$lt` - Less than
- `$lte` - Less than or equal
- `$in` - In array (comma-separated values)
- `$nin` - Not in array
- `$all` - All values in array
- `$size` - Array length
- `$mod` - Modulo operation
- `$regex` - Regular expression match
- `$exists` - Field exists (true/false)
- `$type` - Field type validation

### 💾 Query Management
- **Save Queries** - Store queries with custom names
- **Query Library** - Browse all saved queries in Views section
- **Refresh Results** - Re-execute saved queries to update data
- **Export/Import** - Backup and share queries as JSON
- **Query History** - Track execution timestamps and result counts

### � Data Browsing
- **Database Explorer** - View all databases with searchable dropdown in top bar
- **Document List** - Browse documents with full-width layout
- **Pagination** - Navigate large datasets efficiently
- **Search** - Find documents by ID or content

### 🎨 Results Visualization
- **JSON View** - Syntax-highlighted, pretty-printed JSON output
- **Table View** - Structured data in sortable columns
- **Toggle Views** - Switch between JSON and Table with one click
- **Download Results** - Export query results as JSON files
- **Pagination Controls** - Navigate through results (5 items per page)

### ⚙️ Settings & Configuration
- **CouchDB Connection** - Configure URL, username, and password
- **Connection Testing** - Validate settings before saving
- **CORS Management** - Enable CORS on CouchDB with one click
- **Theme Selection** - Light and dark mode support
- **Density Options** - Compact, Comfortable, or Spacious layouts
- **AI Integration** - Configure AI provider, API key, and model
- **Settings Persistence** - All settings saved locally in browser

### 🎯 JSON Validation
- **Real-Time Validation** - Instant feedback on JSON syntax errors
- **Error Messages** - Clear, actionable error descriptions
- **Visual Indicators** - Color-coded borders (green for valid, red for invalid)
- **Monaco Editor** - Professional code editor with syntax highlighting

### � Modern UI/UX
- **Material-UI Design** - Professional, clean interface
- **Responsive Layout** - Works on desktop and tablet
- **Color-Coded Sections** - Blue (Data), Purple (Build), Green (Views), Orange (Stats)
- **Breadcrumb Navigation** - Always know where you are
- **URL Routing** - Bookmarkable pages with browser back/forward support
- **Smooth Animations** - Polished transitions and hover effects

## 🏗️ Architecture

### Frontend (Port 9876)
- **React 19** - Modern UI framework
- **Material-UI 7** - Professional component library
- **Vite 7** - Lightning-fast build tool
- **React Router 7** - Client-side routing
- **Monaco Editor** - VS Code-powered JSON editor
- **Axios** - HTTP client for API requests

### Backend (Port 9877)
- **Express 4** - REST API server
- **CORS** - Cross-origin resource sharing
- **File-based Storage** - JSON persistence for queries and settings

### Database
- **CouchDB** - NoSQL database with Mango query API

## 🚀 Getting Started

### Quick Install (macOS/Linux)

**Install via Homebrew (Recommended):**
```bash
brew tap karsaw/prismix
brew install prismix
prismix
```

This will:
- Install all dependencies automatically
- Set up the application
- Start both frontend (port 9876) and backend (port 9877)

**Available commands after Homebrew installation:**
- `prismix` - Start both frontend and backend
- `prismix-server` - Start backend only
- `prismix-dev` - Start frontend only

### Manual Installation

If you prefer to run from source or are not using Homebrew:

#### Prerequisites
- Node.js v16 or higher
- CouchDB instance (local or remote)
- npm or yarn

### Installation
```bash
npm install
```

### Running the Application

**Development Mode (Recommended):**
```bash
npm start
```

This starts:
- Backend server on `http://localhost:9877`
- Frontend dev server on `http://localhost:9876`

**Run Separately:**
```bash
npm run server  # Backend only
npm run dev     # Frontend only
```

### Initial Setup

1. **Configure CouchDB Connection:**
   - Click the Settings icon in the top bar
   - Enter your CouchDB URL (e.g., `http://localhost:5984`)
   - Enter username and password
   - Click "Test Connection"
   - Save settings once connected

2. **Configure AI Integration (Optional):**
   - Open Settings → AI Integration tab
   - Select your AI provider (OpenAI, Gemini, or Anthropic)
   - Enter your API key
   - Specify the model (e.g., `gpt-4`, `gemini-pro`, `claude-3-opus`)
   - Save settings

3. **Enable CORS (if needed):**
   - In Settings, click "Enable CORS on CouchDB"
   - This configures CouchDB to allow browser requests

## 📖 Usage Guide

### Building Queries Visually

1. **Select Database** - Choose from the FROM node dropdown
2. **Select Fields** - Pick which fields to return (or select all)
3. **Add Conditions** - Build WHERE clauses with multiple conditions
4. **Sort Results** - Choose field and direction in ORDER BY node
5. **Set Limit** - Control how many results to return
6. **Execute** - Click "Run Query" to see results

### Using AI Query Generation

1. **Click the Floating Button** - Purple sparkle button in bottom-right corner
2. **Describe Your Query** - Type in natural language (e.g., "Find all users over 25 in New York")
3. **Generate** - AI creates the Mango query for you
4. **Review & Run** - Query appears in Code mode, ready to execute

### Code Mode

- **Switch Modes** - Toggle between Visual and Code using the header buttons
- **Edit JSON** - Manually write or modify Mango queries
- **Validation** - Real-time syntax checking with error messages
- **Execute** - Run custom queries directly

### Saving & Managing Queries

1. **Save Query** - After execution, click "Save Query" and enter a name
2. **View Saved Queries** - Navigate to Views section
3. **Refresh Results** - Re-execute any saved query
4. **Export/Import** - Backup your query library as JSON

## 🔌 API Endpoints

The backend provides these REST endpoints:

### Queries
- `GET /api/queries` - Get all saved queries
- `GET /api/queries/:id` - Get specific query
- `POST /api/queries` - Save new query
- `PUT /api/queries/:id` - Update query
- `DELETE /api/queries/:id` - Delete query
- `GET /api/queries/export/all` - Export all queries
- `POST /api/queries/import` - Import queries

### Settings
- `GET /api/settings` - Get all settings
- `POST /api/settings` - Save all settings
- `POST /api/settings/couchdb` - Save CouchDB settings
- `POST /api/settings/preferences` - Save user preferences

## 💾 Data Storage

### Saved Queries
```
couchdb-react-app/saved-queries.json
```

### Application Settings
```
couchdb-react-app/public/settings.json
```

### Local Storage (Browser)
- CouchDB connection settings
- AI integration settings
- User preferences (theme, density)

## 🎨 UI Sections

### Data View (Blue)
- Database selection dropdown in top bar
- Full-width document list
- Search and filter documents
- Pagination controls

### Build View (Purple)
- Visual query builder with node-based interface
- Code mode with Monaco editor
- AI query generation (floating button)
- Results display (JSON/Table toggle)

### Views View (Green)
- Saved queries library
- Query details and metadata
- Refresh and delete actions
- Export/import functionality

### Stats View (Orange)
- Database statistics
- Query analytics
- Performance metrics

## ⌨️ Keyboard Shortcuts

- `?` - Open help center
- `Ctrl/Cmd + S` - Save query
- `Ctrl/Cmd + Enter` - Execute query
- `Ctrl/Cmd + K` - Focus search

## 🔐 Security

- Credentials stored securely in browser localStorage
- API keys never sent to backend server
- HTTPS support for remote CouchDB connections
- CORS-enabled backend
- No sensitive data in query export files

## 🌐 Browser Support

- Chrome/Edge (recommended)
- Firefox
- Safari
- Any modern browser with ES6+ support

## 📊 Performance

- Lazy loading of documents
- Efficient pagination (5 items per page)
- Optimized React rendering
- Fast Vite development server
- Monaco editor with syntax highlighting

## 🛠️ Development

```bash
npm run dev     # Start frontend
npm run server  # Start backend
npm run build   # Build for production
npm run lint    # Run ESLint
npm run preview # Preview production build
```

## 🎯 Common Use Cases

### Development & Testing
- Test CouchDB queries during development
- Validate data structure and content
- Debug database issues
- Prototype query logic

### Data Analysis
- Explore database contents
- Generate reports from CouchDB data
- Identify data patterns
- Perform ad-hoc queries

### Database Administration
- Monitor database health
- Manage database contents
- Audit data changes
- Perform cleanup operations

### Learning & Training
- Learn CouchDB Mango query syntax
- Understand database structure
- Practice query building
- Train new team members

### AI-Assisted Querying
- Generate queries from natural language
- Learn Mango syntax by example
- Quickly build complex queries
- Explore data without writing code

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

Built with modern web technologies and best practices for database management and query building.

**Powered by:**
- CouchDB for robust NoSQL data storage
- React for reactive user interfaces
- Material-UI for professional design
- Express for reliable backend services
- OpenAI, Google Gemini, and Anthropic for AI capabilities

---

*Prismix - Making CouchDB query building visual, intuitive, and AI-powered.*
