const API_BASE_URL = 'http://localhost:9877/api';

export const settingsAPI = {
    // Get all settings
    getSettings: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings`);
            if (!response.ok) throw new Error('Failed to fetch settings');
            return await response.json();
        } catch (error) {
            console.error('Error fetching settings:', error);
            throw error;
        }
    },

    // Save all settings
    saveSettings: async (settings) => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (!response.ok) throw new Error('Failed to save settings');
            return await response.json();
        } catch (error) {
            console.error('Error saving settings:', error);
            throw error;
        }
    },

    // Save CouchDB settings
    saveCouchDBSettings: async (couchdbSettings) => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/couchdb`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(couchdbSettings),
            });
            if (!response.ok) throw new Error('Failed to save CouchDB settings');
            return await response.json();
        } catch (error) {
            console.error('Error saving CouchDB settings:', error);
            throw error;
        }
    },

    // Save preferences
    savePreferences: async (preferences) => {
        try {
            const response = await fetch(`${API_BASE_URL}/settings/preferences`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preferences),
            });
            if (!response.ok) throw new Error('Failed to save preferences');
            return await response.json();
        } catch (error) {
            console.error('Error saving preferences:', error);
            throw error;
        }
    },
};
