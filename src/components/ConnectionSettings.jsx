import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  Typography,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import { Close, Settings, Save, Delete, LightMode, DarkMode, FileDownload, FileUpload, Public, AutoAwesome } from '@mui/icons-material';
import { usePreferences } from '../contexts/PreferencesContext';
import { settingsAPI } from '../services/settingsAPI';
import { enableCors } from '../services/couchdb';

const ConnectionSettings = ({ onConnectionChange, isOpen, onClose, themeMode, onThemeChange }) => {
  const { preferences, updatePreference, exportSettings, importSettings } = usePreferences();
  const [importSuccess, setImportSuccess] = useState(false);
  const [importError, setImportError] = useState(null);
  const [corsLoading, setCorsLoading] = useState(false);
  const [corsSuccess, setCorsSuccess] = useState(null);
  const [corsError, setCorsError] = useState(null);

  const [activeTab, setActiveTab] = useState(0);
  const [aiSettings, setAiSettings] = useState({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4'
  });

  const [settings, setSettings] = useState({
    url: 'http://localhost:5984',
    username: 'admin',
    password: 'admin'
  });

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('couchdb-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    const savedAiSettings = localStorage.getItem('ai-settings');
    if (savedAiSettings) {
      setAiSettings(JSON.parse(savedAiSettings));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAiChange = (e) => {
    const { name, value } = e.target;
    setAiSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Save to localStorage
    localStorage.setItem('couchdb-settings', JSON.stringify(settings));
    localStorage.setItem('ai-settings', JSON.stringify(aiSettings));

    // Save to backend
    try {
      await settingsAPI.saveCouchDBSettings(settings);
    } catch (error) {
      console.error('Failed to save to backend:', error);
    }

    // Pass settings to parent
    onConnectionChange(settings);

    // Close modal
    if (onClose) {
      onClose();
    }
  };

  const handleClear = () => {
    if (activeTab === 0) {
      const defaultSettings = {
        url: 'http://localhost:5984',
        username: 'admin',
        password: 'admin'
      };
      setSettings(defaultSettings);
      localStorage.removeItem('couchdb-settings');
    } else {
      const defaultAiSettings = {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4'
      };
      setAiSettings(defaultAiSettings);
      localStorage.removeItem('ai-settings');
    }
  };

  const handleExportSettings = () => {
    exportSettings();
  };

  const handleImportSettings = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const settings = JSON.parse(e.target.result);
          await importSettings(settings);
          setImportSuccess(true);
          setImportError(null);
          setTimeout(() => setImportSuccess(false), 3000);
        } catch (err) {
          console.error('Error parsing settings file:', err);
          setImportError('Invalid settings file format');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setImportError('Failed to read file');
    }

    // Reset file input
    event.target.value = null;
  };

  const handleEnableCors = async () => {
    setCorsLoading(true);
    setCorsSuccess(null);
    setCorsError(null);
    try {
      await enableCors();
      setCorsSuccess('CORS enabled successfully!');
      setTimeout(() => setCorsSuccess(null), 5000);
    } catch (err) {
      setCorsError('Failed to enable CORS. Make sure CouchDB is running and you have admin access.');
    } finally {
      setCorsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        elevation: 0,
        sx: {
          borderRadius: 0,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
        }
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pr: 2,
          py: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: 0,
            bgcolor: 'rgba(100, 181, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Settings sx={{ fontSize: 22, color: '#64b5f6' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} fontSize="1.125rem">
              Settings
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Configure application preferences
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            color: 'text.secondary',
            borderRadius: 0,
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)} aria-label="settings tabs">
          <Tab label="General" />
          <Tab label="AI Integration" icon={<AutoAwesome fontSize="small" />} iconPosition="start" />
        </Tabs>
      </Box>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          {activeTab === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Server URL
                </Typography>
                <TextField
                  fullWidth
                  name="url"
                  value={settings.url}
                  onChange={handleChange}
                  placeholder="http://localhost:5984"
                  required
                  size="small"
                  InputProps={{
                    sx: {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      bgcolor: 'background.paper',
                      borderRadius: 0,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#64b5f6',
                          borderWidth: '2px',
                        }
                      }
                    }
                  }}
                  helperText="Include protocol (http:// or https://)"
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Username
                </Typography>
                <TextField
                  fullWidth
                  name="username"
                  value={settings.username}
                  onChange={handleChange}
                  placeholder="admin"
                  size="small"
                  required
                  InputProps={{
                    sx: {
                      bgcolor: 'background.paper',
                      borderRadius: 0,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#64b5f6',
                          borderWidth: '2px',
                        }
                      }
                    }
                  }}
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Password
                </Typography>
                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  value={settings.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  size="small"
                  required
                  InputProps={{
                    sx: {
                      bgcolor: 'background.paper',
                      borderRadius: 0,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#64b5f6',
                          borderWidth: '2px',
                        }
                      }
                    }
                  }}
                />
              </Box>

              <Box sx={{ mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleEnableCors}
                  disabled={corsLoading}
                  startIcon={corsLoading ? <CircularProgress size={16} /> : <Public />}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': {
                      borderColor: 'text.secondary',
                      bgcolor: 'action.hover'
                    }
                  }}
                >
                  Enable CORS on CouchDB
                </Button>
                {corsSuccess && (
                  <Alert severity="success" sx={{ mt: 1, fontSize: '0.8125rem', py: 0.5 }}>{corsSuccess}</Alert>
                )}
                {corsError && (
                  <Alert severity="error" sx={{ mt: 1, fontSize: '0.8125rem', py: 0.5 }}>{corsError}</Alert>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Theme Selection */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 500 }}>
                  Appearance
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={themeMode}
                    onChange={(e) => onThemeChange(e.target.value)}
                  >
                    <FormControlLabel
                      value="light"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LightMode sx={{ fontSize: 18 }} />
                          <Typography variant="body2">Light</Typography>
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="dark"
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <DarkMode sx={{ fontSize: 18 }} />
                          <Typography variant="body2">Dark</Typography>
                        </Box>
                      }
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Density Preference */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Density
                </Typography>
                <FormControl component="fieldset">
                  <RadioGroup
                    row
                    value={preferences.density}
                    onChange={(e) => updatePreference('density', e.target.value)}
                  >
                    <FormControlLabel
                      value="compact"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Compact</Typography>}
                    />
                    <FormControlLabel
                      value="comfortable"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Comfortable</Typography>}
                    />
                    <FormControlLabel
                      value="spacious"
                      control={<Radio size="small" />}
                      label={<Typography variant="body2">Spacious</Typography>}
                    />
                  </RadioGroup>
                </FormControl>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Settings Import/Export */}
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Settings Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileDownload />}
                    onClick={handleExportSettings}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'text.secondary',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    Export Settings
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    component="label"
                    startIcon={<FileUpload />}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'text.secondary',
                        bgcolor: 'action.hover'
                      }
                    }}
                  >
                    Import Settings
                    <input
                      type="file"
                      hidden
                      accept=".json"
                      onChange={handleImportSettings}
                    />
                  </Button>
                </Box>
                {importSuccess && (
                  <Alert severity="success" sx={{ mt: 1, fontSize: '0.8125rem' }}>
                    Settings imported successfully!
                  </Alert>
                )}
                {importError && (
                  <Alert severity="error" sx={{ mt: 1, fontSize: '0.8125rem' }}>
                    {importError}
                  </Alert>
                )}
              </Box>

              <Alert
                severity="info"
                icon="ℹ️"
                sx={{
                  bgcolor: 'action.hover',
                  color: 'text.secondary',
                  fontSize: '0.8125rem',
                  '& .MuiAlert-icon': {
                    color: 'text.secondary'
                  },
                  '& .MuiAlert-message': {
                    py: 0.25
                  }
                }}
              >
                Settings are saved locally in your browser
              </Alert>
            </Box>
          )}

          {activeTab === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  AI Provider
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    name="provider"
                    value={aiSettings.provider}
                    onChange={handleAiChange}
                    sx={{
                      bgcolor: 'background.paper',
                      borderRadius: 0,
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#64b5f6',
                        borderWidth: '2px',
                      }
                    }}
                  >
                    <MenuItem value="openai">OpenAI</MenuItem>
                    <MenuItem value="gemini">Google Gemini</MenuItem>
                    <MenuItem value="anthropic">Anthropic Claude</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  API Key
                </Typography>
                <TextField
                  fullWidth
                  name="apiKey"
                  type="password"
                  value={aiSettings.apiKey}
                  onChange={handleAiChange}
                  placeholder="sk-..."
                  size="small"
                  InputProps={{
                    sx: {
                      bgcolor: 'background.paper',
                      borderRadius: 0,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#64b5f6',
                          borderWidth: '2px',
                        }
                      }
                    }
                  }}
                  helperText="Your key is stored locally in your browser"
                />
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                  Model
                </Typography>
                <TextField
                  fullWidth
                  name="model"
                  value={aiSettings.model}
                  onChange={handleAiChange}
                  placeholder="gpt-4"
                  size="small"
                  InputProps={{
                    sx: {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      bgcolor: 'background.paper',
                      borderRadius: 0,
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#64b5f6',
                          borderWidth: '2px',
                        }
                      }
                    }
                  }}
                  helperText="e.g., gpt-4, gpt-3.5-turbo, claude-3-opus"
                />
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 3, gap: 1.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
          <Button
            onClick={handleClear}
            startIcon={<Delete />}
            size="medium"
            sx={{
              color: 'text.secondary',
              borderRadius: 0,
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.08)',
                color: 'error.main'
              }
            }}
          >
            Clear
          </Button>
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={onClose}
            size="medium"
            variant="outlined"
            sx={{
              borderColor: 'divider',
              color: 'text.primary',
              borderRadius: 0,
              '&:hover': {
                borderColor: 'text.secondary',
                bgcolor: 'action.hover'
              }
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Save />}
            size="medium"
            disableElevation
            sx={{
              bgcolor: '#64b5f6',
              color: '#ffffff',
              borderRadius: 0,
              fontWeight: 600,
              '&:hover': {
                bgcolor: '#42a5f5',
              }
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ConnectionSettings;
