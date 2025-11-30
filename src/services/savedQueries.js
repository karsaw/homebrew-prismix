// Service to manage saved queries and results using backend API
// Queries are stored in a JSON file on the server

import axios from 'axios';

const API_BASE_URL = 'http://localhost:9877/api/queries';

/**
 * Get all saved queries from the JSON file
 * @returns {Promise<Array>} Array of saved query objects
 */
export const getAllSavedQueries = async () => {
  try {
    const response = await axios.get(API_BASE_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching saved queries:', error);
    return [];
  }
};

/**
 * Save a new query to the JSON file
 * @param {Object} queryData - Query data to save
 * @param {string} queryData.name - Name of the query
 * @param {string} queryData.database - Database name
 * @param {Object} queryData.query - The query object
 * @param {Object} queryData.results - Query results
 * @returns {Promise<Object>} The saved query with ID and timestamp
 */
export const saveQuery = async (queryData) => {
  try {
    const response = await axios.post(API_BASE_URL, queryData);
    return response.data;
  } catch (error) {
    console.error('Error saving query:', error);
    throw error;
  }
};

/**
 * Update an existing saved query in the JSON file
 * @param {string} id - Query ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} The updated query
 */
export const updateSavedQuery = async (id, updates) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${id}`, updates);
    return response.data;
  } catch (error) {
    console.error('Error updating query:', error);
    throw error;
  }
};

/**
 * Delete a saved query from the JSON file
 * @param {string} id - Query ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteSavedQuery = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/${id}`);
    return true;
  } catch (error) {
    console.error('Error deleting query:', error);
    throw error;
  }
};

/**
 * Get a single saved query by ID
 * @param {string} id - Query ID
 * @returns {Promise<Object|null>} The query object or null
 */
export const getSavedQueryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching query:', error);
    return null;
  }
};

/**
 * Export all queries as JSON file
 * @returns {Promise<Blob>} JSON blob for download
 */
export const exportQueries = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/export/all`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting queries:', error);
    throw error;
  }
};

/**
 * Import queries from JSON
 * @param {Array} jsonData - Array of query objects
 * @returns {Promise<Object>} Import result
 */
export const importQueries = async (jsonData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/import`, jsonData);
    return response.data;
  } catch (error) {
    console.error('Error importing queries:', error);
    throw error;
  }
};
