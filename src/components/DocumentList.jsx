import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  IconButton,
  CircularProgress,
  Chip,
  Tooltip,
  Button,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Description, Edit, Delete, Add, Refresh, DescriptionOutlined, Storage, ExpandMore, ContentCopy, CompareArrows } from '@mui/icons-material';
import EmptyState from './EmptyState';
import FilterPanel from './FilterPanel';
import SortControls from './SortControls';
import EnhancedPagination from './EnhancedPagination';
import JsonEditor from './JsonEditor';
import DocumentComparison from './DocumentComparison';
import { getAllDocuments } from '../services/couchdb';
import { extractFields, applyFilters } from '../utils/filterUtils';
import { applySorting, detectFieldTypeFromDocuments } from '../utils/sortUtils';

const DocumentList = ({ database }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const [copiedDocId, setCopiedDocId] = useState(null);
  const [compareDialogOpen, setCompareDialogOpen] = useState(false);
  const [filters, setFilters] = useState(() => {
    try {
      const saved = localStorage.getItem(`prismix-filters-${database}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [sortConfig, setSortConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(`prismix-sort-${database}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [filterLogic, setFilterLogic] = useState('AND');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    try {
      const saved = localStorage.getItem('prismix-items-per-page');
      return saved ? parseInt(saved) : 25;
    } catch {
      return 25;
    }
  });

  // Load filter/sort state when database changes
  useEffect(() => {
    if (database) {
      try {
        const savedFilters = localStorage.getItem(`prismix-filters-${database}`);
        const savedSort = localStorage.getItem(`prismix-sort-${database}`);
        if (savedFilters) setFilters(JSON.parse(savedFilters));
        if (savedSort) setSortConfig(JSON.parse(savedSort));
      } catch (error) {
        console.error('Failed to load saved state:', error);
      }
    }
  }, [database]);

  // Save filter state to localStorage
  useEffect(() => {
    if (database && filters.length >= 0) {
      try {
        localStorage.setItem(`prismix-filters-${database}`, JSON.stringify(filters));
      } catch (error) {
        console.error('Failed to save filters:', error);
      }
    }
  }, [filters, database]);

  // Save sort state to localStorage
  useEffect(() => {
    if (database && sortConfig.length >= 0) {
      try {
        localStorage.setItem(`prismix-sort-${database}`, JSON.stringify(sortConfig));
      } catch (error) {
        console.error('Failed to save sort config:', error);
      }
    }
  }, [sortConfig, database]);

  // Save items per page to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('prismix-items-per-page', String(itemsPerPage));
    } catch (error) {
      console.error('Failed to save items per page:', error);
    }
  }, [itemsPerPage]);

  // Reset to page 1 when filters or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filters, sortConfig]);

  useEffect(() => {
    if (database) {
      fetchDocuments();
    }
  }, [database]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllDocuments(database);
      setDocuments(data.rows || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // Extract available fields from documents
  const availableFields = useMemo(() => {
    if (documents.length === 0) return [];
    return extractFields(documents);
  }, [documents]);

  // Apply filters and sorting
  const processedDocuments = useMemo(() => {
    let result = documents;

    // Apply filters
    if (filters.length > 0) {
      result = applyFilters(result, filters, filterLogic);
    }

    // Apply sorting
    if (sortConfig.length > 0) {
      // Auto-detect field types for sorting
      const sortConfigWithTypes = sortConfig.map(sort => ({
        ...sort,
        type: sort.type || detectFieldTypeFromDocuments(documents, sort.field)
      }));
      result = applySorting(result, sortConfigWithTypes);
    }

    return result;
  }, [documents, filters, sortConfig, filterLogic]);

  // Apply pagination
  const paginatedDocuments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return processedDocuments.slice(startIndex, endIndex);
  }, [processedDocuments, currentPage, itemsPerPage]);

  const handleAccordionChange = (docId) => (event, isExpanded) => {
    setExpandedDoc(isExpanded ? docId : null);
  };

  const handleRefresh = () => {
    fetchDocuments();
  };

  const handleClearFilters = () => {
    setFilters([]);
  };

  const handleClearSort = () => {
    setSortConfig([]);
  };

  const handleCopyDocument = async (doc, docId, event) => {
    event.stopPropagation(); // Prevent accordion from toggling
    try {
      await navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
      setCopiedDocId(docId);
      setTimeout(() => setCopiedDocId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!database) {
    return (
      <EmptyState
        icon={<Storage sx={{ fontSize: 40 }} />}
        title="No Database Selected"
        description="Select a database from the sidebar to view its documents."
        color="primary"
      />
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
        <CircularProgress />
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
            {database}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
            <Typography variant="h6" sx={{ fontSize: '1.25rem', fontWeight: 500 }}>
              {processedDocuments.length} {processedDocuments.length === 1 ? 'Document' : 'Documents'}
            </Typography>
            {filters.length > 0 && (
              <Chip
                label={`${filters.length} filter${filters.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
            {sortConfig.length > 0 && (
              <Chip
                label={`${sortConfig.length} sort${sortConfig.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{ height: 20, fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<CompareArrows />}
            onClick={() => setCompareDialogOpen(true)}
            sx={{
              textTransform: 'none',
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'text.primary',
                color: 'text.primary',
                bgcolor: 'action.hover'
              }
            }}
          >
            Compare
          </Button>
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
      </Box>

      {/* Filter and Sort Controls */}
      <Box sx={{ px: 2, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          availableFields={availableFields}
          onClear={handleClearFilters}
        />
        <SortControls
          sortConfig={sortConfig}
          onSortChange={setSortConfig}
          availableFields={availableFields}
          onClear={handleClearSort}
        />
      </Box>

      {/* Documents */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {processedDocuments.length === 0 ? (
          <EmptyState
            icon={<DescriptionOutlined sx={{ fontSize: 40 }} />}
            title={filters.length > 0 ? "No Matching Documents" : "No Documents Found"}
            description={filters.length > 0 ? "Try adjusting your filters" : "This database is empty"}
            color="primary"
          />
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {paginatedDocuments.map((row) => (
              <Accordion
                key={row.id}
                expanded={expandedDoc === row.id}
                onChange={handleAccordionChange(row.id)}
                elevation={0}
                disableGutters
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  '&:before': {
                    display: 'none',
                  },
                  '&.Mui-expanded': {
                    margin: 0,
                  },
                  overflow: 'hidden'
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore sx={{ color: 'text.secondary', fontSize: 20 }} />}
                  sx={{
                    minHeight: 52,
                    px: 2.5,
                    bgcolor: 'background.paper',
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                    '&.Mui-expanded': {
                      minHeight: 52,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: '100%' }}>
                    <Description sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography
                      fontFamily="monospace"
                      fontSize="0.875rem"
                      fontWeight={500}
                      color="text.primary"
                      sx={{
                        wordBreak: 'break-all',
                        flex: 1
                      }}
                    >
                      {row.id}
                    </Typography>
                    <Tooltip title={copiedDocId === row.id ? 'Copied!' : 'Copy document'}>
                      <IconButton
                        component="div"
                        role="button"
                        size="small"
                        onClick={(e) => handleCopyDocument(row.doc, row.id, e)}
                        sx={{
                          color: copiedDocId === row.id ? 'success.main' : 'text.secondary',
                          '&:hover': { bgcolor: 'action.hover' },
                        }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  {row.doc && (
                    <Box sx={{ p: 2 }}>
                      <JsonEditor
                        value={row.doc}
                        readOnly={true}
                        height="400px"
                        theme={document.documentElement.getAttribute('data-theme') || 'light'}
                        showToolbar={true}
                      />
                    </Box>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {processedDocuments.length > 0 && (
          <EnhancedPagination
            totalItems={processedDocuments.length}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        )}
      </Box>
      {/* Document Comparison Dialog */}
      <DocumentComparison
        open={compareDialogOpen}
        onClose={() => setCompareDialogOpen(false)}
        documents={documents}
      />
    </Box>
  );
};

export default DocumentList;
