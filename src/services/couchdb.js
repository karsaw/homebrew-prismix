import axios from 'axios';

// Dynamic CouchDB client that can be reconfigured
let couchdbClient = null;

/**
 * Initialize or update the CouchDB client with connection settings
 * @param {Object} settings - Connection settings
 * @param {string} settings.url - CouchDB URL
 * @param {string} settings.username - CouchDB username
 * @param {string} settings.password - CouchDB password
 */
export const initializeCouchDB = (settings) => {
  couchdbClient = axios.create({
    baseURL: settings.url,
    auth: {
      username: settings.username,
      password: settings.password,
    },
    headers: {
      'Content-Type': 'application/json',
    },
  });
};

/**
 * Get the current CouchDB client
 * @returns {Object} Axios instance
 */
const getClient = () => {
  if (!couchdbClient) {
    // Try to load from localStorage
    const savedSettings = localStorage.getItem('couchdb-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      initializeCouchDB(settings);
    } else {
      // Use default settings
      initializeCouchDB({
        url: import.meta.env.VITE_COUCHDB_URL || 'http://localhost:5984',
        username: import.meta.env.VITE_COUCHDB_USER || 'admin',
        password: import.meta.env.VITE_COUCHDB_PASSWORD || 'admin',
      });
    }
  }
  return couchdbClient;
};

/**
 * Get all databases from CouchDB
 * @returns {Promise<Array<string>>} List of database names
 */
export const getAllDatabases = async () => {
  try {
    const client = getClient();
    const response = await client.get('/_all_dbs');
    return response.data;
  } catch (error) {
    console.error('Error fetching databases:', error);
    throw error;
  }
};

/**
 * Get all documents from a specific database
 * @param {string} dbName - The name of the database
 * @returns {Promise<Object>} Object containing all documents
 */
export const getAllDocuments = async (dbName) => {
  try {
    const client = getClient();
    const response = await client.get(`/${dbName}/_all_docs`, {
      params: {
        include_docs: true, // Include the full document content
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching documents from ${dbName}:`, error);
    throw error;
  }
};

/**
 * Get database information
 * @param {string} dbName - The name of the database
 * @returns {Promise<Object>} Database information
 */
export const getDatabaseInfo = async (dbName) => {
  try {
    const client = getClient();
    const response = await client.get(`/${dbName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching info for ${dbName}:`, error);
    throw error;
  }
};

/**
 * Test CouchDB connection
 * @returns {Promise<boolean>} True if connection is successful
 */
export const testConnection = async () => {
  try {
    const client = getClient();
    const response = await client.get('/');
    console.log('CouchDB connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('CouchDB connection failed:', error);
    return false;
  }
};

/**
 * Get all unique field names from documents in a database
 * @param {string} dbName - The name of the database
 * @param {number} sampleSize - Number of documents to sample (default: 100)
 * @returns {Promise<Array<string>>} Array of unique field names
 */
export const getDatabaseFields = async (dbName, sampleSize = 100) => {
  try {
    const client = getClient();
    const response = await client.get(`/${dbName}/_all_docs`, {
      params: {
        include_docs: true,
        limit: sampleSize,
      },
    });

    const fields = new Set();

    // Extract all field names from the documents
    response.data.rows.forEach(row => {
      if (row.doc) {
        Object.keys(row.doc).forEach(key => {
          // Filter out CouchDB internal fields
          if (!key.startsWith('_')) {
            fields.add(key);
          }
        });
      }
    });

    return Array.from(fields).sort();
  } catch (error) {
    console.error(`Error fetching fields from ${dbName}:`, error);
    throw error;
  }
};

/**
 * Execute a Mango query on a database
 * @param {string} dbName - The name of the database
 * @param {Object} query - The Mango query object
 * @returns {Promise<Object>} Query results
 */
export const executeQuery = async (dbName, query) => {
  try {
    const client = getClient();
    const response = await client.post(`/${dbName}/_find`, query);
    return response.data;
  } catch (error) {
    console.error(`Error executing query on ${dbName}:`, error);
    throw error;
  }
};

/**
 * Get the local node name from CouchDB
 * @returns {Promise<string>} Node name (e.g., "nonode@nohost")
 */
const getNodeName = async () => {
  try {
    const client = getClient();
    const response = await client.get('/_membership');
    // Usually the first node in all_nodes is the local one, or we can use the first in cluster_nodes
    return response.data.all_nodes[0] || 'nonode@nohost';
  } catch (error) {
    console.warn('Error fetching node name, using default:', error);
    return 'nonode@nohost';
  }
};

/**
 * Check if CORS is enabled on the CouchDB server
 * @returns {Promise<boolean>} True if CORS is enabled
 */
export const checkCorsStatus = async () => {
  try {
    const client = getClient();
    const nodeName = await getNodeName();
    // Try to get the config. Note: This requires admin access
    const response = await client.get(`/_node/${nodeName}/_config/httpd/enable_cors`);
    return response.data === 'true';
  } catch (error) {
    console.warn('Error checking CORS status:', error);
    return false;
  }
};

/**
 * Enable CORS on the CouchDB server
 * @returns {Promise<boolean>} True if successful
 */
export const enableCors = async () => {
  try {
    const client = getClient();
    const nodeName = await getNodeName();

    // Helper to set config
    const setConfig = async (section, key, value) => {
      // We need to send the value as a JSON string, so "true" becomes "\"true\""
      await client.put(`/_node/${nodeName}/_config/${section}/${key}`, JSON.stringify(value));
    };

    // Enable CORS
    await setConfig('httpd', 'enable_cors', 'true');
    await setConfig('cors', 'origins', '*');
    await setConfig('cors', 'credentials', 'true');
    await setConfig('cors', 'methods', 'GET, PUT, POST, HEAD, DELETE');
    await setConfig('cors', 'headers', 'accept, authorization, content-type, origin, referer');

    return true;
  } catch (error) {
    console.error('Error enabling CORS:', error);
    throw error;
  }
};
