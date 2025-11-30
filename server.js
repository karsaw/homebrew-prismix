import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 9877;
const QUERIES_FILE = path.join(__dirname, 'saved-queries.json');
const SETTINGS_FILE = path.join(__dirname, 'public/settings.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize the queries file if it doesn't exist
async function initializeQueriesFile() {
  try {
    await fs.access(QUERIES_FILE);
  } catch {
    await fs.writeFile(QUERIES_FILE, JSON.stringify([], null, 2));
    console.log('Created saved-queries.json file');
  }
}

// Initialize the settings file if it doesn't exist
async function initializeSettingsFile() {
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    const defaultSettings = {
      couchdb: {
        url: 'http://localhost:5984',
        username: 'admin',
        password: 'admin'
      },
      preferences: {
        theme: 'light',
        density: 'comfortable',
        defaultView: 'database',
        autoRefresh: false,
        refreshInterval: 30,
        itemsPerPage: 25,
        showLineNumbers: true,
        enableKeyboardShortcuts: true
      }
    };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
    console.log('Created settings.json file');
  }
}

// ============ QUERIES API ============

// Get all saved queries
app.get('/api/queries', async (req, res) => {
  try {
    const data = await fs.readFile(QUERIES_FILE, 'utf-8');
    const queries = JSON.parse(data);
    res.json(queries);
  } catch (error) {
    console.error('Error reading queries:', error);
    res.status(500).json({ error: 'Failed to read queries' });
  }
});

// Get a single query by ID
app.get('/api/queries/:id', async (req, res) => {
  try {
    const data = await fs.readFile(QUERIES_FILE, 'utf-8');
    const queries = JSON.parse(data);
    const query = queries.find(q => q.id === req.params.id);

    if (query) {
      res.json(query);
    } else {
      res.status(404).json({ error: 'Query not found' });
    }
  } catch (error) {
    console.error('Error reading query:', error);
    res.status(500).json({ error: 'Failed to read query' });
  }
});

// Save a new query
app.post('/api/queries', async (req, res) => {
  try {
    const data = await fs.readFile(QUERIES_FILE, 'utf-8');
    const queries = JSON.parse(data);

    const newQuery = {
      id: Date.now().toString(),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    queries.push(newQuery);
    await fs.writeFile(QUERIES_FILE, JSON.stringify(queries, null, 2));

    console.log(`Saved query: ${newQuery.name}`);
    res.status(201).json(newQuery);
  } catch (error) {
    console.error('Error saving query:', error);
    res.status(500).json({ error: 'Failed to save query' });
  }
});

// Update an existing query
app.put('/api/queries/:id', async (req, res) => {
  try {
    const data = await fs.readFile(QUERIES_FILE, 'utf-8');
    const queries = JSON.parse(data);

    const index = queries.findIndex(q => q.id === req.params.id);

    if (index !== -1) {
      queries[index] = {
        ...queries[index],
        ...req.body,
        updatedAt: new Date().toISOString(),
      };

      await fs.writeFile(QUERIES_FILE, JSON.stringify(queries, null, 2));
      console.log(`Updated query: ${queries[index].name}`);
      res.json(queries[index]);
    } else {
      res.status(404).json({ error: 'Query not found' });
    }
  } catch (error) {
    console.error('Error updating query:', error);
    res.status(500).json({ error: 'Failed to update query' });
  }
});

// Delete a query
app.delete('/api/queries/:id', async (req, res) => {
  try {
    const data = await fs.readFile(QUERIES_FILE, 'utf-8');
    const queries = JSON.parse(data);

    const filteredQueries = queries.filter(q => q.id !== req.params.id);

    if (filteredQueries.length < queries.length) {
      await fs.writeFile(QUERIES_FILE, JSON.stringify(filteredQueries, null, 2));
      console.log(`Deleted query with ID: ${req.params.id}`);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Query not found' });
    }
  } catch (error) {
    console.error('Error deleting query:', error);
    res.status(500).json({ error: 'Failed to delete query' });
  }
});

// Export all queries
app.get('/api/queries/export/all', async (req, res) => {
  try {
    const data = await fs.readFile(QUERIES_FILE, 'utf-8');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=couchdb-queries-export-${new Date().toISOString().split('T')[0]}.json`);
    res.send(data);
  } catch (error) {
    console.error('Error exporting queries:', error);
    res.status(500).json({ error: 'Failed to export queries' });
  }
});

// Import queries
app.post('/api/queries/import', async (req, res) => {
  try {
    const importedQueries = req.body;

    if (!Array.isArray(importedQueries)) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    await fs.writeFile(QUERIES_FILE, JSON.stringify(importedQueries, null, 2));
    console.log(`Imported ${importedQueries.length} queries`);
    res.json({ success: true, count: importedQueries.length });
  } catch (error) {
    console.error('Error importing queries:', error);
    res.status(500).json({ error: 'Failed to import queries' });
  }
});

// ============ SETTINGS API ============

// Get all settings
app.get('/api/settings', async (req, res) => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error('Error reading settings:', error);
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

// Save all settings
app.post('/api/settings', async (req, res) => {
  try {
    const settings = req.body;
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    console.log('Settings saved successfully');
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Error saving settings:', error);
    res.status(500).json({ error: 'Failed to save settings' });
  }
});

// Save CouchDB settings
app.post('/api/settings/couchdb', async (req, res) => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    settings.couchdb = req.body;
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    console.log('CouchDB settings saved successfully');
    res.json({ success: true, message: 'CouchDB settings saved successfully' });
  } catch (error) {
    console.error('Error saving CouchDB settings:', error);
    res.status(500).json({ error: 'Failed to save CouchDB settings' });
  }
});

// Save preferences
app.post('/api/settings/preferences', async (req, res) => {
  try {
    const data = await fs.readFile(SETTINGS_FILE, 'utf8');
    const settings = JSON.parse(data);
    settings.preferences = req.body;
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
    console.log('Preferences saved successfully');
    res.json({ success: true, message: 'Preferences saved successfully' });
  } catch (error) {
    console.error('Error saving preferences:', error);
    res.status(500).json({ error: 'Failed to save preferences' });
  }
});

// Start server
Promise.all([initializeQueriesFile(), initializeSettingsFile()]).then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    console.log(`Queries file: ${QUERIES_FILE}`);
    console.log(`Settings file: ${SETTINGS_FILE}`);
  });
});
