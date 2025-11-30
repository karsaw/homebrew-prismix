import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import './view-colors.css';
import { usePreferences } from './contexts/PreferencesContext';
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Chip,
  Button,
  IconButton,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Breadcrumbs,
  Link,
  Menu,
  MenuItem,
  Tooltip,
  Autocomplete,
  TextField
} from '@mui/material';
import { Storage, Code, Visibility, Settings, CheckCircle, Cancel, HourglassEmpty, Wifi, Assessment, Help } from '@mui/icons-material';
import ConnectionSettings from './components/ConnectionSettings';
import DatabaseList from './components/DatabaseList';
import DocumentList from './components/DocumentList';
import QueryBuilder from './components/QueryBuilder';
import ViewsManager from './components/ViewsManager';
import ThemeToggle from './components/ThemeToggle';
import StatsDashboard from './components/StatsDashboard';
import HelpCenter from './components/HelpCenter';
import OnboardingDialog from './components/OnboardingDialog';
import { testConnection, initializeCouchDB, getAllDatabases } from './services/couchdb';

const createAppTheme = (mode) => createTheme({
  palette: {
    mode: mode,
    primary: {
      main: mode === 'light' ? '#1a1a1a' : '#ffffff',
      light: mode === 'light' ? '#404040' : '#e0e0e0',
      dark: mode === 'light' ? '#000000' : '#b0b0b0',
    },
    secondary: {
      main: mode === 'light' ? '#666666' : '#aaaaaa',
    },
    background: {
      default: mode === 'light' ? '#fafafa' : '#121212',
      paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#1a1a1a' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#aaaaaa',
    },
    divider: mode === 'light' ? '#e0e0e0' : '#333333',
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 500,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 500,
      letterSpacing: '-0.25px',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0 1px 3px rgba(0,0,0,0.08)'
            : '0 1px 3px rgba(0,0,0,0.3)',
        },
        elevation2: {
          boxShadow: mode === 'light'
            ? '0 2px 6px rgba(0,0,0,0.08)'
            : '0 2px 6px rgba(0,0,0,0.3)',
        },
        elevation3: {
          boxShadow: mode === 'light'
            ? '0 3px 9px rgba(0,0,0,0.08)'
            : '0 3px 9px rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
  },
});

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDatabase, setSelectedDatabase] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [helpCenterTab, setHelpCenterTab] = useState(0);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [connectionMenuAnchor, setConnectionMenuAnchor] = useState(null);
  // Theme is managed via PreferencesContext

  // Determine active view from URL path
  const activeView = location.pathname === '/build' ? 'build'
    : location.pathname === '/views' ? 'views'
      : location.pathname === '/stats' ? 'stats'
        : 'database';

  // Color mapping for each view
  const viewColors = {
    database: '#64b5f6', // Soft Blue
    build: '#ba68c8',    // Soft Purple
    views: '#81c784',    // Soft Green
    stats: '#ffb74d'     // Soft Orange
  };

  const currentColor = viewColors[activeView];

  // Create theme based on current mode
  const { preferences, updatePreference } = usePreferences();
  const theme = useMemo(() => {
    return createAppTheme(preferences.theme);
  }, [preferences.theme]);

  const [databases, setDatabases] = useState([]);

  useEffect(() => {
    // Load saved settings or check if we need to show settings
    const savedSettings = localStorage.getItem('couchdb-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setConnectionInfo(settings);
      checkConnection();
      fetchDatabases();
    } else {
      // No saved settings, show the settings modal
      setShowSettings(true);
    }
  }, []);

  const fetchDatabases = async () => {
    try {
      const dbs = await getAllDatabases();
      const filteredDbs = dbs.filter(db => !db.startsWith('_'));
      setDatabases(filteredDbs);
    } catch (err) {
      console.error('Failed to fetch databases:', err);
    }
  };

  // Set data-view attribute for CSS styling
  useEffect(() => {
    document.body.setAttribute('data-view', activeView);
    return () => {
      document.body.removeAttribute('data-view');
    };
  }, [activeView]);

  // Set data-theme attribute for CSS styling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preferences.theme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [preferences.theme]);

  // Set data-density attribute for CSS styling
  useEffect(() => {
    // Get preferences from localStorage on mount
    try {
      const saved = localStorage.getItem('prismix-preferences');
      if (saved) {
        const prefs = JSON.parse(saved);
        document.documentElement.setAttribute('data-density', prefs.density || 'comfortable');
      } else {
        document.documentElement.setAttribute('data-density', 'comfortable');
      }
    } catch (error) {
      document.documentElement.setAttribute('data-density', 'comfortable');
    }

    // Listen for storage changes to sync across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'prismix-preferences' && e.newValue) {
        try {
          const newPrefs = JSON.parse(e.newValue);
          document.documentElement.setAttribute('data-density', newPrefs.density || 'comfortable');
        } catch (error) {
          console.error('Failed to parse preferences:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Keyboard shortcut for API documentation (? key)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K for search (handled internally by search component if we had one, 
      // but here we might want to focus something or open a dialog)

      // ? for Help/API Docs
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setHelpCenterTab(2); // Open to API Reference tab
        setShowHelpCenter(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const checkConnection = async () => {
    setConnectionStatus(null); // Set to checking state
    const isConnected = await testConnection();
    setConnectionStatus(isConnected);
    if (isConnected) {
      fetchDatabases();
    }
  };

  const handleDatabaseSelect = (dbName) => {
    setSelectedDatabase(dbName);
  };

  const handleConnectionChange = (settings) => {
    // Initialize CouchDB with new settings
    initializeCouchDB(settings);
    setConnectionInfo(settings);

    // Reset selected database
    setSelectedDatabase(null);

    // Test the new connection
    checkConnection();
  };

  const handleOpenSettings = () => {
    setShowSettings(true);
  };

  const handleBuild = () => {
    navigate('/build');
  };

  const handleShowDatabase = () => {
    navigate('/');
  };

  const handleShowViews = () => {
    navigate('/views');
  };

  const handleShowStats = () => {
    navigate('/stats');
  };

  const handleThemeChange = (newMode) => {
    updatePreference('theme', newMode);
  };

  const getStatusChip = () => {
    if (connectionStatus === null) {
      return (
        <Chip
          icon={<HourglassEmpty />}
          label="Checking"
          size="small"
          variant="outlined"
          sx={{ borderColor: 'divider', color: 'text.secondary' }}
        />
      );
    }
    if (connectionStatus) {
      return (
        <Chip
          icon={<CheckCircle />}
          label="Connected"
          size="small"
          sx={{
            bgcolor: '#4caf50',
            color: '#ffffff',
            border: '1px solid',
            borderColor: '#4caf50',
            '& .MuiChip-icon': {
              color: '#ffffff',
            }
          }}
        />
      );
    }
    return (
      <Chip
        icon={<Cancel />}
        label="Disconnected"
        size="small"
        variant="outlined"
        sx={{ borderColor: 'error.main', color: 'error.main' }}
      />
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        bgcolor: 'background.default',
        overflow: 'hidden'
      }}>
        {/* Antigravity-Style Layout: Sidebar + Content */}
        <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Left Sidebar Navigation - Antigravity Style */}
          <Box sx={{
            width: 56,
            bgcolor: 'background.paper',
            borderRight: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            py: 1.5,
            gap: 0.5
          }}>
            {/* Logo */}
            < Box sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src="/prismix-logo.png"
                alt="Prismix Logo"
                style={{
                  width: '32px',
                  height: '32px',
                  objectFit: 'contain'
                }}
              />
            </Box >

            {/* Navigation Items */}
            < Box sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              width: '100%',
              px: 0.5
            }}>
              {/* Database - Soft Blue */}
              < Box
                onClick={handleShowDatabase}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.25,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 0,
                  bgcolor: activeView === 'database' ? 'rgba(100, 181, 246, 0.15)' : 'transparent',
                  borderLeft: activeView === 'database' ? '3px solid #64b5f6' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(100, 181, 246, 0.08)'
                  }
                }}
              >
                <Storage sx={{
                  fontSize: 20,
                  color: activeView === 'database' ? '#64b5f6' : 'text.secondary'
                }} />
                <Typography sx={{
                  fontSize: '9px',
                  fontWeight: 500,
                  color: activeView === 'database' ? '#64b5f6' : 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  Data
                </Typography>
              </Box >

              {/* Build - Soft Purple */}
              < Box
                onClick={handleBuild}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.25,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 0,
                  bgcolor: activeView === 'build' ? 'rgba(186, 104, 200, 0.15)' : 'transparent',
                  borderLeft: activeView === 'build' ? '3px solid #ba68c8' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(186, 104, 200, 0.08)'
                  }
                }}
              >
                <Code sx={{
                  fontSize: 20,
                  color: activeView === 'build' ? '#ba68c8' : 'text.secondary'
                }} />
                <Typography sx={{
                  fontSize: '9px',
                  fontWeight: 500,
                  color: activeView === 'build' ? '#ba68c8' : 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  Build
                </Typography>
              </Box >

              {/* Views - Soft Green */}
              < Box
                onClick={handleShowViews}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.25,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 0,
                  bgcolor: activeView === 'views' ? 'rgba(129, 199, 132, 0.15)' : 'transparent',
                  borderLeft: activeView === 'views' ? '3px solid #81c784' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(129, 199, 132, 0.08)'
                  }
                }}
              >
                <Visibility sx={{
                  fontSize: 20,
                  color: activeView === 'views' ? '#81c784' : 'text.secondary'
                }} />
                <Typography sx={{
                  fontSize: '9px',
                  fontWeight: 500,
                  color: activeView === 'views' ? '#81c784' : 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  Views
                </Typography>
              </Box >

              {/* Stats - Soft Orange */}
              <Box
                onClick={handleShowStats}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.25,
                  py: 1,
                  cursor: 'pointer',
                  borderRadius: 0,
                  bgcolor: activeView === 'stats' ? 'rgba(255, 183, 77, 0.15)' : 'transparent',
                  borderLeft: activeView === 'stats' ? '3px solid #ffb74d' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255, 183, 77, 0.08)'
                  }
                }}
              >
                <Assessment sx={{
                  fontSize: 20,
                  color: activeView === 'stats' ? '#ffb74d' : 'text.secondary'
                }} />
                <Typography sx={{
                  fontSize: '9px',
                  fontWeight: 500,
                  color: activeView === 'stats' ? '#ffb74d' : 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px'
                }}>
                  Stats
                </Typography>
              </Box>
            </Box >


            {/* Settings and Help at Bottom */}
            < Box sx={{ flex: 1 }} />

            <ThemeToggle />
            <Tooltip title="Help Center" placement="right">
              <IconButton
                onClick={() => {
                  setHelpCenterTab(0);
                  setShowHelpCenter(true);
                }}
                size="small"
                sx={{
                  color: 'text.secondary',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'primary.main'
                  }
                }}
              >
                <Help sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Settings" placement="right">
              <IconButton
                onClick={handleOpenSettings}
                size="small"
                sx={{
                  color: 'text.secondary',
                  borderRadius: 0,
                  '&:hover': {
                    bgcolor: 'action.hover',
                    color: 'text.primary'
                  }
                }}
              >
                <Settings sx={{ fontSize: 20 }} />
              </IconButton >
            </Tooltip>
          </Box >

          {/* Main Content Area */}
          < Box sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Top Bar - Connection Info */}
            < Box sx={{
              bgcolor: 'background.paper',
              borderBottom: '1px solid',
              borderColor: 'divider',
              px: 3,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              minHeight: 40
            }}>
              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box>
                  <Typography variant="h6" sx={{
                    fontSize: '16px',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    mb: 0.25,
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Prismix
                  </Typography>
                  {/* Breadcrumb Navigation */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography sx={{
                      fontSize: '10px',
                      fontWeight: 400,
                      color: 'text.secondary',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      Query Builder
                    </Typography>
                  </Box>
                </Box>

                {/* Database Dropdown for Data View */}
                {activeView === 'database' && (
                  <Autocomplete
                    options={databases}
                    value={selectedDatabase}
                    onChange={(event, newValue) => {
                      setSelectedDatabase(newValue);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select Database"
                        size="small"
                        sx={{
                          width: 250,
                          '& .MuiOutlinedInput-root': {
                            fontSize: '0.875rem',
                            bgcolor: 'background.default',
                          }
                        }}
                      />
                    )}
                    size="small"
                    sx={{ ml: 2 }}
                  />
                )}
              </Box>

              <Box sx={{ flex: 1 }} />

              {
                connectionInfo && (
                  <>
                    <IconButton
                      onClick={(e) => setConnectionMenuAnchor(e.currentTarget)}
                      size="small"
                      sx={{
                        color: connectionStatus === true ? 'success.main' : connectionStatus === false ? 'error.main' : 'text.secondary',
                        borderRadius: 0,
                        '&:hover': {
                          bgcolor: 'action.hover',
                        }
                      }}
                      title="Connection Status"
                    >
                      <Wifi sx={{ fontSize: 20 }} />
                    </IconButton>

                    <Menu
                      anchorEl={connectionMenuAnchor}
                      open={Boolean(connectionMenuAnchor)}
                      onClose={() => setConnectionMenuAnchor(null)}
                      PaperProps={{
                        sx: {
                          borderRadius: 0,
                          mt: 0.5,
                          minWidth: 200,
                          border: '1px solid',
                          borderColor: 'divider',
                        }
                      }}
                    >
                      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Connected to:
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {connectionInfo.url}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Status:
                          </Typography>
                          {getStatusChip()}
                        </Box>
                      </Box>
                    </Menu>
                  </>
                )
              }



            </Box >

            {/* Content */}
            < Box sx={{
              flex: 1,
              overflow: 'hidden',
              p: 2,
              display: 'flex',
              gap: 2,
            }}>
              <Routes>
                {/* Database View - Default Route */}
                <Route path="/" element={
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0,
                      overflow: 'hidden',
                    }}
                  >
                    {selectedDatabase ? (
                      <DocumentList database={selectedDatabase} />
                    ) : (
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 2 }}>
                        <Storage sx={{ fontSize: 64, color: 'text.disabled' }} />
                        <Typography variant="h6" color="text.secondary">
                          Select a database to view documents
                        </Typography>
                      </Box>
                    )}
                  </Paper>
                } />

                {/* Build View */}
                <Route path="/build" element={
                  <Paper
                    elevation={0}
                    sx={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 0,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <QueryBuilder />
                  </Paper>
                } />

                {/* Views Manager */}
                <Route path="/views" element={
                  <ViewsManager
                    selectedDatabase={selectedDatabase}
                    onDatabaseSelect={handleDatabaseSelect}
                  />
                } />

                {/* Stats Dashboard */}
                <Route path="/stats" element={
                  <StatsDashboard
                    selectedDatabase={selectedDatabase}
                    onDatabaseSelect={handleDatabaseSelect}
                  />
                } />
              </Routes>
            </Box >

            {/* Footer */}
            < Box sx={{
              borderTop: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              px: 3,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: 32
            }}>
              <Typography sx={{
                fontSize: '11px',
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <Box component="span" sx={{ fontWeight: 600 }}>Prismix</Box>
                <Box component="span">v1.0.0</Box>
                <Box component="span" sx={{ mx: 0.5 }}>•</Box>
                <Box component="span">Powered by CouchDB</Box>
              </Typography>
              <Typography sx={{
                fontSize: '11px',
                color: 'text.secondary'
              }}>
                © 2024 Prismix
              </Typography>
            </Box >
          </Box >
        </Box >

        <ConnectionSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onConnectionChange={handleConnectionChange}
          themeMode={preferences.theme}
          onThemeChange={handleThemeChange}
        />

        <HelpCenter
          isOpen={showHelpCenter}
          onClose={() => setShowHelpCenter(false)}
          initialTab={helpCenterTab}
        />

        <OnboardingDialog />
      </Box>
    </ThemeProvider>
  );
}

export default App;
