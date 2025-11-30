import { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  Button,
  TextField,
  InputAdornment,
  Chip
} from '@mui/material';
import { Storage, Refresh, Search, Clear, Add, StorageOutlined } from '@mui/icons-material';
import EmptyState from './EmptyState';
import { getAllDatabases } from '../services/couchdb';

const DatabaseList = ({ onDatabaseSelect, selectedDatabase }) => {
  const [databases, setDatabases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDatabases();
  }, []);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      setError(null);
      const dbs = await getAllDatabases();
      // Filter out system databases if desired
      const filteredDbs = dbs.filter(db => !db.startsWith('_'));
      setDatabases(filteredDbs);
    } catch (err) {
      setError(err.message || 'Failed to fetch databases');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDatabases();
  };

  // Filter databases based on search query
  const filteredDatabases = databases.filter(db =>
    db.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
        <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>
        <Button
          variant="outlined"
          size="small"
          onClick={handleRefresh}
          sx={{
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'text.secondary',
              bgcolor: 'action.hover'
            }
          }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{
        px: 3,
        py: 2,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper'
      }}>
        <Box>
          <Typography
            variant="overline"
            sx={{
              fontSize: '0.7rem',
              fontWeight: 600,
              letterSpacing: '0.5px',
              color: 'text.secondary',
              lineHeight: 1
            }}
          >
            Databases
          </Typography>
          <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 500, mt: 0.25 }}>
            {databases.length}
          </Typography>
        </Box>
        <IconButton
          onClick={handleRefresh}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': {
              bgcolor: 'action.hover',
              color: 'text.primary'
            }
          }}
        >
          <Refresh fontSize="small" />
        </IconButton>
      </Box>

      {/* Search Bar */}
      <Box sx={{ px: 3, pt: 2, pb: 1.5 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search databases..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 18, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClearSearch}
                  edge="end"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  <Clear sx={{ fontSize: 16 }} />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'background.default',
              fontSize: '0.875rem',
              '& fieldset': {
                borderColor: 'divider',
              },
              '&:hover fieldset': {
                borderColor: 'text.secondary',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'text.primary',
              },
            },
          }}
        />
      </Box>

      {/* List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredDatabases.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'No databases match your search' : 'No databases found'}
            </Typography>
          </Box>
        ) : (
          <List dense sx={{ py: 1, px: 1.5 }}>
            {filteredDatabases.map((db) => (
              <ListItem key={db} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  selected={selectedDatabase === db}
                  onClick={() => onDatabaseSelect(db)}
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    borderRadius: 0,
                    minHeight: 44,
                    transition: 'all 0.15s ease',
                    borderLeft: selectedDatabase === db ? '3px solid #64b5f6' : '3px solid transparent',
                    '&.Mui-selected': {
                      bgcolor: 'rgba(100, 181, 246, 0.15)',
                      color: '#64b5f6',
                      '&:hover': {
                        bgcolor: 'rgba(100, 181, 246, 0.25)',
                      },
                      '& .MuiListItemIcon-root': {
                        color: '#64b5f6',
                      },
                      '& .MuiListItemText-primary': {
                        color: '#64b5f6',
                        fontWeight: 600,
                      }
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Storage
                      sx={{
                        fontSize: 18,
                        color: 'text.secondary'
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={db}
                    primaryTypographyProps={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      fontWeight: selectedDatabase === db ? 500 : 400,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default DatabaseList;
