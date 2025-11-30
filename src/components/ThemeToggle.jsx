import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { LightMode, DarkMode } from '@mui/icons-material';
import { usePreferences } from '../contexts/PreferencesContext';

const ThemeToggle = () => {
    const { preferences, updatePreference } = usePreferences();
    const isLight = preferences.theme === 'light';

    const toggle = () => {
        const newTheme = isLight ? 'dark' : 'light';
        updatePreference('theme', newTheme);
    };

    return (
        <Tooltip title={`Switch to ${isLight ? 'dark' : 'light'} mode`}>
            <IconButton onClick={toggle} size="large" sx={{ color: 'inherit' }}>
                {isLight ? <LightMode /> : <DarkMode />}
            </IconButton>
        </Tooltip>
    );
};

export default ThemeToggle;
