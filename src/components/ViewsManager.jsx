import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Delete,
  ExpandMore,
  Code,
  Visibility,
  Download,
  Storage,
  Refresh,
  ViewList,
  TableChart,
  VisibilityOff,
} from '@mui/icons-material';
import EmptyState from './EmptyState';
import { getAllSavedQueries, deleteSavedQuery, exportQueries, updateSavedQuery } from '../services/savedQueries';
import { executeQuery } from '../services/couchdb';

const ViewsManager = () => {
  const [savedQueries, setSavedQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, queryId: null, queryName: '' });
  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState(null);
  const [viewMode, setViewMode] = useState('json'); // 'json' or 'table'

  useEffect(() => {
    loadSavedQueries();
  }, []);

  const loadSavedQueries = async () => {
    const queries = await getAllSavedQueries();
    setSavedQueries(queries);
    if (queries.length > 0 && !selectedQuery) {
      setSelectedQuery(queries[0]);
    }
  };

  const handleDeleteQuery = async () => {
    try {
      await deleteSavedQuery(deleteDialog.queryId);
      await loadSavedQueries();
      if (selectedQuery?.id === deleteDialog.queryId) {
        setSelectedQuery(null);
      }
      setDeleteDialog({ open: false, queryId: null, queryName: '' });
    } catch (error) {
      console.error('Failed to delete query:', error);
    }
  };

  const handleRefreshQuery = async (query) => {
    setRefreshing(true);
    setRefreshError(null);

    try {
      // Re-execute the query against CouchDB
      const results = await executeQuery(query.database, query.query);

      // Update the query with new results
      await updateSavedQuery(query.id, {
        results: results,
      });

      // Reload the queries list
      await loadSavedQueries();

      // Update the selected query if it's the one being refreshed
      if (selectedQuery?.id === query.id) {
        const updatedQueries = await getAllSavedQueries();
        const updatedQuery = updatedQueries.find(q => q.id === query.id);
        setSelectedQuery(updatedQuery);
      }
    } catch (error) {
      console.error('Failed to refresh query:', error);
      setRefreshError('Failed to refresh query results');
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportQueries = async () => {
    try {
      const blob = await exportQueries();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `couchdb-saved-queries-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export queries:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar - Saved Queries List */}
      <Paper
        elevation={0}
        sx={{
          width: 300,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{
          p: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 500, mb: 0.5 }}>
            Saved Queries
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {savedQueries.length} {savedQueries.length === 1 ? 'query' : 'queries'} saved
          </Typography>
        </Box>

        {savedQueries.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Visibility sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              No saved queries yet
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Execute and save a query from the Build section to see it here
            </Typography>
          </Box>
        ) : (
          <List sx={{ flexGrow: 1, overflow: 'auto', py: 1, px: 1.5 }}>
            {savedQueries.map((query) => (
              <ListItem
                key={query.id}
                disablePadding
                sx={{ mb: 0.5 }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteDialog({ open: true, queryId: query.id, queryName: query.name });
                    }}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'error.main',
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={selectedQuery?.id === query.id}
                  onClick={() => setSelectedQuery(query)}
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    borderRadius: 0.75,
                    '&.Mui-selected': {
                      bgcolor: 'text.primary',
                      color: 'background.paper',
                      '&:hover': {
                        bgcolor: 'text.primary',
                      },
                    },
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                >
                  <ListItemText
                    primary={query.name}
                    secondary={query.database}
                    primaryTypographyProps={{
                      fontSize: '0.875rem',
                      fontWeight: selectedQuery?.id === query.id ? 500 : 400,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      sx: {
                        color: selectedQuery?.id === query.id ? 'background.paper' : 'text.secondary',
                        opacity: selectedQuery?.id === query.id ? 0.8 : 1,
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}

        {savedQueries.length > 0 && (
          <Box sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}>
            <Button
              fullWidth
              size="small"
              startIcon={<Download />}
              onClick={handleExportQueries}
              sx={{
                textTransform: 'none',
                color: 'text.secondary',
                borderColor: 'divider',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'text.secondary',
                },
              }}
              variant="outlined"
            >
              Export All
            </Button>
          </Box>
        )}
      </Paper>

      {/* Main Content - Query Details */}
      {/* The following code block was provided by the user, but it appears to be intended for a different component (ViewsManager)
          and uses variables/functions not defined in this SavedQueries component (e.g., selectedDatabase, fetchDesignDocs, designDocs).
          Applying it directly would cause syntax errors and runtime issues.
          Therefore, it is commented out to maintain the integrity of the current file.
          If this change was intended for the SavedQueries component, please provide the correct context or adaptation.
      */}
      {/*
      if (!selectedDatabase) {
        return (
          <Paper elevation={0} sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
            <EmptyState
              icon={<Storage sx={{ fontSize: 40 }} />}
              title="No Database Selected"
              description="Select a database to manage its views."
              color="primary"
            />
          </Paper>
        );
      }

      return (
        <Box sx={{ display: 'flex', height: '100%', gap: 2 }}>
          <Paper elevation={0} sx={{ width: 300, display: 'flex', flexDirection: 'column', border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
            <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle1" fontWeight={600}>Views</Typography>
              <IconButton size="small" onClick={fetchDesignDocs} disabled={loading}>
                <Refresh fontSize="small" />
              </IconButton>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : designDocs.length === 0 ? (
              <EmptyState
                icon={<VisibilityOff sx={{ fontSize: 32 }} />}
                title="No Views"
                description="No design documents found."
                color="text"
              />
            ) : (
              <List sx={{ overflow: 'auto', flex: 1 }}>
      */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedQuery ? (
          <>
            {/* Header */}
            <Box sx={{
              p: 3,
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
                  {selectedQuery.name}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Refresh />}
                  onClick={() => handleRefreshQuery(selectedQuery)}
                  disabled={refreshing}
                  sx={{
                    textTransform: 'none',
                    borderColor: 'divider',
                    color: 'text.secondary',
                    '&:hover': {
                      bgcolor: 'action.hover',
                      borderColor: 'text.secondary',
                    },
                  }}
                >
                  {refreshing ? 'Refreshing...' : 'Refresh Results'}
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <Chip
                  icon={<Storage />}
                  label={selectedQuery.database}
                  size="small"
                  sx={{
                    bgcolor: 'action.selected',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                <Chip
                  label={`Created: ${formatDate(selectedQuery.createdAt)}`}
                  size="small"
                  sx={{
                    bgcolor: 'action.selected',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
                {selectedQuery.updatedAt && selectedQuery.updatedAt !== selectedQuery.createdAt && (
                  <Chip
                    label={`Updated: ${formatDate(selectedQuery.updatedAt)}`}
                    size="small"
                    sx={{
                      bgcolor: 'action.selected',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                )}
                <Chip
                  label={`${selectedQuery.results?.docs?.length || 0} results`}
                  size="small"
                  sx={{
                    bgcolor: 'action.selected',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </Box>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
              {refreshError && (
                <Alert severity="error" sx={{ mb: 2 }} onClose={() => setRefreshError(null)}>
                  {refreshError}
                </Alert>
              )}

              {/* Query */}
              <Accordion
                defaultExpanded
                elevation={0}
                sx={{
                  mb: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:before': { display: 'none' },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    bgcolor: 'background.paper',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    minHeight: 48,
                    '&.Mui-expanded': {
                      minHeight: 48,
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Code sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                      Query
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Box
                    component="pre"
                    sx={{
                      m: 0,
                      p: 2,
                      bgcolor: 'action.hover',
                      fontSize: '0.8125rem',
                      fontFamily: 'monospace',
                      overflow: 'auto',
                    }}
                  >
                    {JSON.stringify(selectedQuery.query, null, 2)}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Results */}
              <Paper
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box sx={{
                  p: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                    Results ({selectedQuery.results?.docs?.length || 0} documents)
                  </Typography>

                  {selectedQuery.results?.docs && selectedQuery.results.docs.length > 0 && (
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => newMode && setViewMode(newMode)}
                      size="small"
                      sx={{
                        '& .MuiToggleButton-root': {
                          py: 0.5,
                          px: 1.5,
                          textTransform: 'none',
                          fontSize: '0.8125rem',
                          border: '1px solid',
                          borderColor: 'divider',
                          '&.Mui-selected': {
                            bgcolor: 'text.primary',
                            color: 'background.paper',
                            '&:hover': {
                              bgcolor: 'text.primary',
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="json">
                        <ViewList sx={{ fontSize: 16, mr: 0.5 }} />
                        JSON
                      </ToggleButton>
                      <ToggleButton value="table">
                        <TableChart sx={{ fontSize: 16, mr: 0.5 }} />
                        Table
                      </ToggleButton>
                    </ToggleButtonGroup>
                  )}
                </Box>

                {selectedQuery.results?.docs && selectedQuery.results.docs.length > 0 ? (
                  viewMode === 'json' ? (
                    // JSON View
                    <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
                      {selectedQuery.results.docs.map((doc, index) => (
                        <Accordion
                          key={doc._id || index}
                          elevation={0}
                          sx={{
                            '&:before': { display: 'none' },
                            borderBottom: index < selectedQuery.results.docs.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{
                              minHeight: 52,
                              '&.Mui-expanded': {
                                minHeight: 52,
                              },
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                              <Typography
                                sx={{
                                  fontFamily: 'monospace',
                                  fontSize: '0.875rem',
                                  fontWeight: 500,
                                  flex: 1,
                                  wordBreak: 'break-all',
                                }}
                              >
                                {doc._id || `Document ${index + 1}`}
                              </Typography>
                              <Chip
                                label={`#${index + 1}`}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.7rem',
                                  bgcolor: 'action.selected',
                                }}
                              />
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <Box
                              component="pre"
                              sx={{
                                m: 0,
                                p: 2,
                                bgcolor: 'action.hover',
                                fontSize: '0.8125rem',
                                fontFamily: 'monospace',
                                overflow: 'auto',
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {JSON.stringify(doc, null, 2)}
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </Box>
                  ) : (
                    // Table View
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table stickyHeader size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell
                              sx={{
                                bgcolor: 'background.paper',
                                fontWeight: 600,
                                borderBottom: '2px solid',
                                borderColor: 'divider',
                                width: 60,
                              }}
                            >
                              #
                            </TableCell>
                            {selectedQuery.results.docs.length > 0 &&
                              Object.keys(selectedQuery.results.docs[0]).map((key) => (
                                <TableCell
                                  key={key}
                                  sx={{
                                    bgcolor: 'background.paper',
                                    fontWeight: 600,
                                    borderBottom: '2px solid',
                                    borderColor: 'divider',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8125rem',
                                  }}
                                >
                                  {key}
                                </TableCell>
                              ))
                            }
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedQuery.results.docs.map((doc, index) => (
                            <TableRow
                              key={doc._id || index}
                              sx={{
                                '&:hover': {
                                  bgcolor: 'action.hover',
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  fontWeight: 500,
                                  color: 'text.secondary',
                                  fontSize: '0.8125rem',
                                }}
                              >
                                {index + 1}
                              </TableCell>
                              {Object.keys(selectedQuery.results.docs[0]).map((key) => (
                                <TableCell
                                  key={key}
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontSize: '0.8125rem',
                                    maxWidth: 300,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {typeof doc[key] === 'object'
                                    ? JSON.stringify(doc[key])
                                    : String(doc[key] ?? '')}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No results
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Box>
          </>
        ) : (
          <Box sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
          }}>
            <Box sx={{ textAlign: 'center' }}>
              <Visibility sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Select a saved query
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Choose a query from the list to view its details and results
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, queryId: null, queryName: '' })}>
        <DialogTitle>Delete Saved Query?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{deleteDialog.queryName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteDialog({ open: false, queryId: null, queryName: '' })} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteQuery}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewsManager;
