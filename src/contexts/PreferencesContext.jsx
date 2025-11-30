import { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/settingsAPI';

// Default preferences
const DEFAULT_PREFERENCES = {
    theme: 'light',
    density: 'comfortable',
    defaultView: 'database',
    autoRefresh: false,
    refreshInterval: 30,
    itemsPerPage: 25,
    showLineNumbers: true,
    enableKeyboardShortcuts: true,
};

const PreferencesContext = createContext();

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) {
        throw new Error('usePreferences must be used within PreferencesProvider');
    }
    return context;
};

export const PreferencesProvider = ({ children }) => {
    const [preferences, setPreferences] = useState(() => {
        // Load from localStorage on init
        try {
            const saved = localStorage.getItem('prismix-preferences');
            if (saved) {
                return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load preferences:', error);
        }
        return DEFAULT_PREFERENCES;
    });

    // Save to localStorage and backend whenever preferences change
    useEffect(() => {
        try {
            localStorage.setItem('prismix-preferences', JSON.stringify(preferences));
            // Also save to backend
            settingsAPI.savePreferences(preferences).catch(err => {
                console.error('Failed to save preferences to backend:', err);
            });
        } catch (error) {
            console.error('Failed to save preferences:', error);
        }
    }, [preferences]);

    const updatePreference = (key, value) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    const updatePreferences = (updates) => {
        setPreferences(prev => ({
            ...prev,
            ...updates,
        }));
    };

    const resetPreferences = () => {
        setPreferences(DEFAULT_PREFERENCES);
    };

    const exportSettings = () => {
        try {
            const dataStr = JSON.stringify(preferences, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'prismix-settings.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export settings:', error);
        }
    };

    const importSettings = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    const merged = { ...DEFAULT_PREFERENCES, ...imported };
                    setPreferences(merged);
                    resolve(merged);
                } catch (error) {
                    console.error('Failed to import settings:', error);
                    reject(error);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    };

    const value = {
        preferences,
        updatePreference,
        updatePreferences,
        resetPreferences,
        exportSettings,
        importSettings,
    };

    return (
        <PreferencesContext.Provider value={value}>
            {children}
        </PreferencesContext.Provider>
    );
};

export default PreferencesContext;
