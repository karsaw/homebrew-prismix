import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    IconButton,
    TextField,
    Chip,
    Alert,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Checkbox,
    Breadcrumbs,
    Link,
    ToggleButton,
    ToggleButtonGroup,
    Fab,
} from '@mui/material';
import {
    Add,
    PlayArrow,
    Storage,
    Settings,
    Download,
    Visibility,
    ChevronLeft,
    ChevronRight,
    TrendingFlat,
    Code,
    ViewQuilt,
    Check,
    AutoAwesome,
} from '@mui/icons-material';
import EmptyState from './EmptyState';
import JsonEditor from './JsonEditor';
import AiQueryDialog from './AiQueryDialog';
import { getAllDatabases, getDatabaseFields, executeQuery } from '../services/couchdb';
import { saveQuery } from '../services/savedQueries';

const OPERATORS = [
    { value: '$eq', label: 'equals' },
    { value: '$ne', label: 'not equals' },
    { value: '$gt', label: 'greater than' },
    { value: '$gte', label: 'greater than or equal' },
    { value: '$lt', label: 'less than' },
    { value: '$lte', label: 'less than or equal' },
    { value: '$in', label: 'in (comma separated)' },
    { value: '$nin', label: 'not in (comma separated)' },
    { value: '$all', label: 'all (comma separated)' },
    { value: '$size', label: 'size (array length)' },
    { value: '$mod', label: 'modulo (divisor, remainder)' },
    { value: '$regex', label: 'regex' },
    { value: '$exists', label: 'exists (true/false)' },
    { value: '$type', label: 'type' },
];

// Node Card Component
const QueryNode = ({ title, children, color = '#2196f3', showArrow = true }) => (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Paper
            elevation={2}
            sx={{
                p: 3,
                border: 'none',
                borderRadius: 4,
                bgcolor: '#ffffff',
                minWidth: 280,
                maxWidth: 320,
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                '&:hover': {
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    transform: 'translateY(-4px)',
                },
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: color,
                        boxShadow: `0 0 0 3px ${color}20`,
                    }}
                />
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        fontSize: '0.75rem',
                        letterSpacing: '1.2px',
                        color: color,
                    }}
                >
                    {title}
                </Typography>
            </Box>
            {children}
        </Paper>

        {/* Straight Gray Arrow */}
        {showArrow && (
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    width: 60,
                    height: 2,
                    bgcolor: '#9e9e9e',
                    opacity: 0.4,
                    position: 'relative',
                    mx: 2,
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        right: -8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 0,
                        height: 0,
                        borderTop: '6px solid transparent',
                        borderBottom: '6px solid transparent',
                        borderLeft: '10px solid #9e9e9e',
                        opacity: 0.6,
                    },
                }}
            />
        )}
    </Box>
);

const QueryBuilder = () => {
    const [databases, setDatabases] = useState([]);
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [availableFields, setAvailableFields] = useState([]);
    const [selectedFields, setSelectedFields] = useState([]);
    const [conditions, setConditions] = useState([
        { field: '', operator: '$eq', value: '' }
    ]);
    const [orderByField, setOrderByField] = useState('');
    const [orderByDirection, setOrderByDirection] = useState('ASCENDING');
    const [limit, setLimit] = useState(25);
    const [noLimit, setNoLimit] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [queryResults, setQueryResults] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastRunTime, setLastRunTime] = useState(null);
    const [viewMode, setViewMode] = useState('json'); // 'json' or 'table'
    const [mode, setMode] = useState('visual'); // 'visual' or 'code'
    const [manualQuery, setManualQuery] = useState('{}');
    const [jsonValid, setJsonValid] = useState(true);
    const [jsonErrors, setJsonErrors] = useState([]);
    const [aiDialogOpen, setAiDialogOpen] = useState(false);

    useEffect(() => {
        fetchDatabases();
    }, []);

    useEffect(() => {
        if (selectedDatabase) {
            fetchDatabaseFields();
        } else {
            setAvailableFields([]);
            setSelectedFields([]);
        }
    }, [selectedDatabase]);

    const fetchDatabases = async () => {
        try {
            const dbs = await getAllDatabases();
            const filteredDbs = dbs.filter(db => !db.startsWith('_'));
            setDatabases(filteredDbs);
        } catch (err) {
            setError('Failed to load databases');
        }
    };

    const fetchDatabaseFields = async () => {
        try {
            const fields = await getDatabaseFields(selectedDatabase);
            setAvailableFields(fields);
            const commonFields = ['name', 'email', '_id'];
            const autoSelect = fields.filter(f => commonFields.includes(f.toLowerCase()));
            setSelectedFields(autoSelect);
        } catch (err) {
            console.error('Failed to load fields:', err);
            setAvailableFields([]);
        }
    };

    const handleFieldToggle = (field) => {
        setSelectedFields(prev =>
            prev.includes(field)
                ? prev.filter(f => f !== field)
                : [...prev, field]
        );
    };

    const handleSelectAll = () => {
        setSelectedFields([...availableFields]);
    };

    const handleDeselectAll = () => {
        setSelectedFields([]);
    };

    const syntaxHighlightJSON = (json) => {
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, (match) => {
            let cls = 'json-number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'json-key';
                } else {
                    cls = 'json-string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'json-boolean';
            } else if (/null/.test(match)) {
                cls = 'json-null';
            }
            return `<span class="${cls}">${match}</span>`;
        });
    };

    const handleAddCondition = () => {
        setConditions([...conditions, { field: '', operator: '$eq', value: '' }]);
    };

    const handleConditionChange = (index, key, value) => {
        const newConditions = [...conditions];
        newConditions[index][key] = value;
        setConditions(newConditions);
    };

    const buildQuery = () => {
        const selector = {};

        conditions.forEach(condition => {
            if (condition.field && condition.value !== '') {
                if (condition.operator === '$eq') {
                    selector[condition.field] = condition.value;
                } else if (condition.operator === '$exists') {
                    selector[condition.field] = { [condition.operator]: condition.value.toLowerCase() === 'true' };
                } else if (['$in', '$nin', '$all'].includes(condition.operator)) {
                    const values = condition.value.split(',').map(v => {
                        const trimmed = v.trim();
                        return isNaN(trimmed) ? trimmed : Number(trimmed);
                    });
                    selector[condition.field] = { [condition.operator]: values };
                } else if (condition.operator === '$mod') {
                    const values = condition.value.split(',').map(v => parseInt(v.trim(), 10));
                    if (values.length === 2) {
                        selector[condition.field] = { [condition.operator]: values };
                    }
                } else if (condition.operator === '$size') {
                    selector[condition.field] = { [condition.operator]: parseInt(condition.value, 10) };
                } else {
                    const numValue = Number(condition.value);
                    const finalValue = isNaN(numValue) ? condition.value : numValue;
                    selector[condition.field] = { [condition.operator]: finalValue };
                }
            }
        });

        const query = {
            selector: Object.keys(selector).length > 0 ? selector : {},
            limit: noLimit ? 1000000 : parseInt(limit),
        };

        if (selectedFields.length > 0) {
            query.fields = selectedFields;
        }

        if (orderByField) {
            query.sort = [{ [orderByField]: orderByDirection.toLowerCase() === 'ascending' ? 'asc' : 'desc' }];
        }

        return query;
    };

    const handleModeChange = (event, newMode) => {
        if (newMode !== null) {
            if (newMode === 'code') {
                const query = buildQuery();
                setManualQuery(JSON.stringify(query, null, 2));
                setJsonValid(true);
                setJsonErrors([]);
            }
            setMode(newMode);
        }
    };

    const handleJsonValidate = (isValid, errors) => {
        setJsonValid(isValid);
        setJsonErrors(errors);
    };

    const handleExecuteQuery = async () => {
        if (!selectedDatabase) {
            setError('Please select a database');
            return;
        }

        if (mode === 'code' && !jsonValid) {
            setError('Please fix JSON errors before running the query');
            return;
        }

        setLoading(true);
        setError(null);
        setQueryResults(null);
        setCurrentPage(1);

        try {
            let query;
            if (mode === 'code') {
                query = JSON.parse(manualQuery);
            } else {
                query = buildQuery();
            }

            const results = await executeQuery(selectedDatabase, query);
            setQueryResults(results);
            setLastRunTime('Just now');
        } catch (err) {
            setError(err.message || 'Failed to execute query');
            setQueryResults(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveQuery = async () => {
        if (!selectedDatabase || !queryResults) {
            setError('Please execute a query first');
            return;
        }

        if (mode === 'code' && !jsonValid) {
            setError('Please fix JSON errors before saving');
            return;
        }

        const queryName = prompt('Enter a name for this query:');
        if (!queryName) return;

        try {
            let query;
            if (mode === 'code') {
                query = JSON.parse(manualQuery);
            } else {
                query = buildQuery();
            }

            await saveQuery({
                name: queryName,
                database: selectedDatabase,
                query: query,
                results: queryResults,
            });
            alert('Query saved successfully!');
        } catch (err) {
            setError('Failed to save query: ' + err.message);
        }
    };

    const handleDownloadJSON = () => {
        if (!queryResults) return;

        const dataStr = JSON.stringify(queryResults.docs, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${selectedDatabase}_query_results.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const handleAiGenerate = (generatedQuery) => {
        setManualQuery(JSON.stringify(generatedQuery, null, 2));
        setMode('code');
        setJsonValid(true);
        setJsonErrors([]);
    };

    const totalResults = queryResults?.docs?.length || 0;
    const resultsPerPage = 5;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = Math.min(startIndex + resultsPerPage, totalResults);
    const paginatedDocs = queryResults?.docs?.slice(startIndex, endIndex) || [];

    return (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 0.5 }}>
                        Visual Query Builder
                    </Typography>
                    <Breadcrumbs separator="›" sx={{ fontSize: '0.8125rem' }}>
                        <Link underline="hover" color="text.secondary" sx={{ cursor: 'pointer' }}>Home</Link>
                        {selectedDatabase && <Link underline="hover" color="text.secondary" sx={{ cursor: 'pointer' }}>{selectedDatabase}</Link>}
                        <Typography color="primary" sx={{ fontSize: '0.8125rem', fontWeight: 500 }}>Query Builder</Typography>
                    </Breadcrumbs>
                </Box>

                <ToggleButtonGroup
                    value={mode}
                    exclusive
                    onChange={handleModeChange}
                    size="small"
                    sx={{ height: 32 }}
                >
                    <ToggleButton value="visual" sx={{ px: 2, gap: 1 }}>
                        <ViewQuilt fontSize="small" />
                        Visual
                    </ToggleButton>
                    <ToggleButton value="code" sx={{ px: 2, gap: 1 }}>
                        <Code fontSize="small" />
                        Code
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <AiQueryDialog
                open={aiDialogOpen}
                onClose={() => setAiDialogOpen(false)}
                onGenerate={handleAiGenerate}
                schema={availableFields}
            />

            {/* Floating AI Button */}
            <Fab
                color="primary"
                onClick={() => setAiDialogOpen(true)}
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
                    color: '#ffffff',
                    width: 56,
                    height: 56,
                    boxShadow: '0 4px 20px rgba(156, 39, 176, 0.4)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #7b1fa2 0%, #6a1b9a 100%)',
                        boxShadow: '0 6px 28px rgba(156, 39, 176, 0.5)',
                        transform: 'scale(1.05)'
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '@keyframes sparkle': {
                        '0%, 100%': { transform: 'scale(1) rotate(0deg)' },
                        '50%': { transform: 'scale(1.1) rotate(5deg)' }
                    },
                    animation: 'sparkle 2s ease-in-out infinite'
                }}
            >
                <AutoAwesome sx={{ fontSize: '1.5rem' }} />
            </Fab>

            {/* Query Builder Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

                <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
                    {mode === 'visual' ? (
                        /* Visual Mode Content */
                        <Box sx={{ display: 'flex', alignItems: 'center', overflowX: 'auto', pb: 2 }}>
                            {/* FROM Node - First node with database selection */}
                            <QueryNode title="FROM" color="#2196f3">
                                <FormControl fullWidth size="small">
                                    <InputLabel>Select Database</InputLabel>
                                    <Select
                                        value={selectedDatabase}
                                        label="Select Database"
                                        onChange={(e) => setSelectedDatabase(e.target.value)}
                                        displayEmpty
                                        startAdornment={<Storage sx={{ fontSize: 18, mr: 1, color: '#2196f3' }} />}
                                        sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}
                                    >
                                        <MenuItem value="" disabled>
                                            <em>Choose a database</em>
                                        </MenuItem>
                                        {databases.map((db) => (
                                            <MenuItem key={db} value={db}>{db}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </QueryNode>

                            {selectedDatabase && (
                                <>
                                    {/* SELECT Node */}
                                    <QueryNode title="SELECT" color="#9c27b0">
                                        <Box sx={{ display: 'flex', gap: 0.5, mb: 1.5 }}>
                                            <Button
                                                size="small"
                                                onClick={handleSelectAll}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem',
                                                    minWidth: 'auto',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    color: '#9c27b0',
                                                    borderColor: '#9c27b0',
                                                }}
                                                variant="outlined"
                                            >
                                                Select All
                                            </Button>
                                            <Button
                                                size="small"
                                                onClick={handleDeselectAll}
                                                sx={{
                                                    textTransform: 'none',
                                                    fontSize: '0.75rem',
                                                    minWidth: 'auto',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    color: 'text.secondary',
                                                    borderColor: 'divider',
                                                }}
                                                variant="outlined"
                                            >
                                                Clear
                                            </Button>
                                        </Box>
                                        <Box sx={{ maxHeight: 200, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, bgcolor: '#ffffff' }}>
                                            {availableFields.length === 0 ? (
                                                <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', textAlign: 'center', py: 2 }}>
                                                    No fields available
                                                </Typography>
                                            ) : (
                                                availableFields.map((field) => (
                                                    <Box key={field} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 0.5, '&:hover': { bgcolor: 'background.paper', borderRadius: 0.5 } }}>
                                                        <Checkbox checked={selectedFields.includes(field)} size="small" onChange={() => handleFieldToggle(field)} sx={{ p: 0 }} />
                                                        <Typography sx={{ fontSize: '0.875rem', fontFamily: 'monospace', flex: 1 }}>{field}</Typography>
                                                    </Box>
                                                ))
                                            )}
                                        </Box>
                                    </QueryNode>

                                    {/* WHERE Node */}
                                    <QueryNode title="WHERE" color="#ff9800">
                                        {conditions.map((condition, index) => (
                                            <Box key={index} sx={{ mb: index < conditions.length - 1 ? 2 : 0 }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <FormControl size="small">
                                                        <InputLabel>Field</InputLabel>
                                                        <Select value={condition.field} label="Field" onChange={(e) => handleConditionChange(index, 'field', e.target.value)} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}>
                                                            {availableFields.map((field) => (
                                                                <MenuItem key={field} value={field}>{field}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>

                                                    <FormControl size="small">
                                                        <InputLabel>Operator</InputLabel>
                                                        <Select value={condition.operator} label="Operator" onChange={(e) => handleConditionChange(index, 'operator', e.target.value)} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}>
                                                            {OPERATORS.map((op) => (
                                                                <MenuItem key={op.value} value={op.value}>{op.label}</MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>

                                                    <TextField size="small" label="Value" value={condition.value} onChange={(e) => handleConditionChange(index, 'value', e.target.value)} sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'divider' } } }} />
                                                </Box>

                                                {index < conditions.length - 1 && (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 1 }}>
                                                        <Chip label="AND" size="small" sx={{ bgcolor: 'action.selected', fontWeight: 600, fontSize: '0.7rem' }} />
                                                    </Box>
                                                )}
                                            </Box>
                                        ))}

                                        <Button size="small" startIcon={<Add />} onClick={handleAddCondition} sx={{ textTransform: 'none', color: '#ff9800', mt: 2, fontSize: '0.8125rem' }}>
                                            Add Condition
                                        </Button>
                                    </QueryNode>

                                    {/* ORDER BY Node */}
                                    <QueryNode title="ORDER BY" color="#4caf50">
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <FormControl size="small">
                                                <InputLabel>Field</InputLabel>
                                                <Select value={orderByField} label="Field" onChange={(e) => setOrderByField(e.target.value)} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}>
                                                    <MenuItem value=""><em>None</em></MenuItem>
                                                    {availableFields.map((field) => (
                                                        <MenuItem key={field} value={field}>{field}</MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>

                                            <FormControl size="small">
                                                <InputLabel>Direction</InputLabel>
                                                <Select value={orderByDirection} label="Direction" onChange={(e) => setOrderByDirection(e.target.value)} sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'divider' } }}>
                                                    <MenuItem value="ASCENDING">ASCENDING</MenuItem>
                                                    <MenuItem value="DESCENDING">DESCENDING</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Box>
                                    </QueryNode>

                                    {/* LIMIT Node */}
                                    <QueryNode title="LIMIT" color="#607d8b" showArrow={false}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                            <TextField
                                                size="small"
                                                label="Limit"
                                                type="number"
                                                value={limit}
                                                onChange={(e) => setLimit(e.target.value)}
                                                disabled={noLimit}
                                                sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: 'divider' } } }}
                                            />
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Checkbox
                                                    checked={noLimit}
                                                    onChange={(e) => setNoLimit(e.target.checked)}
                                                    size="small"
                                                    sx={{ p: 0.5 }}
                                                />
                                                <Typography variant="body2" color="text.secondary">No Limit</Typography>
                                            </Box>
                                        </Box>
                                    </QueryNode>
                                </>
                            )}
                        </Box>
                    ) : (
                        /* Code Mode Content */
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Typography variant="subtitle2" color="text.secondary">
                                    Edit Mango Query JSON
                                </Typography>
                                {jsonValid ? (
                                    <Chip
                                        label="Valid JSON"
                                        color="success"
                                        size="small"
                                        variant="outlined"
                                        icon={<Check fontSize="small" />}
                                    />
                                ) : (
                                    <Chip
                                        label="Invalid JSON"
                                        color="error"
                                        size="small"
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            {!jsonValid && jsonErrors.length > 0 && (
                                <Alert severity="error" sx={{ py: 0, px: 2 }}>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                        {jsonErrors[0]}
                                    </Typography>
                                </Alert>
                            )}

                            <Paper elevation={0} sx={{ p: 0, border: '1px solid', borderColor: jsonValid ? 'divider' : 'error.main', borderRadius: 2, height: 400, overflow: 'hidden' }}>
                                <JsonEditor
                                    value={manualQuery}
                                    onChange={setManualQuery}
                                    onValidate={handleJsonValidate}
                                    height="100%"
                                />
                            </Paper>
                        </Box>
                    )}

                    {!selectedDatabase && mode === 'visual' && (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                            <Storage sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                Select a Database
                            </Typography>
                            <Typography variant="body2" color="text.disabled">
                                Choose a database from the FROM node above to start building your query
                            </Typography>
                        </Box>
                    )}

                    {selectedDatabase && (
                        <>
                            {/* Action Buttons */}
                            <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 3 }}>
                                <Button variant="outlined" onClick={handleSaveQuery} disabled={!queryResults || (mode === 'code' && !jsonValid)} sx={{ textTransform: 'none', borderColor: 'divider', color: 'text.primary', px: 3, '&:hover': { borderColor: 'text.secondary', bgcolor: 'action.hover' } }}>
                                    Save Query
                                </Button>

                                <Button variant="contained" startIcon={<PlayArrow />} onClick={handleExecuteQuery} disabled={loading || (mode === 'code' && !jsonValid)} sx={{ textTransform: 'none', bgcolor: '#2196f3', px: 3, '&:hover': { bgcolor: '#1976d2' } }}>
                                    {loading ? 'Running...' : 'Run Query'}
                                </Button>
                            </Box>

                            {/* Results Section */}
                            {queryResults && (
                                <Paper elevation={0} sx={{ mt: 4, border: '2px solid', borderColor: '#f44336', borderRadius: 2 }}>
                                    <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#f44336' }} />
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', color: '#f44336' }}>
                                                    RESULTS
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: '0.875rem', mb: 0.25 }}>
                                                Query Results ({totalResults} document{totalResults !== 1 ? 's' : ''} found)
                                            </Typography>
                                            {lastRunTime && (
                                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'success.main' }} />
                                                    Last run: {lastRunTime}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Box sx={{ display: 'flex', gap: 0.5, mr: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 0.5 }}>
                                                <Button
                                                    size="small"
                                                    onClick={() => setViewMode('json')}
                                                    sx={{
                                                        textTransform: 'none',
                                                        minWidth: 'auto',
                                                        px: 1.5,
                                                        py: 0.5,
                                                        fontSize: '0.75rem',
                                                        bgcolor: viewMode === 'json' ? 'primary.main' : 'transparent',
                                                        color: viewMode === 'json' ? 'white' : 'text.secondary',
                                                        '&:hover': {
                                                            bgcolor: viewMode === 'json' ? 'primary.dark' : 'action.hover',
                                                        },
                                                    }}
                                                >
                                                    JSON
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => setViewMode('table')}
                                                    sx={{
                                                        textTransform: 'none',
                                                        minWidth: 'auto',
                                                        px: 1.5,
                                                        py: 0.5,
                                                        fontSize: '0.75rem',
                                                        bgcolor: viewMode === 'table' ? 'primary.main' : 'transparent',
                                                        color: viewMode === 'table' ? 'white' : 'text.secondary',
                                                        '&:hover': {
                                                            bgcolor: viewMode === 'table' ? 'primary.dark' : 'action.hover',
                                                        },
                                                    }}
                                                >
                                                    Table
                                                </Button>
                                            </Box>
                                            <Button size="small" startIcon={<Download />} onClick={handleDownloadJSON} sx={{ textTransform: 'none', color: 'text.secondary', borderColor: 'divider' }} variant="outlined">
                                                Download
                                            </Button>
                                        </Box>
                                    </Box>

                                    <Box sx={{ p: 2, bgcolor: '#ffffff', maxHeight: 400, overflow: 'auto', borderRadius: 2 }}>
                                        {viewMode === 'json' ? (
                                            <Box
                                                component="pre"
                                                sx={{
                                                    m: 0,
                                                    fontFamily: 'Monaco, Menlo, "Courier New", monospace',
                                                    fontSize: '0.8125rem',
                                                    lineHeight: 1.6,
                                                    whiteSpace: 'pre-wrap',
                                                    wordBreak: 'break-word',
                                                    '& .json-key': { color: '#881391' },
                                                    '& .json-string': { color: '#1A1AA6' },
                                                    '& .json-number': { color: '#1C00CF' },
                                                    '& .json-boolean': { color: '#0D22FF' },
                                                    '& .json-null': { color: '#808080' },
                                                }}
                                                dangerouslySetInnerHTML={{
                                                    __html: syntaxHighlightJSON(JSON.stringify(paginatedDocs, null, 2))
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{ overflow: 'auto' }}>
                                                {paginatedDocs.length > 0 && (
                                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                                        <thead>
                                                            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                                                                {Object.keys(paginatedDocs[0]).map((key) => (
                                                                    <th key={key} style={{ textAlign: 'left', padding: '12px 16px', fontWeight: 600, color: '#666', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                                        {key}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {paginatedDocs.map((doc, idx) => (
                                                                <tr key={idx} style={{ borderBottom: '1px solid #f0f0f0', transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                                    {Object.entries(doc).map(([key, value]) => (
                                                                        <td key={key} style={{ padding: '12px 16px', color: '#333', fontFamily: 'Monaco, Menlo, monospace' }}>
                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                        </td>
                                                                    ))}
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                )}
                                            </Box>
                                        )}
                                    </Box>

                                    {totalPages > 1 && (
                                        <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                Page {currentPage} of {totalPages}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <IconButton size="small" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} sx={{ border: '1px solid', borderColor: 'divider' }}>
                                                    <ChevronLeft fontSize="small" />
                                                </IconButton>
                                                <IconButton size="small" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} sx={{ border: '1px solid', borderColor: 'divider' }}>
                                                    <ChevronRight fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        </Box>
                                    )}
                                </Paper>
                            )}
                        </>
                    )}
                </Box>
            </Box>
        </Box >
    );
};

export default QueryBuilder;
